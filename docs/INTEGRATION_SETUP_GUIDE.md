# ERP Integration Setup Guide

## Overview
This guide explains how to configure ERP integrations and map entities for your SaaS customers during implementation.

## Your Business Model

**Subscription**: Annual SaaS fee ($12,000/year)
**Implementation**: One-time setup ($3,000) where you configure ERP integration and reporting templates

## Customer Onboarding Flow

```
Customer Signs Up
      ↓
Implementation Call Scheduled
      ↓
Pre-Implementation (Customer Homework)
  - Customer creates API user in their ERP
  - Customer generates API tokens
  - Customer exports sample data
      ↓
Implementation Session (2-4 hours with you)
  1. Configure ERP Integration
  2. Map ERP Entities to CLOE Entities
  3. Set up Chart of Accounts
  4. Test Sync
  5. Train Customer
      ↓
Customer is Self-Sufficient
  - Customer clicks "Sync from ERP" anytime
  - Data flows automatically
```

## Implementation Steps

### Step 1: Configure ERP Integration

**Page**: `/integrations`

1. Click "Add Integration"
2. Fill in integration details:
   - **ERP System**: Select NetSuite (or other)
   - **Integration Name**: e.g., "NetSuite Production"
   - **Description**: Optional notes
   - **Account ID**: Customer's NetSuite account ID
   - **Realm**: Production or Sandbox
   - **Consumer Key**: From NetSuite integration record
   - **Consumer Secret**: From NetSuite integration record
   - **Token ID**: Token-based auth
   - **Token Secret**: Token-based auth
3. Select sync options:
   - ✅ Sync Trial Balance
   - ✅ Sync Chart of Accounts
   - ✅ Sync Entities
4. Click "Save Integration"
5. Click "Test Connection" to verify credentials

### Step 2: Map ERP Entities to CLOE Entities

**Page**: Consol Config → Group Structure tab

1. Click "Map ERP Entities" button (purple)
2. Select the integration
3. System fetches subsidiaries from ERP
4. For each ERP subsidiary:
   - Select corresponding CLOE entity from dropdown
   - Or leave unmapped if not needed
5. Click "Save Mappings"

**Entity Mapping Example**:
```
ERP Subsidiary          →  CLOE Entity
────────────────────────────────────────
NetSuite Sub A (ID: 1)  →  Entity A (ENTA)
NetSuite Sub B (ID: 2)  →  Entity B (ENTB)
NetSuite Sub C (ID: 3)  →  (Not Mapped)
```

This mapping is stored in `erp_integrations.entity_mapping` as:
```json
{
  "1": "uuid-of-entity-a",
  "2": "uuid-of-entity-b"
}
```

### Step 3: Configure Chart of Accounts

**Page**: Chart of Accounts

1. Either:
   - Click "Sync GL Codes from ERP" to pull from ERP, OR
   - Upload Excel template with GL codes
2. Map GL codes to IFRS 4-level hierarchy:
   - Class (Assets, Liabilities, Equity, Income, Expenses)
   - Sub-Class
   - Note
   - Sub-Note
3. Mark elimination accounts with "To Be Eliminated" checkbox

### Step 4: Test Data Sync

**Page**: Upload → Trial Balance

1. Click "Sync from ERP"
2. Select entity
3. Select period
4. Click "Preview" to see what will be synced
5. Review preview data
6. Click "Proceed with Sync"
7. Verify data appears correctly
8. Check that entity mapping worked (data went to correct entity)

### Step 5: Train Customer

Show customer how to:
1. Navigate to Upload → Trial Balance
2. Click "Sync from ERP"
3. Select entity and period
4. Use Preview feature
5. Proceed with sync
6. View Version Control and rollback if needed
7. Generate consolidated reports

## Database Tables

### `erp_integrations`
Stores ERP connection configuration (multi-tenant with `company_id`)

**Key Fields**:
- `company_id`: Links to customer's company
- `erp_system`: 'netsuite', 'sap', 'quickbooks', etc.
- `integration_name`: Display name
- `connection_config`: JSONB (account_id, realm, etc.)
- `credentials`: JSONB (consumer_key, consumer_secret, token_id, token_secret)
- `entity_mapping`: JSONB mapping ERP IDs to CLOE entity UUIDs
- `status`: 'not_configured', 'configured', 'connected', 'disconnected', 'error'

**Entity Mapping Format**:
```json
{
  "erp_subsidiary_id_1": "cloe_entity_uuid_1",
  "erp_subsidiary_id_2": "cloe_entity_uuid_2"
}
```

### `integration_sync_history`
Tracks all sync operations

**Key Fields**:
- `integration_id`: Which integration was used
- `sync_type`: 'trial_balance', 'chart_of_accounts', 'entities'
- `sync_status`: 'pending', 'in_progress', 'completed', 'failed'
- `records_fetched`, `records_imported`, `records_failed`
- `triggered_by`: 'manual' or user_id

### `erp_account_mappings`
Manual GL code mapping (if needed)

**Key Fields**:
- `integration_id`: Which integration
- `erp_account_code`: GL code in ERP
- `chart_of_accounts_id`: Mapped CLOE GL code
- `entity_id`: Which entity this mapping applies to

## Security & Multi-Tenancy

### Row Level Security (RLS)

All ERP tables have RLS policies:

```sql
-- Only show integrations for current company
CREATE POLICY erp_integrations_company_policy ON erp_integrations
    USING (company_id = current_setting('app.current_company_id', true)::uuid);
```

### Credentials Storage

**Current State**: Credentials stored in JSONB (credentials field)

**Future Enhancement**: Encrypt credentials using environment variable:

```javascript
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encrypted = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
```

## Data Flow During Sync

```
User clicks "Sync from ERP"
      ↓
Frontend: /app/upload/page.js
  - Opens ERPSyncPanel
  - User selects entity & period
      ↓
Backend: /api/integrations/netsuite/sync
  1. Fetch integration from erp_integrations table
  2. Decrypt credentials
  3. Use entity_mapping to get subsidiary_id
  4. Call NetSuite API with credentials
  5. Transform NetSuite data to CLOE format
  6. Create snapshot (version control)
  7. Write to trial_balance table
      ↓
Frontend: Success notification
  - Data appears in trial balance viewer
  - Customer can now consolidate
```

## Implementation Checklist

During each customer implementation session:

### Pre-Call Preparation
- [ ] Customer created NetSuite integration record
- [ ] Customer generated consumer key/secret
- [ ] Customer generated token ID/secret
- [ ] Customer exported sample trial balance
- [ ] Customer exported chart of accounts

### Hour 1: ERP Connection
- [ ] Navigate to `/integrations`
- [ ] Click "Add Integration"
- [ ] Enter customer's NetSuite credentials
- [ ] Click "Save Integration"
- [ ] Click "Test Connection" → Verify success
- [ ] Status shows "Connected" (green badge)

### Hour 2: Entity Mapping
- [ ] Navigate to Consol Config → Group Structure
- [ ] Click "Map ERP Entities"
- [ ] System fetches subsidiaries from NetSuite
- [ ] Map each subsidiary to CLOE entity
- [ ] Click "Save Mappings"
- [ ] Verify mapping summary shows correct count

### Hour 3: Chart of Accounts
- [ ] Navigate to Chart of Accounts → GL Codes tab
- [ ] Click "Sync GL Codes from ERP"
- [ ] Click "Preview" to see what will sync
- [ ] Verify GL codes look correct
- [ ] Click "Proceed with Sync"
- [ ] Map GL codes to IFRS hierarchy (Class, Sub-Class, Note, Sub-Note)
- [ ] Mark intercompany accounts for elimination

### Hour 4: Testing & Training
- [ ] Navigate to Upload → Trial Balance
- [ ] Click "Sync from ERP"
- [ ] Select first entity
- [ ] Select current period
- [ ] Click "Preview" → Show customer the preview feature
- [ ] Click "Proceed with Sync"
- [ ] Verify data appears in trial balance viewer
- [ ] Show customer Version Control feature
- [ ] Test rollback functionality
- [ ] Run test consolidation
- [ ] Train customer on regular usage
- [ ] Provide documentation

## Pricing Model

```
Annual Subscription: $12,000/year
  ✓ Platform access unlimited users
  ✓ Up to 50 entities
  ✓ Unlimited consolidations
  ✓ Standard support

Implementation: $3,000 one-time
  ✓ 1 ERP integration setup
  ✓ Chart of Accounts mapping
  ✓ Entity structure configuration
  ✓ 4 hours consulting/training
  ✓ Documentation

Add-ons:
  Additional ERP: $1,500
  Additional 50 entities: $2,000/year
  Premium support (SLA): $3,000/year
  Managed sync service: $500/month
```

## Customer Self-Service (After Implementation)

Once implementation is complete, customer can:

1. **Sync Data Anytime**
   - Go to Upload → Trial Balance
   - Click "Sync from ERP"
   - Select entity and period
   - Click sync

2. **Add New Entities**
   - Go to Consol Config → Group Structure
   - Add new entity
   - Go to "Map ERP Entities"
   - Map new subsidiary

3. **View Sync History**
   - In sync panel → See recent sync history
   - View records fetched/imported
   - Check for errors

4. **Rollback if Needed**
   - In sync panel → Click "Version Control"
   - View all snapshots
   - Click "Rollback" on any snapshot
   - Data restored instantly

## Troubleshooting

### "Connection test failed"
- Verify credentials are correct
- Check NetSuite integration record is enabled
- Verify token hasn't expired
- Check realm (production vs sandbox)

### "No subsidiaries found"
- Verify integration has permission to read subsidiaries
- Check NetSuite role has correct permissions
- Try clicking "Map ERP Entities" again to refresh

### "Sync completed but no data"
- Check entity mapping is correct
- Verify entity_id in trial_balance matches selected entity
- Check period format matches ERP period
- Review sync history for errors

### "Duplicate data after sync"
- Use snapshot rollback to restore previous state
- Check if same period was synced multiple times
- Verify entity mapping doesn't map multiple ERP subs to same entity

## Next Steps

1. **Encryption**: Add credentials encryption before production
2. **Auto Sync**: Implement scheduled sync (future feature)
3. **More ERPs**: Add SAP, QuickBooks, Sage connectors
4. **AI Mapping**: Auto-suggest entity mappings based on name similarity
5. **Bulk Testing**: Tool to test connection for all integrations at once

## Support Resources

- Integration setup videos (record during first few implementations)
- Customer self-service knowledge base
- Troubleshooting guide
- API documentation for developers
- NetSuite setup guide (step-by-step with screenshots)
