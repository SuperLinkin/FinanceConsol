# NetSuite Integration Setup

Complete guide to integrating Oracle NetSuite with CLOE.

## Prerequisites

- NetSuite account with Administrator access
- Permission to create integration records
- Token-Based Authentication enabled in NetSuite

## Step 1: Create Integration Record in NetSuite

1. Log in to NetSuite
2. Navigate to **Setup → Integration → Manage Integration Records**
3. Click **New**
4. Fill in:
   - **Name**: "CLOE Integration"
   - **State**: Enabled
   - **Token-Based Authentication**: ✅ Checked
   - **TBA: Authorization Flow**: Unchecked
5. Click **Save**
6. **Important**: Note down:
   - Consumer Key
   - Consumer Secret

## Step 2: Create Access Token

1. Navigate to **Setup → Users/Roles → Access Tokens**
2. Click **New**
3. Fill in:
   - **Application Name**: Select "CLOE Integration"
   - **User**: Select your user
   - **Role**: Administrator
4. Click **Save**
5. **Important**: Note down (shown only once):
   - Token ID
   - Token Secret

## Step 3: Get Account ID

Your NetSuite Account ID is in the URL.

Example: If URL is https://1234567.app.netsuite.com/
Account ID is: **1234567**

## Step 4: Configure in CLOE

1. Log in to CLOE
2. Navigate to **ERP Connections**
3. Click **Add Integration**
4. Fill in:
   - **ERP System**: Oracle NetSuite
   - **Integration Name**: "NetSuite Production"
   - **Account ID**: Your Account ID
   - **Realm**: Production (or Sandbox)
   - **Consumer Key**: From Step 1
   - **Consumer Secret**: From Step 1
   - **Token ID**: From Step 2
   - **Token Secret**: From Step 2
5. Enable sync options:
   - ✅ Sync Trial Balance
   - ✅ Sync Chart of Accounts
   - ✅ Sync Entities
6. Click **Save Integration**

## Step 5: Test Connection

1. In CLOE connections page
2. Click **Test Connection** on your integration
3. Wait for verification
4. Status should change to **Connected** (green)

## Step 6: Map Entities

1. Navigate to **Consol Config → Group Structure**
2. Click **Map ERP Entities**
3. Select your NetSuite integration
4. System fetches subsidiaries from NetSuite
5. Map each NetSuite subsidiary to CLOE entity
6. Click **Save Mappings**

## Troubleshooting

### Error: "Invalid Login"
- Verify credentials are correct
- Check token hasn't expired
- Ensure integration is enabled

### Error: "Insufficient Permissions"
- Check role permissions in NetSuite
- Verify user has Administrator role

### Error: "No Subsidiaries Found"
- Verify subsidiary feature is enabled
- Check permissions to view subsidiaries

## Best Practices

1. **Use Production Integration Only**: Don't mix sandbox and production
2. **Rotate Tokens Annually**: Create new tokens yearly
3. **Monitor Sync History**: Review logs regularly
4. **Test Before Close**: Run test syncs before month-end
