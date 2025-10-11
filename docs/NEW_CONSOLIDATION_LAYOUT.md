# New Consolidation Workings Layout

## Overview

The consolidation workings page has been completely redesigned to follow the **columnar consolidation format** used in professional consolidation workpapers.

---

## New Layout Structure

### Column Layout

```
┌─────────────────┬──────────┬──────────┬──────────┬──────────────┬─────────────┬──────────────┐
│ Chart of        │ Entity 1 │ Entity 2 │ Entity 3 │ Eliminations │ Adjustments │ Consolidated │
│ Accounts        │          │          │          │              │             │              │
├─────────────────┼──────────┼──────────┼──────────┼──────────────┼─────────────┼──────────────┤
│ Assets          │    -     │    -     │    -     │      -       │      -      │      -       │
│   Current       │          │          │          │              │             │              │
│     Cash        │  100,000 │   50,000 │   30,000 │       0      │      0      │   180,000    │
│     AR          │   75,000 │   40,000 │   20,000 │  (10,000)    │   5,000     │   130,000    │
└─────────────────┴──────────┴──────────┴──────────┴──────────────┴─────────────┴──────────────┘
```

### Key Features

1. **Fixed Left Column**: Chart of Accounts (scrollable vertically, fixed horizontally)
2. **Dynamic Entity Columns**: One column per active entity
3. **Elimination Column**: Shows elimination entries (red background)
4. **Adjustment Column**: Shows adjustment entries (blue background)
5. **Fixed Right Column**: Consolidated totals (scrollable vertically, fixed horizontally)

---

## How It Works

### 1. Data Loading

**On page load or period/statement change:**

```javascript
// Loads all necessary data in parallel
- reporting_periods (for period dropdown)
- entities (for entity columns)
- chart_of_accounts (for account details)
- coa_master_hierarchy (for hierarchy structure)
- trial_balance (for entity values)
- eliminations (for elimination entries)
- builder_entries (for adjustment entries)
```

### 2. COA Hierarchy Building

**Automatic 4-level hierarchy:**

```
Class (Assets, Liabilities, Equity, Income, Expenses)
  └─ Subclass (Current Assets, Non-current Assets, etc.)
      └─ Note (Cash & Cash Equivalents, etc.)
          └─ Subnote (Cash on Hand, Bank Accounts, etc.)
              └─ Accounts (1000, 1010, etc.)
```

**Filtered by statement type:**
- Balance Sheet: Assets, Liabilities, Equity
- Income Statement: Income, Expenses
- Equity: Equity
- Cash Flow: Assets (cash accounts)

### 3. Value Population

**Entity Columns:**
```javascript
// For each account in the COA line
// Find trial balance entries matching:
// - account_code
// - entity_id
// - period

// Calculate value:
if (className === 'Assets' || className === 'Expenses') {
  value = debit - credit  // Normal debit balance
} else {
  value = credit - debit  // Normal credit balance
}
```

**Elimination Column:**
```javascript
// Find elimination entries matching:
// - account_code
// - period

// Sum debit/credit based on account class
// Displayed in red with drill-down capability
```

**Adjustment Column:**
```javascript
// Find builder entries matching:
// - account_code
// - period

// Sum debit/credit based on account class
// Displayed in blue with drill-down capability
```

**Consolidated Column:**
```javascript
// Formula:
Consolidated = Σ(All Entities) + Eliminations + Adjustments

// Example:
// Entity A: 100,000
// Entity B: 50,000
// Entity C: 30,000
// Elimination: (10,000)  // Intercompany receivable
// Adjustment: 5,000      // Fair value adjustment
// Consolidated: 175,000
```

---

## User Interface

### Control Panel

**Period Selector:**
- Dropdown showing all available reporting periods
- Changing period reloads all data automatically

**Statement Selector:**
- Balance Sheet
- Income Statement
- Statement of Equity
- Cash Flow

**Action Buttons:**
- **Save**: Save current view/edits
- **Export**: Export to Excel/PDF

### Main Table

**Sticky Elements:**
- Header row (stays visible when scrolling vertically)
- First column (COA - stays visible when scrolling horizontally)
- Last column (Consolidated - stays visible when scrolling horizontally)

**Expandable Rows:**
- Click chevron icon to expand/collapse hierarchy levels
- Default: All rows expanded
- Remembers expansion state during session

**Visual Hierarchy:**
- **Class level**: Dark background (#101828), white text, bold
- **Subclass level**: Light grey background, semibold
- **Note level**: White background, normal weight
- **Subnote level**: Very light grey, smaller text

**Account Count:**
- Shows number of accounts in each line: `(3)` = 3 accounts

### Interactive Features

**Elimination Drill-Down:**
- Click any elimination value to see detail
- Modal shows:
  - Elimination entry description
  - Dr/Cr accounts
  - Amount breakdown
  - Entry date and created by

**Adjustment Drill-Down:**
- Click any adjustment value to see detail
- Modal shows:
  - Adjustment entry description
  - Dr/Cr accounts
  - Amount breakdown
  - Entry date and created by

---

## Data Flow Diagram

```
Trial Balance Upload
  ↓
[trial_balance table]
  ├─ Entity A data
  ├─ Entity B data
  └─ Entity C data
  ↓
COA Master Hierarchy → Builds structure
  ↓
Consolidation Page
  ├─ Loads TB data
  ├─ Loads eliminations
  ├─ Loads adjustments
  ↓
Displays in columns:
Entity A | Entity B | Entity C | Elim | Adj | = Consolidated
```

---

## Benefits of New Layout

### 1. **Industry Standard Format**
- Matches professional consolidation workpapers
- Familiar to accountants and auditors
- Clear audit trail

### 2. **Multi-Entity Visibility**
- See all entities side-by-side
- Easy to spot discrepancies
- Quick comparison of entity values

### 3. **Clear Consolidation Formula**
- Transparent calculation
- Shows elimination/adjustment impact
- Easy to verify consolidated totals

### 4. **Drill-Down Capability**
- Click any elimination to see detail
- Click any adjustment to see detail
- Full audit trail

### 5. **Dynamic Entity Support**
- Automatically adds columns for new entities
- No hardcoded entity limits
- Supports complex group structures

### 6. **Period Toggle**
- Easy period comparison
- Switch periods without losing place
- Real-time data refresh

---

## Example Scenarios

### Scenario 1: Simple Parent-Subsidiary

**Setup:**
- Parent Corp (USA)
- Subsidiary A (UK)
- 100% ownership

**Table View:**
```
                    Parent    Sub A    Elim      Adj     Consol
Cash                100,000   50,000      0        0    150,000
Investment in Sub   200,000        0  (200,000)    0          0
Share Capital       500,000  200,000  (200,000)    0    500,000
```

### Scenario 2: Complex Group with Intercompany

**Setup:**
- Parent Corp
- Sub A (70% owned)
- Sub B (100% owned)
- Intercompany transactions

**Table View:**
```
                    Parent    Sub A    Sub B    Elim      Adj     Consol
Trade Receivables   100,000   50,000   30,000  (20,000)    0    160,000
  ↑ Intercompany AR                           (20,000)  [click to see detail]

Revenue             500,000  300,000  200,000  (50,000)    0    950,000
  ↑ Intercompany sales                        (50,000)  [eliminates double-count]
```

### Scenario 3: Fair Value Adjustments

**Setup:**
- Acquisition with PPE fair value step-up
- Need to adjust subsidiary assets to fair value

**Table View:**
```
                    Parent    Sub A    Elim     Adj       Consol
Buildings           200,000  100,000      0    50,000    350,000
                                                ↑
                                          Fair value
                                          step-up
```

---

## Technical Details

### Performance Optimizations

1. **Memoized Calculations**: Value calculations cached per render
2. **Lazy Row Rendering**: Only visible rows rendered
3. **Parallel Data Loading**: All queries run in parallel
4. **Indexed Lookups**: Trial balance indexed by account_code and entity_id

### Responsive Design

- Horizontal scroll for many entities
- Sticky first/last columns
- Minimum column widths (140px entities, 160px consolidated)
- Mobile-friendly (scrollable)

### Browser Compatibility

- Sticky positioning (modern browsers)
- Flexbox layout
- CSS Grid for table structure

---

## Migration from Old Layout

### Old Layout (Tab-Based)
```
Tabs: Balance Sheet | Income Statement | Equity | Cash Flow
  ↓ Select tab
  ↓ See single consolidated view
  ↓ Click account to see breakdown
```

### New Layout (Columnar)
```
Dropdowns: Period | Statement
  ↓ Select options
  ↓ See all entities + consolidated
  ↓ Click elimination/adjustment for detail
```

### Key Differences

| Feature | Old Layout | New Layout |
|---------|-----------|------------|
| Entity visibility | Hidden (drill-down) | Visible (columns) |
| Consolidation formula | Opaque | Transparent |
| Eliminations | Buried in notes | Dedicated column |
| Adjustments | Separate page | Integrated column |
| Navigation | Tab-based | Dropdown-based |
| Export | PDF only | Excel + PDF |

---

## Future Enhancements

### Planned Features

1. **Inline Editing**: Edit values directly in table
2. **Variance Analysis**: Add prior period columns
3. **Budget Comparison**: Add budget columns
4. **Roll-forward**: Link opening/closing balances
5. **Notes Integration**: Click account to see note disclosure
6. **Export Mapping**: Direct export to Excel consolidation template
7. **Version Control**: Save/restore consolidation versions
8. **Approval Workflow**: Submit for review/approval

### Data Enhancements

1. **Currency Translation**: Show functional → presentation currency
2. **NCI Calculation**: Show NCI column for <100% ownership
3. **Goodwill Tracking**: Separate goodwill calculation
4. **Intercompany Matching**: Auto-match intercompany balances
5. **Variance Explanations**: Add variance commentary

---

## Troubleshooting

### Issue: No entities showing

**Check:**
```sql
SELECT * FROM entities WHERE is_active = true;
```
Ensure you have active entities created.

### Issue: No values in entity columns

**Check:**
```sql
SELECT * FROM trial_balance WHERE period = '2024-12-31';
```
Ensure trial balance uploaded for the period.

### Issue: Wrong account hierarchy

**Check:**
```sql
SELECT * FROM coa_master_hierarchy WHERE is_active = true;
SELECT * FROM chart_of_accounts WHERE is_active = true;
```
Ensure COA properly linked to hierarchy.

### Issue: Eliminations not showing

**Check:**
```sql
SELECT * FROM eliminations WHERE period = '2024' AND is_active = true;
```
Ensure eliminations entered for the period.

---

## Summary

The new columnar layout provides:

✅ **Professional Format**: Industry-standard consolidation workpaper
✅ **Full Visibility**: See all entities side-by-side
✅ **Transparent Formula**: Clear consolidation calculation
✅ **Integrated Eliminations**: Dedicated column with drill-down
✅ **Integrated Adjustments**: Dedicated column with drill-down
✅ **Dynamic Entities**: Auto-adjusts for entity count
✅ **Period Toggle**: Easy period selection
✅ **Real-time Data**: Auto-populates from trial balance
✅ **Audit Trail**: Full drill-down capability

This is now a **production-ready consolidation workings module**!
