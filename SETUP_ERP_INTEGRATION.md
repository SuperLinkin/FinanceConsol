# ERP Integration Setup Guide

## Overview
This guide will help you set up NetSuite (and other ERP) integrations in your CLOE application, enabling automatic data sync for Trial Balance, Chart of Accounts, and Exchange Rates.

## Prerequisites
- Supabase project with admin access
- NetSuite account with API access (for NetSuite integration)
- CLOE application running

## Step 1: Verify Current Database State

Run this SQL query in your Supabase SQL Editor to check if ERP tables exist:

```sql
-- Check if ERP integration tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('erp_integrations', 'integration_sync_history', 'erp_account_mappings', 'integration_logs')
ORDER BY table_name;
```

**Expected Result:** If tables exist, you'll see 4 rows. If not, proceed to Step 2.

## Step 2: Create ERP Integration Tables

### Option A: Run the verification script first
File: `sql/VERIFY_ERP_TABLES.sql`

This will show you exactly what's missing.

### Option B: Run the creation script
File: `sql/CREATE_ERP_INTEGRATIONS_FIXED.sql`

1. Open Supabase Dashboard → SQL Editor
2. Copy the entire contents of `sql/CREATE_ERP_INTEGRATIONS_FIXED.sql`
3. Paste and run the SQL
4. You should see success messages

**What this creates:**
- `erp_integrations` - Stores ERP connection configurations
- `integration_sync_history` - Logs all sync operations
- `erp_account_mappings` - Maps ERP accounts to your COA
- `integration_logs` - Detailed sync operation logs
- Adds ERP-related columns to `trial_balance` and `chart_of_accounts`

## Step 3: Configure Your First ERP Integration

### For NetSuite:

1. **In NetSuite:**
   - Enable SuiteTalk Web Services (Setup → Company → Enable Features → SuiteCloud)
   - Create an Integration Record (Setup → Integration → Manage Integrations → New)
   - Note down: Consumer Key and Consumer Secret
   - Create Access Token (Setup → Users/Roles → Access Tokens → New)
   - Note down: Token ID and Token Secret
   - Note your Account ID (from your NetSuite URL: `https://ACCOUNT_ID.app.netsuite.com`)

2. **In CLOE Application:**
   - Go to Platform → Integrations Hub
   - Click "Connect" on NetSuite card
   - Step 1 - Connection:
     - Enter Account ID
     - Select Environment (Production/Sandbox)
     - Enter Consumer Key, Consumer Secret
     - Enter Token ID, Token Secret
     - Click "Test Connection"
   - Step 2 - Sync Settings:
     - Enable Trial Balance Sync
     - Enable Chart of Accounts Sync
     - Enable Exchange Rates Sync (optional)
     - Set Sync Frequency (Manual recommended for testing)
     - Map NetSuite subsidiaries to your CLOE entities
   - Step 3 - Review & Save

## Step 4: Test Your Integration

### Test Trial Balance Sync:

1. Go to **Upload** page
2. Look for "Sync from ERP" button (should appear if integration is configured)
3. Click "Sync from ERP"
4. Select:
   - Integration: Your NetSuite integration
   - Entity: Which subsidiary to sync
   - Period: Which period to sync
5. Click "Start Sync"
6. Monitor sync progress in the modal
7. Check Trial Balance page to verify data

### Test Chart of Accounts Sync:

1. Go to **Chart of Accounts** page
2. Click "Sync from ERP" button
3. Select integration and entity
4. Start sync
5. Verify COA data appears

## Step 5: Configure "Sync from ERP" Buttons

The following pages now have "Sync from ERP" functionality:

### Upload Page
- **Trial Balance Section:** Sync TB data directly from NetSuite
- **Chart of Accounts Section:** Sync COA from NetSuite
- **Location:** Top right of each upload card, next to "Download Template"

### Trial Balance Page
- **Sync Button:** Sync/refresh TB data for selected entity and period
- **Location:** Page header toolbar

### Translations Page
- **Sync Button:** Sync TB data before currency translation
- **Location:** Top of page

## Sync Workflow

```
User clicks "Sync from ERP"
  ↓
Select Integration (NetSuite, SAP, Tally, etc.)
  ↓
Select Entity/Subsidiary
  ↓
Select Period
  ↓
Click "Start Sync"
  ↓
API calls NetSuite connector
  ↓
Fetches data from NetSuite
  ↓
Maps accounts using COA mappings
  ↓
Inserts into trial_balance table
  ↓
Shows sync results
```

## Troubleshooting

### "No integrations configured" message
- Go to Platform → Integrations Hub
- Configure at least one ERP integration
- Test connection before using sync

### "Sync failed" errors
- Check integration credentials in Integrations Hub
- Verify NetSuite API access is enabled
- Check integration_logs table for detailed error messages:
  ```sql
  SELECT * FROM integration_logs
  ORDER BY created_at DESC
  LIMIT 50;
  ```

### Account mapping issues
- Accounts from NetSuite need to be mapped to your Chart of Accounts
- Go to Platform → Integrations Hub → View Integration → Account Mappings
- Review and verify unmapped accounts

### Missing data after sync
- Check sync history:
  ```sql
  SELECT * FROM integration_sync_history
  ORDER BY triggered_at DESC
  LIMIT 20;
  ```
- Look for `records_fetched` vs `records_imported`
- Check `error_message` field

## API Endpoints

Your application uses these endpoints for ERP sync:

- `POST /api/integrations/netsuite/sync` - Trigger NetSuite sync
- `GET /api/integrations/netsuite/subsidiaries` - Get NetSuite subsidiaries
- `GET /api/integrations/netsuite/periods` - Get accounting periods
- `GET /api/integrations/sync` - Get sync history
- `POST /api/integrations/test-connection` - Test ERP connection

## Security Notes

- All ERP credentials are stored encrypted in `erp_integrations.credentials` (JSONB)
- Row Level Security (RLS) ensures users only see their company's integrations
- OAuth tokens are refreshed automatically when needed
- Never commit credentials to git - they're stored in Supabase only

## Next Steps

1. Run verification SQL to check current state
2. Create ERP tables if missing
3. Configure your first NetSuite integration
4. Test sync from Upload page
5. Set up automated sync schedule (optional)
6. Configure account mappings for accurate data

## Support

If you encounter issues:
1. Check `integration_logs` table for detailed error messages
2. Verify NetSuite credentials and permissions
3. Test connection from Integrations Hub
4. Review sync history for patterns

---

Generated for CLOE Financial Consolidation Application
