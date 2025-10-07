# Group Reporting Currency Feature - Implementation Summary

## Overview

Implemented a comprehensive group reporting currency (base currency) management system that ensures currency consistency across the consolidation process.

## Key Features Implemented

### 1. Group Reporting Currency Selection (Settings Page)

**Location**: `app/settings/page.js` - Currencies Tab

**Features**:
- ⭐ **Special checkbox** to mark a currency as "Group Reporting Currency (Base)"
- **Exclusive selection**: Only ONE currency can be marked as group reporting currency
- **Prominent visual indicator**: Amber-colored checkbox with star icon
- **Database constraint**: Unique partial index ensures only one currency has this flag

**UI Elements**:
- Amber-highlighted checkbox in currency form
- Badge showing "★ BASE / GROUP REPORTING" on the selected currency
- Button on other currencies: "Set as Group Reporting Currency"
- Visual distinction with amber border and background for selected currency

**Database Changes**:
- Added `is_group_reporting_currency BOOLEAN` column to `currencies` table
- Created unique partial index to enforce single-currency constraint
- Migration file: `sql/08_ADD_GROUP_REPORTING_CURRENCY.sql`

### 2. Bulk Upload - Read-Only Base Currency Display

**Location**: `app/upload/page.js` - Bulk Upload Section

**Features**:
- Automatically fetches and displays the group reporting currency
- **Read-only display** - user cannot change it
- Prominent warning box explaining all amounts must be in this currency
- Link to Consolidation Config if no base currency is set

**UI Display**:
```
┌─────────────────────────────────────────────────┐
│ ⚠ Important: Currency Consistency               │
│                                                  │
│ All amounts in the bulk upload file must be in  │
│ the group reporting currency (base currency).   │
│                                                  │
│ Group Reporting Currency (Base): [USD $]        │
│                                                  │
│ ⓘ All amounts must be in USD. This is          │
│   configured in Consolidation Config.           │
└─────────────────────────────────────────────────┘
```

### 3. Single Entity Upload - Currency Selection & Validation

**Location**: `app/upload/page.js` - Single Entity Upload Section

**Features Added**:

#### a) Entity Dropdown Enhancement
- Shows entity's functional currency in parentheses
- Example: "Parent Company (USD)"
- Displays selected entity's currency below dropdown

#### b) Currency Selection Dropdown
- **Required field** for upload
- Shows group reporting currency first (if set)
- Lists all unique functional currencies from entities
- Descriptive helper text

#### c) Currency Mismatch Warning
- **Automatic detection** when selected currency ≠ entity's functional currency
- **Prominent amber warning box** with:
  - Warning icon
  - Clear explanation of the mismatch
  - Entity name and both currencies highlighted
  - Guidance on potential consolidation issues

**Mismatch Warning Example**:
```
┌─────────────────────────────────────────────────┐
│ ⚠️ Currency Mismatch Warning                    │
│                                                  │
│ You are uploading a trial balance in AUD but   │
│ the entity Parent Company is configured with    │
│ functional currency USD.                         │
│                                                  │
│ ⓘ This may cause consolidation issues. Ensure  │
│   currency translation is configured properly   │
│   or upload in the entity's functional currency.│
└─────────────────────────────────────────────────┘
```

#### d) Upload Button Validation
- Disabled until BOTH entity AND currency are selected
- Helper text below button if validation fails
- Currency stored with trial balance record

## User Flow

### Setting Up Group Reporting Currency

1. **Navigate to**: Dashboard → Consolidation Config → Currencies tab
2. **Add currencies**: Select currencies from dropdown (e.g., USD, EUR, GBP)
3. **Mark base currency**: Check "★ Group Reporting Currency (Base)" for ONE currency
4. **Visual confirmation**: Currency card shows amber border and "★ BASE / GROUP REPORTING" badge
5. **Change base currency**: Click "Set as Group Reporting Currency" on any other currency

### Bulk Upload Workflow

1. **Navigate to**: Dashboard → Upload Data
2. **Select**: "Bulk Upload (All Entities)" toggle
3. **View base currency**: System displays current group reporting currency (read-only)
4. **Warning displayed**: Amber box reminds all amounts must be in base currency
5. **Download template**: Pre-filled with actual entity codes
6. **Fill template**: Enter amounts in group reporting currency only
7. **Upload**: System validates and inserts records

### Single Entity Upload Workflow

1. **Navigate to**: Dashboard → Upload Data
2. **Select**: "Single Entity Upload" toggle (default)
3. **Select entity**: Dropdown shows entity name and functional currency
4. **System displays**: "Entity currency: USD" below dropdown
5. **Select currency**: Choose currency of the trial balance file
6. **Mismatch detection**: If currency ≠ entity currency, amber warning appears
7. **Review warning**: User sees clear explanation of potential issues
8. **Proceed or change**: User can continue with warning or change currency
9. **Upload**: Currency stored with each record

## Technical Implementation

### Database Schema

```sql
-- currencies table
ALTER TABLE currencies
ADD COLUMN is_group_reporting_currency BOOLEAN DEFAULT FALSE;

-- Ensure only one currency is marked as group reporting
CREATE UNIQUE INDEX idx_unique_group_reporting_currency
ON currencies (is_group_reporting_currency)
WHERE is_group_reporting_currency = TRUE;
```

### State Management

**Upload Page States**:
```javascript
const [selectedEntity, setSelectedEntity] = useState('');
const [selectedCurrency, setSelectedCurrency] = useState('');
const [currencyMismatch, setCurrencyMismatch] = useState(null);
const [groupReportingCurrency, setGroupReportingCurrency] = useState(null);
```

**Settings Page States**:
```javascript
const [currencyForm, setCurrencyForm] = useState({
  currency_code: '',
  currency_name: '',
  symbol: '',
  is_presentation_currency: false,
  is_functional_currency: false,
  is_group_reporting_currency: false, // NEW
  exchange_rate: 1.0,
  is_active: true
});
```

### Key Functions

#### Settings Page
```javascript
const setGroupReportingCurrency = async (currencyCode) => {
  // Unset all currencies
  await supabase.from('currencies')
    .update({ is_group_reporting_currency: false })
    .neq('currency_code', 'DUMMY');

  // Set selected currency
  await supabase.from('currencies')
    .update({ is_group_reporting_currency: true })
    .eq('currency_code', currencyCode);

  fetchAllData();
  alert(`${currencyCode} is now the group reporting currency (base)`);
};
```

#### Upload Page
```javascript
const handleEntityChange = (entityId) => {
  setSelectedEntity(entityId);
  const entity = entities.find(e => e.id === entityId);

  // Check for currency mismatch
  if (entity && selectedCurrency && selectedCurrency !== entity.functional_currency) {
    setCurrencyMismatch({
      entityCurrency: entity.functional_currency,
      selectedCurrency: selectedCurrency,
      entityName: entity.entity_name
    });
  } else {
    setCurrencyMismatch(null);
  }
};

const handleCurrencyChange = (currency) => {
  setSelectedCurrency(currency);
  const entity = entities.find(e => e.id === selectedEntity);

  // Check for currency mismatch
  if (entity && currency && currency !== entity.functional_currency) {
    setCurrencyMismatch({
      entityCurrency: entity.functional_currency,
      selectedCurrency: currency,
      entityName: entity.entity_name
    });
  } else {
    setCurrencyMismatch(null);
  }
};
```

## Files Modified

1. **`app/settings/page.js`**
   - Added `is_group_reporting_currency` to currency form state
   - Updated `saveCurrency()` to handle group reporting currency flag
   - Added `setGroupReportingCurrency()` function
   - Enhanced UI with amber-highlighted checkbox and button
   - Updated currency card display with badges

2. **`app/upload/page.js`**
   - Added state variables: `selectedCurrency`, `currencyMismatch`, `groupReportingCurrency`
   - Updated `fetchEntities()` to load group reporting currency
   - Added `handleEntityChange()` and `handleCurrencyChange()` for validation
   - Enhanced entity dropdown to show functional currency
   - Added currency selection dropdown
   - Added currency mismatch warning UI
   - Updated `handleTBUpload()` to require and save currency
   - Updated bulk upload UI to display base currency (read-only)

3. **`sql/08_ADD_GROUP_REPORTING_CURRENCY.sql`** (NEW)
   - Migration file to add column and constraint
   - Includes unique partial index
   - Optional default currency setup

## User Benefits

### For Finance Teams
1. **Clarity**: Always know which currency is the consolidation base
2. **Consistency**: System enforces single base currency across all uploads
3. **Error Prevention**: Warns when uploading in wrong currency
4. **Flexibility**: Easy to change base currency if needed
5. **Transparency**: Clear indication of entity's expected currency

### For Consolidation Process
1. **Data Quality**: Reduces currency-related errors
2. **Translation Visibility**: Makes currency mismatches explicit
3. **Audit Trail**: Currency recorded with each trial balance
4. **Compliance**: Supports proper currency translation documentation

## Testing Checklist

### Settings Page
- [x] Can add currency and mark as group reporting currency
- [x] Only one currency can be marked as group reporting at a time
- [x] Badge displays correctly on selected currency
- [x] Button appears on non-selected currencies
- [x] Can change group reporting currency via button
- [ ] Database constraint prevents multiple base currencies (requires DB test)

### Bulk Upload
- [x] Group reporting currency displays correctly
- [x] Currency shown as read-only (user cannot change)
- [x] Warning box displays if no base currency set
- [x] Link to Consolidation Config works
- [ ] Template downloads with correct entity codes (requires user test)
- [ ] Upload works with base currency validation (requires user test)

### Single Entity Upload
- [x] Entity dropdown shows functional currency
- [x] Currency dropdown shows group reporting currency first
- [x] Currency selection required for upload
- [x] Mismatch warning appears when currency ≠ entity currency
- [x] Warning displays both currencies clearly
- [x] Upload button disabled until currency selected
- [x] Currency saved with trial balance records
- [ ] End-to-end upload test (requires user test)

## Integration Points

### With Consolidation Workings
- Trial balance records now include currency field
- Consolidation process can check for currency consistency
- Translation adjustments can reference upload currency

### With Entity Setup
- Entity functional currency displayed during upload
- Validation against entity configuration
- Supports multi-currency entity groups

### With Currency Translation
- Foundation for automatic currency translation
- Clear identification of source currency
- Supports translation adjustment tracking

## Future Enhancements

Potential improvements (not currently implemented):

1. **Automatic Currency Translation**
   - Auto-convert uploaded amounts to group reporting currency
   - Use exchange rates from currencies table
   - Create translation adjustment entries

2. **Translation Adjustments Tracking**
   - Track FX gains/losses on translation
   - Show translation adjustment column in consolidation workings
   - Support multiple translation methods (current rate, historical rate)

3. **Multi-Currency Trial Balance Upload**
   - Allow mixing currencies in bulk upload
   - Auto-detect currency per entity column
   - Apply appropriate exchange rates

4. **Currency Validation Rules**
   - Configurable tolerance for currency mismatches
   - Mandatory vs. warning mode
   - Role-based override permissions

5. **Exchange Rate Management**
   - Historical rate tracking
   - Rate effective dates
   - Rate source documentation

6. **Currency Dashboard**
   - Overview of all currencies in use
   - Exchange rate trends
   - Translation impact summary

## Summary

The group reporting currency feature provides a comprehensive solution for managing currency consistency in multi-currency consolidations. It combines:

✅ **Prevention** - Single base currency enforcement
✅ **Detection** - Automatic mismatch warnings
✅ **Transparency** - Clear display of currencies throughout
✅ **Flexibility** - Easy configuration and changes
✅ **Data Quality** - Currency stored with each record

The feature is production-ready and awaiting user testing with real data.
