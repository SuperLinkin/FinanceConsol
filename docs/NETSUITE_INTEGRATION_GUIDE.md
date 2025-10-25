# NetSuite Integration Guide

## Overview

This guide explains how to set up and use the Oracle NetSuite integration for CLOE Financial Consolidation Platform. The integration uses **NetSuite SuiteTalk REST API** with **OAuth 1.0a Token-Based Authentication (TBA)**.

---

## Prerequisites

Before you begin, ensure you have:

1. **NetSuite Account** with Administrator access
2. **NetSuite Account ID** (visible in your NetSuite URL: `https://{ACCOUNT_ID}.app.netsuite.com`)
3. **Permission to create Integration Records** in NetSuite
4. **Access to create Access Tokens** in NetSuite

---

## Part 1: NetSuite Setup

### Step 1: Enable SuiteTalk Web Services

1. Log in to NetSuite as Administrator
2. Navigate to **Setup > Company > Enable Features**
3. Click the **SuiteCloud** tab
4. Under **SuiteTalk (Web Services)**, check:
   - ✅ **Web Services**
   - ✅ **REST Web Services**
   - ✅ **Token-Based Authentication**
5. Click **Save**

### Step 2: Create Integration Record

1. Navigate to **Setup > Integration > Manage Integrations > New**
2. Fill in the details:
   - **Name**: `CLOE Financial Consolidation`
   - **Description**: `Financial consolidation platform integration`
   - **State**: ✅ **Enabled**
   - **Token-Based Authentication**: ✅ **Checked**
   - **TBA: Authorization Flow**: **Unchecked** (we're using token-based, not OAuth 2.0)
   - **User Credentials**: **Unchecked**
3. Click **Save**

4. **IMPORTANT**: After saving, NetSuite will display:
   - **Consumer Key** (also called Client ID)
   - **Consumer Secret** (also called Client Secret)

   ⚠️ **Copy these immediately** - the Consumer Secret will only be shown once!

### Step 3: Create Access Token

1. Navigate to **Setup > Users/Roles > Access Tokens > New**
2. Select:
   - **Application Name**: `CLOE Financial Consolidation` (the integration you just created)
   - **User**: Select the user account that will be used for API access (usually yourself or a service account)
   - **Role**: Select the appropriate role (e.g., Administrator, Accountant)
3. Click **Save**

4. **IMPORTANT**: After saving, NetSuite will display:
   - **Token ID**
   - **Token Secret**

   ⚠️ **Copy these immediately** - the Token Secret will only be shown once!

### Step 4: Assign Required Permissions

The NetSuite user role must have the following permissions:

**Permissions Required:**
- **Lists > Accounts**: View, Edit
- **Lists > Subsidiaries**: View
- **Transactions > Find Transaction**: Full
- **Transactions > General Ledger**: View
- **Reports > Financial Reports**: View, Create
- **Setup > Access Token Management**: Full
- **Setup > Web Services Preferences**: View

To verify/set permissions:
1. Navigate to **Setup > Users/Roles > Manage Roles**
2. Find the role assigned to your integration user
3. Click **Edit**
4. Go to **Permissions** tab
5. Ensure all required permissions are granted
6. **Save**

---

## Part 2: CLOE Platform Setup

### Step 1: Configure NetSuite Integration

1. Log in to CLOE Financial Consolidation Platform
2. Navigate to **Integrations Hub** (Platform menu)
3. Find **Oracle NetSuite** card and click **Configure Integration**

### Step 2: Enter Connection Details

**Basic Information:**
- **Integration Name**: `NetSuite Production` (or any name you prefer)
- **Description**: Optional description

**Connection Settings:**
- **Account ID**: Your NetSuite account ID (e.g., `1234567`)
  - Find this in your NetSuite URL: `https://{ACCOUNT_ID}.app.netsuite.com`
  - For sandbox: Use sandbox account ID
- **Realm**: Select `production` or `sandbox`

**Authentication (Token-Based):**
- **Consumer Key**: Paste from Step 2 above
- **Consumer Secret**: Paste from Step 2 above
- **Token ID**: Paste from Step 3 above
- **Token Secret**: Paste from Step 3 above

**Sync Settings:**
- ✅ **Trial Balance**: Enable to sync trial balance data
- ✅ **Chart of Accounts**: Enable to sync GL accounts
- ⬜ **Exchange Rates**: Enable if you want to sync NetSuite exchange rates
- ⬜ **Auto-sync**: Enable for automatic scheduled syncs

### Step 3: Test Connection

1. Click **Test Connection** button
2. Wait for the test to complete
3. You should see: ✓ **Successfully connected to NetSuite**

If the test fails, verify:
- All credentials are correct (no extra spaces)
- The NetSuite integration is enabled
- The access token is not revoked
- The user has required permissions

### Step 4: Map Subsidiaries to Entities

Before syncing trial balance data, you need to map NetSuite Subsidiaries to your CLOE Entities:

1. In CLOE, navigate to **Entity Setup**
2. Create entities that correspond to your NetSuite subsidiaries
3. Go back to **Integrations Hub** > **Configure** the NetSuite integration
4. In the **Entity Mapping** section (if available in future update), map:
   - NetSuite Subsidiary ID → CLOE Entity ID

---

## Part 3: Running Syncs

### Full Sync

Syncs all data types enabled in your integration settings:

1. Go to **Integrations Hub**
2. Find your NetSuite integration card
3. Click **Sync Now**
4. Select **Full Sync**
5. Monitor progress in the sync history

### Trial Balance Sync

To sync trial balance for a specific subsidiary and period:

**Via API** (for developers):
```javascript
POST /api/integrations/netsuite/sync
{
  "integration_id": "your-integration-id",
  "sync_type": "trial_balance",
  "subsidiary_id": "123", // NetSuite subsidiary ID
  "period_id": "456",      // NetSuite period ID
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "period_name": "Jan 2024"
}
```

**Via UI** (when available):
1. Go to **Integrations Hub**
2. Click **Sync Now** on NetSuite integration
3. Select subsidiary and period
4. Click **Start Sync**

### Chart of Accounts Sync

Syncs all active GL accounts from NetSuite:

```javascript
POST /api/integrations/netsuite/sync
{
  "integration_id": "your-integration-id",
  "sync_type": "chart_of_accounts",
  "subsidiary_id": "123" // Optional: specific subsidiary
}
```

---

## Part 4: Data Mapping

### NetSuite to IFRS Account Type Mapping

The integration automatically maps NetSuite account types to IFRS classifications:

| NetSuite Account Type | IFRS Class | Default Sub-Class |
|-----------------------|------------|-------------------|
| Bank | Assets | Cash and Cash Equivalents |
| AcctRec | Assets | Trade Receivables |
| OthCurrAsset | Assets | Other Current Assets |
| FixedAsset | Assets | Property, Plant and Equipment |
| OthAsset | Assets | Other Non-Current Assets |
| AcctPay | Liability | Trade Payables |
| CredCard | Liability | Other Current Liabilities |
| OthCurrLiab | Liability | Other Current Liabilities |
| LongTermLiab | Liability | Long-term Borrowings |
| Equity | Equity | Share Capital |
| Income | Revenue | Revenue from Operations |
| OthIncome | Revenue | Other Income |
| COGS | Expenses | Cost of Sales |
| Expense | Expenses | Operating Expenses |
| OthExpense | Expenses | Other Expenses |

**Customizing Mappings:**
After the initial sync, you can adjust the class/sub-class assignments in CLOE:
1. Navigate to **Chart of Accounts**
2. Find the imported GL codes
3. Edit the Class and Sub-Class as needed

---

## Part 5: Monitoring and Troubleshooting

### View Sync History

1. Go to **Integrations Hub**
2. Find your NetSuite integration
3. Click **History** button
4. View detailed sync logs:
   - Records fetched
   - Records imported
   - Records updated
   - Errors and failures
   - Duration

### Common Issues

#### 1. Authentication Errors

**Error**: `Invalid login credentials`

**Solutions**:
- Verify Consumer Key/Secret and Token ID/Secret are correct
- Ensure no extra spaces in credentials
- Check that the access token is not revoked in NetSuite
- Verify the integration record is enabled

#### 2. Permission Errors

**Error**: `Insufficient permissions`

**Solutions**:
- Check user role permissions in NetSuite
- Ensure the role has all required permissions (see Step 4 in Part 1)
- Try using an Administrator role for testing

#### 3. No Data Returned

**Error**: Sync completes but no records imported

**Solutions**:
- Verify the subsidiary ID is correct
- Check that the accounting period exists and has transactions
- Ensure the date range is correct
- Check that GL accounts exist in NetSuite

#### 4. Rate Limit Errors

**Error**: `Too many requests`

**Solutions**:
- NetSuite has API governance limits
- Space out sync operations
- Enable auto-sync with longer intervals (daily instead of hourly)
- Contact NetSuite support to increase limits

---

## Part 6: API Reference

### Available Endpoints

#### Test Connection
```http
POST /api/integrations/test-connection
Content-Type: application/json

{
  "erp_system": "netsuite",
  "connection_config": {
    "account_id": "1234567",
    "realm": "production"
  },
  "credentials": {
    "consumer_key": "...",
    "consumer_secret": "...",
    "token_id": "...",
    "token_secret": "..."
  }
}
```

#### Fetch Subsidiaries
```http
GET /api/integrations/netsuite/subsidiaries?integration_id={id}
```

#### Fetch Accounting Periods
```http
GET /api/integrations/netsuite/periods?integration_id={id}
```

#### Sync Data
```http
POST /api/integrations/netsuite/sync
Content-Type: application/json

{
  "integration_id": "uuid",
  "sync_type": "full|trial_balance|chart_of_accounts|subsidiaries|exchange_rates",
  "subsidiary_id": "123",
  "period_id": "456",
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "period_name": "Jan 2024"
}
```

---

## Part 7: Best Practices

### Security

1. **Rotate Tokens Regularly**: Create new access tokens every 90 days
2. **Use Dedicated Service Account**: Don't use personal user accounts for API access
3. **Limit Role Permissions**: Only grant minimum required permissions
4. **Enable IP Restrictions**: Restrict API access to specific IP addresses (in NetSuite)

### Performance

1. **Schedule Syncs During Off-Peak Hours**: Run large syncs overnight
2. **Sync Only What You Need**: Disable data types you don't need
3. **Use Subsidiary Filters**: Only sync specific subsidiaries if possible
4. **Monitor API Usage**: Check NetSuite governance metrics regularly

### Data Quality

1. **Review Mappings**: Verify account type mappings after initial sync
2. **Validate Trial Balance**: Compare NetSuite vs CLOE totals
3. **Check for Duplicates**: Ensure GL codes are unique
4. **Monitor Sync Logs**: Review errors and warnings regularly

---

## Support

For assistance:
- **NetSuite Setup Issues**: Contact NetSuite support or your NetSuite administrator
- **CLOE Integration Issues**: Check integration logs in the platform
- **API Errors**: Review the sync history and error messages

---

## Appendix: SuiteQL Query Examples

### Get All Subsidiaries
```sql
SELECT id, name, legalName, currency, country
FROM subsidiary
WHERE isInactive = 'F'
ORDER BY name
```

### Get Chart of Accounts
```sql
SELECT a.id, a.acctnumber, a.acctname, a.accttype, at.name as accountTypeName
FROM account a
LEFT JOIN accountType at ON a.accttype = at.id
WHERE a.isInactive = 'F'
ORDER BY a.acctnumber
```

### Get Trial Balance for Period
```sql
SELECT
  tl.account,
  a.acctnumber,
  a.acctname,
  SUM(CASE WHEN tl.debit = 'T' THEN tl.amount ELSE 0 END) as totalDebit,
  SUM(CASE WHEN tl.credit = 'T' THEN tl.amount ELSE 0 END) as totalCredit
FROM transactionLine tl
INNER JOIN account a ON tl.account = a.id
INNER JOIN transaction t ON tl.transaction = t.id
WHERE tl.subsidiary = {subsidiaryId}
  AND t.postingPeriod = {periodId}
GROUP BY tl.account, a.acctnumber, a.acctname
```

---

**Last Updated**: January 2025
**Version**: 1.0
