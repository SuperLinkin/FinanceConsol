# Chart of Accounts & Eliminations Page Updates

## Overview
Comprehensive updates to Chart of Accounts and Eliminations pages to support GL-level elimination tagging, missing taggings tracking, and inter-entity elimination mapping.

---

## Part 1: Chart of Accounts Page Updates

### 1. To Be Eliminated Column

**Features Added:**
- New "To Eliminate" column in the GL accounts table
- Interactive checkbox in each row for quick marking/unmarking
- Checkbox in Add/Edit modal for new account creation
- Real-time database updates when checkbox is toggled
- Toast notifications confirming changes

**How It Works:**
- Click checkbox in table to instantly mark/unmark GL for elimination
- Status updates immediately in database (`to_be_eliminated` field)
- Marked GLs automatically appear in Eliminations page

### 2. Missing Taggings Section

**Features:**
- **Warning Section**: Displays prominently when GLs have incomplete tagging
- **Count Badge**: Shows total number of GLs with missing data
- **Missing Fields Detection**: Checks for missing:
  - Class Name
  - Sub-Class Name
  - Note Name
  - Sub-Note Name
- **Quick Fix**: "Complete Tagging" button opens edit modal for each GL
- **Visual Indicators**: Red "Missing" labels for empty fields
- **Auto-hide**: Section only shows when there are incomplete GLs

**Location:** Above the main GL accounts table

### 3. Upload Template Enhancement

**New Column:** "To Be Eliminated"

**Accepted Values:**
- Y / N
- Yes / No
- TRUE / FALSE
- 1 / 0
- Case-insensitive

**Template Structure:**
```
GL Code | GL Name | Class | Sub-Class | Note | Sub-Note | To Be Eliminated | Active
1000    | Cash    | Assets| Current   | CA   | Cash     | N                | Y
2100    | IC Loan | Liab  | IC        | IC   | Loans    | Y                | Y
```

### 4. Upload Logic

**Enhancements:**
- Parses "To Be Eliminated" column from Excel
- Converts Y/N/TRUE/FALSE/1/0 to boolean
- Defaults to `false` if column empty or missing
- Saves to `to_be_eliminated` field in database
- Full backward compatibility with old templates

---

## Part 2: Eliminations Page Complete Redesign

### Removed Features:
- Template-based elimination workflow
- ELIMINATION_TEMPLATES array
- Pre-defined elimination entry types

### New Architecture: Two-Section Design

---

## Section 1: GL Accounts Marked for Elimination

### Purpose
Manage eliminations for GLs tagged in Chart of Accounts (`to_be_eliminated = true`)

### Key Features

#### Summary Dashboard
- Count of tagged GLs
- Count of active mappings
- Total elimination impact (sum of all elimination amounts)
- Gradient styling for visual appeal

#### Tagged GL Cards
Each tagged GL displays in an expandable card showing:

**GL Header:**
- Account code and name
- Full 4-level hierarchy (Class > Sub-Class > Note > Sub-Note)
- "Map Between Entities" button

**Entity Balances Grid:**
- Shows current GL balance in ALL entities
- Grid layout for easy comparison
- Blue highlight for non-zero balances
- Gray styling for zero balances
- Data fetched from `trial_balance` table

**Existing Elimination Mappings:**
- List of all mappings for this GL
- Shows From Entity → To Entity
- Displays elimination amount
- **Balance Validation:**
  - Green badge + "Balanced" if inter-entity balances net to zero
  - Red badge + "Unbalanced" if balances don't match
- Delete functionality for each mapping
- Notes display if present

**Empty State:**
- Guides users to Chart of Accounts to mark GLs
- Clear instructions with icon

### Mapping Modal

**Opens when:** User clicks "Map Between Entities"

**Fields:**
- From Entity (dropdown with all active entities)
- To Entity (dropdown excluding selected From Entity)
- Shows current GL balance for each selected entity
- Elimination Amount input
- Notes (optional)

**Validation:**
- Ensures From Entity ≠ To Entity
- Requires valid amount > 0
- Shows real-time balance preview

**Data Storage:** `intercompany_transactions` table

---

## Section 2: Custom Elimination Entries

### Purpose
Create elimination journal entries from scratch (not based on tagged GLs)

### Key Features

#### Add Custom Elimination Button
- Opens modal for manual entry creation
- Located at top of section

#### Custom Entries Table

**Columns:**
- Entry Name / Description
- From Entity
- To Entity
- Debit Account (with GL name)
- Credit Account (with GL name)
- Amount
- Actions (Delete)

**Empty State:**
- Clear messaging when no entries exist
- Guides user to create first entry

### Custom Entry Modal

**Fields:**
- Entry Name * (required)
- Description
- From Entity * (dropdown)
- To Entity * (dropdown, excludes From Entity)
- Debit Account * (dropdown of all active GLs with codes + names)
- Credit Account * (dropdown of all active GLs with codes + names)
- Amount * (numeric input)
- Notes (optional)

**Validation:**
- All required fields must be filled
- From Entity ≠ To Entity
- Amount > 0
- Debit and Credit accounts must be selected

**Data Storage:** `elimination_entries` table

---

## UI/UX Enhancements

### Consistent Design
- Beige background (#f7f5f2)
- Navy headers (#101828)
- Uses PageHeader component
- Tab-based navigation between sections
- Modal dialogs for data entry

### Color Coding
- **Green**: Balanced eliminations, success states
- **Red**: Unbalanced eliminations, errors, warnings
- **Blue**: Active balances, info states
- **Gray**: Zero balances, neutral states

### Interactive Elements
- Toast notifications for all CRUD operations
- Real-time balance calculations
- Entity dropdown filtering (excludes selected entity)
- Hover effects on cards and buttons
- Loading states (implicit via toast)

---

## Database Structure

### Tables Used

#### 1. `chart_of_accounts`
- **New Column:** `to_be_eliminated` (boolean, default false)
- **Index:** On `to_be_eliminated` for fast filtering
- Stores GL tagging for elimination

#### 2. `intercompany_transactions`
- Stores GL-to-GL mappings between entities
- Fields:
  - `transaction_type`: 'Elimination Mapping'
  - `from_entity_id`, `to_entity_id`
  - `from_account`, `to_account` (GL codes)
  - `amount`
  - `is_eliminated`: false (for active mappings)
  - `notes`

#### 3. `elimination_entries`
- Stores custom elimination journal entries
- Fields:
  - `entry_number`: Auto-generated (ELIM-timestamp)
  - `description`: Entry name
  - `elimination_type`: 'Custom Entry'
  - `debit_account`, `credit_account` (GL codes)
  - `amount`
  - `entity_from`, `entity_to` (entity IDs)
  - `status`: 'Draft'
  - `notes`
  - `created_by`, `created_at`

#### 4. `trial_balance`
- Used for real-time GL balance display
- Queried by `account_code` and `entity_id`

---

## SQL Migration Required

**File:** `sql/ADD_TO_BE_ELIMINATED_COLUMN.sql`

```sql
ALTER TABLE public.chart_of_accounts
ADD COLUMN IF NOT EXISTS to_be_eliminated boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_coa_to_be_eliminated
ON public.chart_of_accounts(to_be_eliminated)
WHERE to_be_eliminated = true;
```

**Run this in Supabase before using the new features.**

---

## Key Workflows

### Workflow 1: Tag and Map GLs for Elimination

1. Go to **Chart of Accounts**
2. Check "To Eliminate" checkbox for relevant GLs (e.g., intercompany accounts)
3. Go to **Eliminations** page
4. Navigate to **"GL Accounts Marked for Elimination"** tab
5. See all tagged GLs with entity balances
6. Click **"Map Between Entities"** for a GL
7. Select From Entity and To Entity
8. Review balances shown for each entity
9. Enter elimination amount
10. Click **"Create Mapping"**
11. Mapping appears in GL card with Balanced/Unbalanced status

### Workflow 2: Create Custom Elimination Entry

1. Go to **Eliminations** page
2. Navigate to **"Custom Elimination Entries"** tab
3. Click **"Add Custom Elimination"**
4. Fill in entry details:
   - Entry Name
   - From/To Entities
   - Debit/Credit accounts (any GLs, not just tagged ones)
   - Amount
5. Click **"Create Entry"**
6. Entry appears in table

### Workflow 3: Fix Missing GL Taggings

1. Go to **Chart of Accounts**
2. See red warning section: "GLs with Incomplete Tagging"
3. Review which fields are missing (shows "Missing" in red)
4. Click **"Complete Tagging"** for a GL
5. Edit modal opens with pre-filled data
6. Fill in missing Class/Sub-Class/Note/Sub-Note
7. Save
8. GL removed from warning section

---

## Files Modified

1. **`app/chart-of-accounts/page.js`**
   - Added `to_be_eliminated` checkbox to table
   - Added `to_be_eliminated` to modal form
   - Added missing taggings section with `getMissingTaggings()` function
   - Updated upload template generation
   - Enhanced upload parsing logic

2. **`app/eliminations/page.js`**
   - Complete redesign from scratch
   - Two-tab architecture
   - GL mapping functionality
   - Custom entry creation
   - Real-time balance display
   - Balance validation logic

3. **`sql/ADD_TO_BE_ELIMINATED_COLUMN.sql`** (new file)
   - Database migration script

---

## Benefits

### For Users:
- **Faster workflow**: Mark GLs for elimination directly in COA
- **Better visibility**: See which GLs need complete tagging
- **Real-time balances**: See GL balances across entities before creating eliminations
- **Validation**: Automatic check if elimination mappings are balanced
- **Flexibility**: Choose between tagged GL mapping or custom entries
- **Traceability**: Clear record of all elimination mappings and entries

### For Consolidation:
- **IFRS Compliant**: Proper tracking of intercompany eliminations
- **Audit Trail**: All eliminations stored in database with timestamps
- **Entity-level**: Eliminations tracked per entity pair
- **GL-level**: Detailed mapping at account level
- **Balanced Checking**: Ensures eliminations balance between entities

---

## Testing Checklist

### Chart of Accounts:
- [ ] Mark GL as "To Be Eliminated" via checkbox in table
- [ ] Mark GL as "To Be Eliminated" via modal form
- [ ] Upload Excel with "To Be Eliminated" column (Y/N values)
- [ ] Verify missing taggings section shows incomplete GLs
- [ ] Click "Complete Tagging" and fill missing fields
- [ ] Verify missing GL removed from warning after tagging

### Eliminations - Tagged GLs:
- [ ] Tagged GLs appear in first tab
- [ ] Entity balances display correctly
- [ ] Create mapping between two entities
- [ ] Verify balanced/unbalanced status shows correctly
- [ ] Delete a mapping
- [ ] Verify validation prevents same-entity mapping

### Eliminations - Custom Entries:
- [ ] Create custom elimination entry
- [ ] Select debit/credit accounts from dropdowns
- [ ] Verify entry appears in table
- [ ] Delete custom entry
- [ ] Verify validation works (required fields, entity validation)

### Integration:
- [ ] Mark GL in COA, verify it appears in Eliminations
- [ ] Verify summary dashboard shows correct counts
- [ ] Verify total impact calculates correctly
- [ ] Test with multiple entities and multiple GLs

---

## Next Enhancements (Future)

1. **Bulk Mapping**: Map multiple GLs at once between same entity pair
2. **Elimination Templates**: Save common elimination patterns
3. **Period Selection**: Filter mappings and entries by period
4. **Reversal Entries**: Auto-generate reversal eliminations
5. **Export**: Export elimination reports to Excel
6. **Status Workflow**: Draft → Review → Approved states
7. **Batch Processing**: Process all mappings for a period
8. **Reconciliation**: Auto-reconcile intercompany balances
