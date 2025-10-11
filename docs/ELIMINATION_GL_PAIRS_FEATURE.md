# Elimination GL Pairs Feature - Implementation Guide

## Overview

This feature enables users to configure GL pairs for automated elimination entries in the financial consolidation system. It includes:

1. **GL Pairs Configuration** - Set up pairs of GL accounts across entities that should be eliminated together
2. **Automated JE Population** - Auto-populate journal entry lines from configured pairs
3. **Difference Handling** - Automatically calculate and post differences to a specified GL account
4. **Full Journal Entry Support** - Create manual elimination entries with multiple lines

## Database Setup

### Step 1: Run the SQL Migration

Execute the SQL script to create the required tables:

```bash
Location: sql/CREATE_ELIMINATION_GL_PAIRS.sql
```

This will create three tables:

1. **elimination_gl_pairs** - Stores GL pair configurations
   - id, company_id, pair_name, description
   - gl1_entity, gl1_code, gl2_entity, gl2_code
   - difference_gl_code, is_active
   - created_at, updated_at

2. **elimination_entries** - Stores elimination journal entry headers
   - id, company_id, entry_name, entry_date, description
   - total_debit, total_credit, is_posted
   - created_by, created_at, updated_at

3. **elimination_entry_lines** - Stores individual JE lines
   - id, entry_id, entity_id, gl_code, gl_name
   - debit, credit, line_number
   - created_at

The script also:
- Creates indexes for performance
- Sets up Row-Level Security (RLS) policies
- Ensures proper foreign key relationships with CASCADE deletes

### Step 2: Verify Tables Created

Run this query in Supabase to verify:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_name IN ('elimination_gl_pairs', 'elimination_entries', 'elimination_entry_lines');
```

## API Endpoints

### GL Pairs API (`/api/elimination-pairs`)

**GET** - Fetch all GL pairs for the user's company
- Response: Array of GL pair objects

**POST** - Create a new GL pair
- Body: `{ pair_name, description, gl1_entity, gl1_code, gl2_entity, gl2_code, difference_gl_code }`
- Response: Created GL pair object

**PATCH** - Update an existing GL pair
- Body: `{ id, pair_name, description, gl1_entity, gl1_code, gl2_entity, gl2_code, difference_gl_code }`
- Response: Updated GL pair object

**DELETE** - Delete (soft delete) a GL pair
- Query: `?id={pairId}`
- Response: `{ success: true }`

### Elimination Entries API (`/api/elimination-entries`)

**GET** - Fetch all elimination entries with their lines
- Response: Array of elimination entry objects with nested lines

**POST** - Create a new elimination entry
- Body: `{ entry_name, entry_date, description, lines: [{ entity_id, gl_code, gl_name, debit, credit }] }`
- Response: Created elimination entry with lines

**DELETE** - Delete an elimination entry and its lines
- Query: `?id={entryId}`
- Response: `{ success: true }`

## Feature Walkthrough

### 1. Create a GL Pair

Navigate to **Eliminations** page → **GL Pairs** tab → **Create GL Pair**

**Example: Share Capital vs Investment**

1. **Pair Name**: "Share Capital vs Investment"
2. **Description**: "Eliminate parent investment against subsidiary share capital"
3. **GL 1**:
   - Entity: Subsidiary Entity
   - GL Account: Share Capital (e.g., 3100)
4. **GL 2**:
   - Entity: Parent Entity
   - GL Account: Investment in Subsidiary (e.g., 1500)
5. **Difference GL**: Goodwill (e.g., 1450) or Retained Earnings (e.g., 3300)

### 2. View GL Pair with Current Balances

After creating, the pair card displays:
- **GL 1 Balance**: 20,000 Cr (from trial balance)
- **GL 2 Balance**: 18,000 Dr (from trial balance)
- **Difference**: 2,000 (calculated automatically)
- **Difference GL**: Where the 2,000 will be posted

### 3. Create Elimination Entry from Pair

Click **"Create Elimination Entry"** on the GL pair card.

The Journal Entry modal opens with lines pre-populated:

```
Entry Name: Share Capital vs Investment
Date: 2024-10-11

Line 1: Subsidiary Entity | Share Capital | Debit: 18,000 | Credit: 0
Line 2: Parent Entity     | Investment    | Debit: 0      | Credit: 18,000
Line 3: Parent Entity     | Goodwill      | Debit: 2,000  | Credit: 0

Total Debit:  20,000
Total Credit: 20,000
Status: ✓ Balanced
```

### 4. Manual Journal Entry Creation

Click **"Create Manual JE"** to create elimination entries from scratch:

1. **Entry Name**: Required (e.g., "Intercompany Loan Elimination")
2. **Date**: Required (default: today)
3. **Description**: Optional

**Add Lines**:
- Click "+ Add Line" to add more lines
- Select Entity → GL Account (dropdown filters by entity)
- Enter Debit OR Credit (entering one clears the other)
- View current GL balance in the "Balance" column
- Remove line with trash icon (minimum 2 lines required)

**Real-time Validation**:
- Total Debit and Credit calculated live
- "Balanced" indicator shows green when Dr = Cr
- "Out of Balance" indicator shows red with difference amount
- Post button disabled until balanced

### 5. View Posted Elimination Entries

Navigate to **Elimination Entries** tab to see all posted entries:

Table displays:
- Entry Name
- Description
- Date
- Total Debit
- Total Credit
- Number of Lines
- Delete action

## Technical Implementation Details

### Entity-First Selection Pattern

The GL dropdown is filtered based on the selected entity:

```javascript
const getAvailableGLsForEntity = (entityId) => {
  if (!entityId) return [];
  const uniqueGLCodes = [...new Set(
    trialBalances
      .filter(tb => tb.entity_id === entityId)
      .map(tb => tb.account_code)
  )];
  return glAccounts.filter(gl => uniqueGLCodes.includes(gl.account_code));
};
```

This ensures users only see GLs that exist in the selected entity's trial balance.

### GL Balance Calculation

```javascript
const getGLBalance = (glCode, entityId) => {
  const tbEntries = trialBalances.filter(
    tb => tb.account_code === glCode && tb.entity_id === entityId
  );

  let totalDebit = 0;
  let totalCredit = 0;

  tbEntries.forEach(tb => {
    totalDebit += parseFloat(tb.debit || 0);
    totalCredit += parseFloat(tb.credit || 0);
  });

  const netBalance = totalDebit - totalCredit;
  const balanceType = netBalance >= 0 ? 'Dr' : 'Cr';
  const absBalance = Math.abs(netBalance);

  return { net: absBalance, type: balanceType, debit: totalDebit, credit: totalCredit };
};
```

### Auto-Population Logic for GL Pairs

When user clicks "Create Elimination Entry" on a pair:

1. **Fetch Current Balances**: Get GL1 and GL2 balances from trial balance
2. **Calculate Elimination Amount**: `Math.min(gl1Balance.net, gl2Balance.net)`
3. **Calculate Difference**: `Math.abs(gl1Balance.net - gl2Balance.net)`
4. **Create JE Lines**:
   - Line 1: Offset GL1 balance (reverse the Dr/Cr)
   - Line 2: Offset GL2 balance (reverse the Dr/Cr)
   - Line 3: Post difference to difference GL (if specified)

### Smart Dr/Cr Entry

When entering amounts in the JE:

```javascript
if (field === 'debit' && value > 0) {
  newLines[index].credit = 0; // Clear credit when entering debit
}

if (field === 'credit' && value > 0) {
  newLines[index].debit = 0; // Clear debit when entering credit
}
```

This prevents data entry errors and ensures clean entries.

### Real-Time Balance Validation

```javascript
const calculateJETotals = () => {
  let totalDebit = 0;
  let totalCredit = 0;

  jeForm.lines.forEach(line => {
    totalDebit += parseFloat(line.debit || 0);
    totalCredit += parseFloat(line.credit || 0);
  });

  const difference = totalDebit - totalCredit;
  const isBalanced = Math.abs(difference) < 0.01;

  return { totalDebit, totalCredit, difference, isBalanced };
};
```

Post button is disabled when `!isBalanced`.

## Security

All API endpoints use:
- Session token authentication
- Company-level data isolation
- Entity ownership verification
- RLS policies on database tables

Example from `/api/elimination-pairs`:

```javascript
const payload = await verifySessionToken(token);

// Verify entities belong to user's company
const { data: entities } = await supabaseAdmin
  .from('entities')
  .select('id, company_id')
  .in('id', [gl1_entity, gl2_entity]);

const unauthorized = entities?.some(e => e.company_id !== payload.companyId);
if (unauthorized) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}
```

## Example Use Cases

### Use Case 1: Simple Intercompany Elimination

**Scenario**: Parent owns 100% of Subsidiary

- Parent: Investment in Sub = 10,000 Dr
- Subsidiary: Share Capital = 10,000 Cr

**GL Pair Setup**:
- GL1: Sub → Share Capital
- GL2: Parent → Investment
- Difference GL: None (balances match exactly)

**Auto-Generated JE**:
```
Dr Share Capital (Sub)        10,000
  Cr Investment (Parent)              10,000
```

### Use Case 2: Elimination with Goodwill

**Scenario**: Parent paid 25,000 for 100% of Subsidiary with 20,000 equity

- Parent: Investment = 25,000 Dr
- Subsidiary: Share Capital = 20,000 Cr
- Difference: 5,000 → Goodwill

**GL Pair Setup**:
- GL1: Sub → Share Capital
- GL2: Parent → Investment
- Difference GL: Goodwill (1450)

**Auto-Generated JE**:
```
Dr Share Capital (Sub)        20,000
Dr Goodwill (Parent)           5,000
  Cr Investment (Parent)              25,000
```

### Use Case 3: Intercompany Loan

**Scenario**: Parent lent 50,000 to Subsidiary

- Parent: Loan Receivable = 50,000 Dr
- Subsidiary: Loan Payable = 50,000 Cr

**GL Pair Setup**:
- GL1: Sub → Loan Payable
- GL2: Parent → Loan Receivable
- Difference GL: None

**Auto-Generated JE**:
```
Dr Loan Payable (Sub)         50,000
  Cr Loan Receivable (Parent)        50,000
```

## Troubleshooting

### GL Pair Not Showing Balances

**Issue**: Balances show as 0

**Solution**:
1. Verify trial balance data exists for the period
2. Check entity_id matches between trial balance and entities
3. Ensure GL codes match exactly (case-sensitive)
4. Refresh the page to reload trial balance data

### Journal Entry Not Posting

**Issue**: Post button disabled or error on post

**Checklist**:
- ✓ Entry name filled in
- ✓ All lines have entity and GL selected
- ✓ All lines have either debit or credit amount
- ✓ Total debit equals total credit (balanced)
- ✓ At least 2 lines present

### Entities Not Appearing in Dropdown

**Issue**: Entity dropdown empty

**Solution**:
1. Check entities exist for the company
2. Verify RLS policies allow reading entities
3. API endpoint `/api/entities` should return data
4. Check browser console for errors

### GL Accounts Not Filtering by Entity

**Issue**: All GLs showing regardless of entity

**Solution**:
1. Ensure trial balance data loaded (check `trialBalances` state)
2. Verify GL codes in trial balance match COA
3. Check `getAvailableGLsForEntity()` function
4. Select entity first, then GL will filter

## Future Enhancements

Potential improvements:

1. **Bulk Pair Creation**: Upload CSV with multiple GL pairs
2. **Elimination Templates**: Save JE patterns as reusable templates
3. **Automatic Posting**: Schedule automatic elimination entry creation
4. **Multi-Currency Support**: Handle FX differences in eliminations
5. **Audit Trail**: Track all changes to pairs and entries
6. **Reverse Entries**: One-click reversal of elimination entries
7. **Reporting**: Elimination journal entry report export
8. **Approval Workflow**: Require approval before posting eliminations

## Support

For issues or questions:
1. Check the browser console for errors
2. Review API logs in terminal (`npm run dev` output)
3. Verify database tables and RLS policies
4. Check authentication session is valid

## Summary

The Elimination GL Pairs feature provides a powerful, user-friendly way to manage consolidation eliminations:

✓ Configure recurring elimination pairs once
✓ Auto-generate balanced journal entries
✓ Handle differences automatically
✓ Full manual JE support for complex scenarios
✓ Real-time validation and balance checking
✓ Secure, company-isolated data access

This eliminates manual calculation errors and significantly speeds up the consolidation process.
