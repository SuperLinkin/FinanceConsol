# NetSuite Integration - Quick Setup Instructions

## ⚠️ IMPORTANT: Schema Fix Applied

The NetSuite integration has been updated to work with your existing database schema. Use the **FIXED** SQL file.

---

## Step 1: Run the Database Migration

Execute this SQL file in your Supabase SQL Editor:

```
sql/CREATE_ERP_INTEGRATIONS_FIXED.sql
```

This will:
- ✅ Create `erp_integrations` table
- ✅ Create `integration_sync_history` table
- ✅ Create `erp_account_mappings` table
- ✅ Create `integration_logs` table
- ✅ Add required columns to your existing `trial_balance` table
- ✅ Add required columns to your existing `chart_of_accounts` table
- ✅ Create RLS policies for multi-tenancy
- ✅ Add helper functions

### What's Different from the Original?

The fixed version uses your existing table structure:
- Uses `chart_of_accounts` (not `chart_of_accounts_master`)
- Uses your column names: `account_code`, `account_name`, `class_name`, `subclass_name`
- Adds missing columns: `company_id`, `gl_code`, `gl_name`, `netsuite_id`, etc.
- Works with your existing `trial_balance` table

---

## Step 2: Verify the Migration

After running the SQL, verify with this query:

```sql
-- Check that tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'erp_integrations',
  'integration_sync_history',
  'erp_account_mappings',
  'integration_logs'
);

-- Check new columns in chart_of_accounts
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'chart_of_accounts'
AND column_name IN ('company_id', 'netsuite_id', 'gl_code');

-- Check new columns in trial_balance
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'trial_balance'
AND column_name IN ('company_id', 'class', 'netsuite_account_id');
```

You should see all tables and columns listed.

---

## Step 3: Set Up NetSuite (Follow the Full Guide)

See: `docs/NETSUITE_INTEGRATION_GUIDE.md`

Quick checklist:
1. ✅ Enable SuiteTalk Web Services in NetSuite
2. ✅ Create Integration Record → Get Consumer Key/Secret
3. ✅ Create Access Token → Get Token ID/Secret
4. ✅ Assign permissions to the user role

---

## Step 4: Configure in CLOE

1. Navigate to **Integrations Hub** (Platform menu)
2. Find **Oracle NetSuite** card
3. Click **Configure Integration**
4. Fill in:
   - **Account ID**: Your NetSuite account (e.g., `1234567`)
   - **Realm**: `production` or `sandbox`
   - **Consumer Key**: From NetSuite Integration Record
   - **Consumer Secret**: From NetSuite Integration Record
   - **Token ID**: From NetSuite Access Token
   - **Token Secret**: From NetSuite Access Token
5. Click **Test Connection**
6. Click **Save Integration**

---

## Step 5: Run Your First Sync

### Option A: Via UI
1. Go to **Integrations Hub**
2. Find your NetSuite integration
3. Click **Sync Now**
4. Monitor progress in sync history

### Option B: Via API (for testing)

```javascript
// Test connection
POST /api/integrations/test-connection
{
  "erp_system": "netsuite",
  "connection_config": {
    "account_id": "1234567",
    "realm": "production"
  },
  "credentials": {
    "consumer_key": "your-key",
    "consumer_secret": "your-secret",
    "token_id": "your-token",
    "token_secret": "your-token-secret"
  }
}

// Sync Chart of Accounts
POST /api/integrations/netsuite/sync
{
  "integration_id": "your-integration-uuid",
  "sync_type": "chart_of_accounts"
}

// Sync Trial Balance
POST /api/integrations/netsuite/sync
{
  "integration_id": "your-integration-uuid",
  "sync_type": "trial_balance",
  "subsidiary_id": "1",
  "period_id": "123",
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "period_name": "Jan 2024"
}
```

---

## Troubleshooting

### Issue: "relation chart_of_accounts_master does not exist"

**Solution**: You're using the OLD SQL file. Use `CREATE_ERP_INTEGRATIONS_FIXED.sql` instead.

### Issue: "column company_id does not exist"

**Solution**: The migration didn't complete. Re-run the FIXED SQL file.

### Issue: Authentication errors

**Solution**:
- Verify all 4 credentials are correct (no spaces)
- Check that the NetSuite Integration is **Enabled**
- Check that the Access Token is not revoked
- Verify user has required permissions

### Issue: No data synced

**Solution**:
- Check entity mapping (NetSuite Subsidiary ID → CLOE Entity ID)
- Verify the period has transactions in NetSuite
- Check sync logs in **Integrations Hub → History**

---

## What Gets Synced?

### Chart of Accounts
- ✅ Account Code/Number
- ✅ Account Name
- ✅ Account Type (auto-mapped to IFRS classes)
- ✅ Description
- ✅ Active status
- ✅ NetSuite metadata (ID, account type)

Mapped to: `chart_of_accounts` table

### Trial Balance
- ✅ Account Code
- ✅ Account Name
- ✅ Debit amounts
- ✅ Credit amounts
- ✅ IFRS class classification
- ✅ NetSuite metadata

Mapped to: `trial_balance` table

### Entities/Subsidiaries
- ✅ Subsidiary name
- ✅ Currency
- ✅ Country
- ✅ Fiscal calendar

Updates: `entities` table (via entity mapping)

### Exchange Rates (Optional)
- ✅ Currency pairs
- ✅ Rates by date
- ✅ Effective dates

Mapped to: `exchange_rates` table

---

## Database Schema Changes

### New Tables
```sql
erp_integrations            -- Integration configs
integration_sync_history    -- Sync operation logs
erp_account_mappings        -- GL account mappings
integration_logs            -- Detailed debug logs
```

### Modified Tables
```sql
-- chart_of_accounts (new columns)
+ company_id UUID
+ description TEXT
+ netsuite_id TEXT
+ netsuite_account_type TEXT
+ gl_code TEXT
+ gl_name TEXT

-- trial_balance (new columns)
+ company_id UUID
+ class TEXT
+ sub_class TEXT
+ netsuite_account_id TEXT
+ netsuite_subsidiary_id TEXT
+ gl_code TEXT
+ gl_name TEXT
```

---

## Support

- **Full Guide**: `docs/NETSUITE_INTEGRATION_GUIDE.md`
- **Technical Summary**: `docs/NETSUITE_INTEGRATION_SUMMARY.md`
- **Connector Code**: `lib/integrations/netsuite/connector.js`
- **Sync Service**: `lib/integrations/netsuite/sync-service.js`

---

**Status**: ✅ Ready to use after running the FIXED SQL migration!
