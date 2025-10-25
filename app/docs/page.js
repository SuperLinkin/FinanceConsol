'use client';

import { useState } from 'react';
import {
  Search, BookOpen, Rocket, Database, FileText, Settings, TrendingUp,
  BarChart3, Upload, GitBranch, MessageSquare, Send, X, CheckCircle,
  ArrowRight, Play, ChevronRight, ExternalLink, Zap, Shield, Users
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';

export const dynamic = 'force-dynamic';

const DOCUMENTATION_SECTIONS = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Rocket,
    color: 'from-blue-500 to-cyan-500',
    articles: [
      {
        id: 'welcome',
        title: 'Welcome to CLOE',
        description: 'Learn the basics of financial consolidation with CLOE',
        readTime: '5 min',
        content: `
# Welcome to CLOE

CLOE (Consolidation & Ledger Optimization Engine) is your comprehensive platform for financial consolidation, reporting, and analysis.

## What is Financial Consolidation?

Financial consolidation is the process of combining financial statements from multiple entities (subsidiaries, divisions, or business units) into a single set of consolidated financial statements.

## Key Features

- **Multi-Entity Management**: Manage unlimited entities with complex ownership structures
- **Automated Consolidation**: Automatic elimination of intercompany transactions
- **IFRS Compliance**: Full support for IFRS reporting standards
- **Currency Translation**: Automated multi-currency translation with live exchange rates
- **ERP Integration**: Sync data directly from NetSuite, SAP, QuickBooks, and more
- **Version Control**: Rollback capabilities for all data changes
- **Audit Trail**: Complete tracking of all changes and approvals

## Getting Around

Use the left sidebar to navigate between modules:
- **Dashboard**: Overview of your consolidation status
- **Upload**: Import trial balance data
- **Consol Config**: Configure entities, currencies, and regions
- **Chart of Accounts**: Manage your account structure
- **Trial Balance**: View and edit GL data
- **Consolidation**: Run consolidations and view results
- **Reports**: Generate financial statements

## Need Help?

- Browse this documentation for detailed guides
- Click the ? icon in the header from any page
- Submit a support ticket if you can't find what you need
        `
      },
      {
        id: 'first-consolidation',
        title: 'Running Your First Consolidation',
        description: 'Step-by-step guide to your first consolidated report',
        readTime: '15 min',
        content: `
# Running Your First Consolidation

This guide will walk you through running your first financial consolidation in CLOE.

## Prerequisites

Before you start, ensure you have:
- ✅ Set up at least 2 entities (parent and subsidiary)
- ✅ Uploaded trial balance data for both entities
- ✅ Configured your chart of accounts with IFRS hierarchy
- ✅ Set up entity ownership relationships

## Step 1: Configure Entities

1. Navigate to **Consol Config → Group Structure**
2. Click **Add Entity**
3. Fill in entity details:
   - Entity Code (e.g., "PARENT")
   - Entity Name (e.g., "Parent Company Ltd")
   - Entity Type: "Parent" or "Subsidiary"
   - Ownership Percentage: 100 for full ownership
   - Functional Currency
4. Click **Save Entity**
5. Repeat for all entities in your group

**Entity Structure Example**:
\`\`\`
Parent Company (100%)
  ├── Subsidiary A (100% ownership)
  └── Subsidiary B (60% ownership)
\`\`\`

## Step 2: Upload Trial Balance

1. Navigate to **Upload → Trial Balance**
2. Click **Download Template** to get the Excel template
3. Fill in your trial balance data:
   - GL Code
   - GL Name
   - Debit Amount
   - Credit Amount
4. Click **Upload** and select your file
5. Select the **Entity** and **Period**
6. Click **Upload Trial Balance**
7. Repeat for all entities

**Alternative**: Use **Sync from ERP** if you have an ERP integration configured.

## Step 3: Set Up Chart of Accounts

1. Navigate to **Chart of Accounts → GL Codes**
2. Map your GL codes to the IFRS hierarchy:
   - **Class**: Assets, Liabilities, Equity, Income, Expenses
   - **Sub-Class**: Current Assets, Non-Current Assets, etc.
   - **Note**: Cash & Cash Equivalents, Trade Receivables, etc.
   - **Sub-Note**: Bank Accounts, Petty Cash, etc.
3. Mark intercompany accounts with **To Be Eliminated** checkbox
4. Click **Save**

## Step 4: Configure Elimination Rules

1. Navigate to **Eliminations → Journal Entries**
2. Click **Create New Entry**
3. Select the period
4. Add elimination journal lines:
   - Debit: Intercompany Payable (Entity A)
   - Credit: Intercompany Receivable (Entity B)
5. Ensure debits equal credits
6. Click **Save and Post**

## Step 5: Run Consolidation

1. Navigate to **Consolidation → Workings**
2. Select the **Period**
3. Select **Statement Type**: Balance Sheet or Income Statement
4. Click **Calculate Consolidation**
5. Review the consolidation working:
   - Entity amounts (columns for each entity)
   - Elimination amount
   - Translation adjustments
   - Consolidated total

## Step 6: Generate Reports

1. Navigate to **Reports → Financial Statements**
2. Click **Create New Report**
3. Select:
   - Report Type: Consolidated Balance Sheet
   - Period
   - Template
4. Click **Generate Report**
5. Review and download as PDF or Excel

## Common Issues

**Issue**: Consolidation doesn't balance
- Check that all entities have data for the period
- Verify debit = credit for each entity
- Ensure elimination entries balance

**Issue**: Missing accounts in consolidation
- Check that GL codes are mapped to COA hierarchy
- Verify accounts are marked as active
- Ensure trial balance was uploaded correctly

**Issue**: Currency translation errors
- Verify exchange rates are configured
- Check entity functional currencies are set
- Ensure translation rules are active

## Next Steps

- Set up **Currency Translation** rules
- Configure **Automated Eliminations** with templates
- Enable **ERP Integration** for automatic data sync
- Create custom **Report Templates**
- Set up **User Permissions** for your team
        `
      },
      {
        id: 'navigation',
        title: 'Navigating the Platform',
        description: 'Understanding the interface and navigation',
        readTime: '3 min',
        content: `
# Navigating the Platform

## Main Navigation

The left sidebar contains all main modules:

### 📊 Dashboard
Your consolidation command center showing:
- Consolidation status by period
- Entity health metrics
- Recent activities
- Quick actions

### 📤 Upload
Import data into CLOE:
- Trial Balance uploads (Excel or ERP sync)
- Chart of Accounts bulk import
- Entity structure import

### ⚙️ Consol Config
Configure your consolidation setup:
- **Group Structure**: Manage entities and ownership
- **Currencies**: Set up exchange rates
- **Regions**: Organize entities by geography
- **Controllers**: Assign responsibility

### 📋 Chart of Accounts
Manage your account structure:
- **GL Codes**: Map specific GL accounts
- **Master Management**: Configure IFRS hierarchy

### 💰 Trial Balance
View and manage GL balances:
- Filter by entity and period
- Inline editing capabilities
- Assign classes to unmapped GLs
- Export to CSV

### 🔄 Consolidation
Run consolidations:
- Consolidation Workings
- Elimination Entries
- Adjustment Entries

### 📊 Reports
Generate financial statements:
- Balance Sheet
- Income Statement
- Cash Flow Statement
- Custom reports

### 🔌 Integrations
Manage ERP connections:
- Add/edit integrations
- Test connections
- View sync history

## Header Features

**Top Right**:
- **? Icon**: Help & Documentation (you're here!)
- **User Profile**: Settings and logout

## Keyboard Shortcuts

- Ctrl/Cmd + K: Global search
- Ctrl/Cmd + S: Save current form
- Esc: Close modals

## Tips

- Use **breadcrumbs** to navigate back to parent pages
- Click **entity/period filters** to change context
- Hover over icons for tooltips
- Look for **✨ Quick Actions** in corners of pages
        `
      }
    ]
  },
  {
    id: 'features',
    title: 'Features Guide',
    icon: Zap,
    color: 'from-purple-500 to-pink-500',
    articles: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        description: 'Understanding your consolidation dashboard',
        readTime: '5 min',
        content: `
# Dashboard

The dashboard provides a real-time overview of your consolidation status.

## Key Metrics

### Consolidation Status
- **Ready**: All entities have trial balance data for the period
- **Pending**: Missing data from one or more entities
- **In Progress**: Consolidation is being calculated
- **Completed**: Consolidation is complete and ready for reporting

### Entity Health
Shows the data completeness for each entity:
- ✅ Green: All required data present
- ⚠️ Yellow: Some data missing
- ❌ Red: Critical data missing

### Recent Activity
Chronological log of:
- Data uploads
- Consolidation runs
- Report generations
- User actions

## Quick Actions

- **Upload Trial Balance**: Jump directly to upload
- **Run Consolidation**: Start consolidation for selected period
- **View Reports**: Access your latest reports
- **Sync from ERP**: Trigger data sync

## Filters

- **Period**: Select fiscal period
- **Entity**: Filter by specific entity
- **Statement Type**: BS or P&L view

## Best Practices

1. Check dashboard daily during close period
2. Monitor entity health metrics
3. Review recent activity for audit trail
4. Use quick actions for common tasks
        `
      },
      {
        id: 'upload',
        title: 'Data Upload',
        description: 'Import trial balance and master data',
        readTime: '10 min',
        content: `
# Data Upload

Upload trial balance data manually or sync from your ERP.

## Upload Methods

### 1. Excel Upload

**Single Entity Mode**:
1. Click **Download Template**
2. Fill in the Excel file:
   - GL Code (required)
   - GL Name (required)
   - Debit Amount
   - Credit Amount
3. Select **Entity** and **Period**
4. Click **Upload Trial Balance**

**Bulk Mode** (multiple entities):
1. Download bulk template
2. Include entity_code column
3. Upload once for all entities

### 2. ERP Sync

**Prerequisites**:
- ERP integration configured in `/integrations`
- Entity mapping set up in Consol Config

**Steps**:
1. Click **Sync from ERP**
2. Select integration
3. Select entity
4. Select period
5. Click **Preview** to see changes
6. Click **Proceed with Sync**

## Data Validation

CLOE validates:
- ✅ Debit = Credit for each entity
- ✅ GL codes exist in chart of accounts
- ✅ Period is valid
- ✅ No duplicate GL codes per entity/period

## Upsert Logic

When uploading to an existing period:
- Existing GLs are **updated** with new amounts
- New GLs are **added**
- Missing GLs are **removed** (bulk upload only)

## Version Control

Every upload creates a **snapshot**:
- View history in sync panel
- Rollback to any previous version
- Compare changes between versions

## Tips

- Use **Preview** before syncing to avoid errors
- Download current data before uploading
- Check validation results carefully
- Use bulk upload for efficiency
        `
      },
      {
        id: 'consol-config',
        title: 'Consolidation Configuration',
        description: 'Set up entities, currencies, and structure',
        readTime: '12 min',
        content: `
# Consolidation Configuration

Configure your group structure and settings.

## Group Structure

### Creating Entities

**Required Fields**:
- Entity Code: Unique identifier (e.g., "SUB001")
- Entity Name: Legal name
- Entity Type: Parent, Subsidiary, Branch, Joint Venture
- Ownership %: 0-100%
- Functional Currency
- Region

**Optional Fields**:
- Parent Entity: For hierarchical structure
- Consolidation Method: Full, Proportional, Equity
- Tax Jurisdiction
- Financial Year End
- Status: Active/Inactive

### Ownership Structures

**Simple Hierarchy**:
\`\`\`
Parent (100%)
  ├── Sub A (100%)
  └── Sub B (100%)
\`\`\`

**Complex Ownership**:
\`\`\`
Parent (100%)
  ├── Sub A (60%)
  │   └── Sub C (80%)
  └── Sub B (100%)
\`\`\`

**Split Ownership** (two parents):
- Use parent_entity_id_2 field
- Specify ownership_percentage_2
- System calculates effective ownership

### Entity Mapping (ERP)

Map ERP subsidiaries to CLOE entities:
1. Click **Map ERP Entities**
2. Select integration
3. Map each ERP subsidiary to CLOE entity
4. Click **Save Mappings**

This enables automatic data routing during sync.

## Currencies

### Setting Up Currencies

1. Navigate to **Currencies** tab
2. Click **Add Currency**
3. Fill in:
   - Currency Code (USD, EUR, GBP)
   - Currency Name
   - Symbol ($, €, £)
4. Mark one as **Group Reporting Currency**
5. Enter exchange rates

### Exchange Rate Types

- **Closing Rate**: For balance sheet items
- **Average Rate**: For P&L items
- **Historical Rate**: For equity items

### Auto-Fetch Rates

Enable automatic rate fetching:
1. Go to Platform → Settings
2. Enable "Auto-fetch exchange rates"
3. Select rate source (ECB, Fed, etc.)
4. Rates update daily

## Regions

Group entities geographically:
- APAC
- EMEA
- Americas
- etc.

**Benefits**:
- Regional reporting
- Currency netting by region
- Controller assignment

## Controllers

Assign responsibility:
- Entity Controller: Responsible for entity data
- Regional Controller: Oversees region
- Group Controller: Overall consolidation

**Permissions**:
- Controllers can only edit their entities
- Can view group-level reports
- Receive notifications for their scope
        `
      },
      {
        id: 'coa',
        title: 'Chart of Accounts',
        description: 'Managing your IFRS account hierarchy',
        readTime: '10 min',
        content: `
# Chart of Accounts

Manage your 4-level IFRS compliant account hierarchy.

## IFRS Hierarchy

### Level 1: Class
Main financial statement categories:
- **Assets**
- **Liabilities**
- **Equity**
- **Income**
- **Expenses**
- **Intercompany** (for eliminations)

### Level 2: Sub-Class
Subcategories within each class:
- Current Assets
- Non-Current Assets
- Current Liabilities
- Non-Current Liabilities
- etc.

### Level 3: Note
Disclosure notes (e.g., Note 5, Note 10):
- Cash & Cash Equivalents
- Trade Receivables
- Property, Plant & Equipment
- etc.

### Level 4: Sub-Note
Detailed breakdowns:
- Bank Accounts
- Petty Cash
- Accounts Receivable - Trade
- Accounts Receivable - Other
- etc.

## GL Codes Tab

Map individual GL accounts to the hierarchy:

**Example**:
\`\`\`
GL Code: 1001
GL Name: Cash - Bank of America
Class: Assets
Sub-Class: Current Assets
Note: Cash & Cash Equivalents
Sub-Note: Bank Accounts
\`\`\`

### Bulk Upload

1. Download template
2. Fill in mappings
3. Upload
4. System validates and imports

### ERP Sync

Sync GL codes directly from ERP:
1. Click **Sync GL Codes from ERP**
2. Select integration
3. Click **Preview**
4. Review changes
5. Click **Proceed**

## Master Management Tab

Configure the hierarchy levels themselves:

**Adding a New Note**:
1. Go to Master Management
2. Click **Add Hierarchy Level**
3. Fill in:
   - Class Name
   - Sub-Class Name
   - Note Name (new)
   - Statement Type (BS or P&L)
   - Normal Balance (Debit/Credit)
4. Click **Save**

### ERP Sync (Master)

Sync entire hierarchy from ERP:
1. Click **Sync Master from ERP**
2. System fetches ERP account structure
3. Review preview
4. Approve and sync

## Elimination Flags

Mark intercompany accounts:
- Check **To Be Eliminated** for:
  - Intercompany receivables
  - Intercompany payables
  - Intercompany revenue
  - Intercompany expenses
- System auto-eliminates these in consolidation

## Tips

- Use consistent naming conventions
- Align with your audit requirements
- Review mappings quarterly
- Keep master hierarchy stable
        `
      },
      {
        id: 'trial-balance',
        title: 'Trial Balance Viewer',
        description: 'View, edit, and manage GL balances',
        readTime: '8 min',
        content: `
# Trial Balance Viewer

View and manage trial balance data for all entities.

## Viewing Trial Balance

### Filters
- **Entity**: Select one or all entities
- **Period**: Choose fiscal period
- **Search**: Find GL codes or names

### Columns Displayed
- GL Code
- GL Name
- Class / Sub-Class / Note / Sub-Note
- Debit Amount
- Credit Amount
- Net Amount
- Entity

### Financial Metrics
At the top of the page:
- **BS Check**: Assets + IC + Liability + Equity - P&L = 0
- **Profit & Loss**: Revenue + Expenses

## Inline Editing

Edit GL amounts directly:
1. Click **Edit** button on a GL row
2. Modify debit or credit amount
3. Click ✓ to save or ✗ to cancel
4. System recalculates metrics

## Class Assignment

For unmapped GLs:
1. Look for red **Assign Class** button
2. Click to open dropdown
3. Select appropriate class
4. System creates COA entry automatically

## Export

Click **Export to CSV** to download:
- All columns including hierarchy
- Current filters applied
- Formatted for Excel

## Data-Driven Calculations

### Balance Sheet Check Formula:
\`\`\`
(Assets Net) +
(Intercompany Net) +
(Liability Net) +
(Equity Net) -
(P&L Net) = 0
\`\`\`

### P&L Calculation:
\`\`\`
(Revenue Net) + (Expenses Net)
\`\`\`

Note: Revenue is credit normal, expenses is debit normal.

## Tips

- Use search to quickly find accounts
- Filter by entity during review
- Check BS Check = 0 before consolidating
- Export for offline analysis
- Assign classes as you review
        `
      }
    ]
  },
  {
    id: 'erp-integration',
    title: 'ERP Integration',
    icon: Database,
    color: 'from-green-500 to-emerald-500',
    articles: [
      {
        id: 'netsuite',
        title: 'NetSuite Integration Setup',
        description: 'Connect Oracle NetSuite to CLOE',
        readTime: '20 min',
        content: `
# NetSuite Integration Setup

Complete guide to integrating Oracle NetSuite with CLOE.

## Prerequisites

- NetSuite account with Administrator access
- Permission to create integrations
- Token-Based Authentication enabled in NetSuite

## Step 1: Create Integration Record in NetSuite

1. Log in to NetSuite
2. Navigate to **Setup → Integration → Manage Integrations**
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

## Step 3: Assign Permissions

Ensure your NetSuite role has:
- ✅ Lists → Accounts (View, Edit)
- ✅ Lists → Subsidiaries (View)
- ✅ Reports → Trial Balance (View)
- ✅ Reports → Financial Reports (View)
- ✅ Setup → SuiteCloud Development Framework (Full)

## Step 4: Get Account ID

Your NetSuite Account ID is in the URL:
\`\`\`
https://[ACCOUNT_ID].app.netsuite.com/
\`\`\`

Example: If URL is https://1234567.app.netsuite.com/
Account ID is: **1234567**

## Step 5: Configure in CLOE

1. Log in to CLOE
2. Navigate to **Integrations**
3. Click **Add Integration**
4. Fill in:
   - **ERP System**: Oracle NetSuite
   - **Integration Name**: "NetSuite Production"
   - **Account ID**: [Your Account ID]
   - **Realm**: Production (or Sandbox)
   - **Consumer Key**: [From Step 1]
   - **Consumer Secret**: [From Step 1]
   - **Token ID**: [From Step 2]
   - **Token Secret**: [From Step 2]
5. Enable sync options:
   - ✅ Sync Trial Balance
   - ✅ Sync Chart of Accounts
   - ✅ Sync Entities
6. Click **Save Integration**

## Step 6: Test Connection

1. In CLOE integrations page
2. Click **Test Connection** on your integration
3. Wait for verification
4. Status should change to **Connected** (green)

If failed, check:
- Credentials are correct
- Integration is enabled in NetSuite
- Token hasn't expired
- Permissions are granted

## Step 7: Map Entities

1. Navigate to **Consol Config → Group Structure**
2. Click **Map ERP Entities**
3. Select your NetSuite integration
4. System fetches subsidiaries from NetSuite
5. Map each NetSuite subsidiary to CLOE entity:
   \`\`\`
   NetSuite Sub A → Entity A
   NetSuite Sub B → Entity B
   \`\`\`
6. Click **Save Mappings**

## Step 8: Test Data Sync

1. Navigate to **Upload → Trial Balance**
2. Click **Sync from ERP**
3. Select your NetSuite integration
4. Select entity and period
5. Click **Preview**
6. Review the data
7. Click **Proceed with Sync**
8. Verify data appears correctly

## Troubleshooting

### Error: "Invalid Login"
- Verify credentials are correct
- Check token hasn't expired
- Ensure integration is enabled

### Error: "Insufficient Permissions"
- Check role permissions in NetSuite
- Verify user has Administrator role
- Enable SuiteCloud permissions

### Error: "No Subsidiaries Found"
- Verify subsidiary feature is enabled
- Check permissions to view subsidiaries
- Ensure role has access

### Error: "Timeout"
- NetSuite may be slow
- Try again in a few minutes
- Check NetSuite system status

## Best Practices

1. **Use Production Integration Only**: Don't mix sandbox and production
2. **Rotate Tokens Annually**: Create new tokens yearly
3. **Monitor Sync History**: Review logs regularly
4. **Test Before Close**: Run test syncs before month-end
5. **Document Mappings**: Keep record of entity mappings

## API Rate Limits

NetSuite has governance limits:
- 1,000 requests per hour (standard)
- 4,000 requests per hour (premium)

CLOE optimizes requests to stay within limits.

## Security

- Credentials encrypted in CLOE database
- TLS/SSL for all API calls
- Token-based auth (no passwords)
- Regular security audits

## Support

NetSuite issues:
- Contact NetSuite Support
- Reference: Integration ID from Setup

CLOE issues:
- Submit ticket in CLOE Docs → Support
- Provide: Integration ID, Error message
        `
      },
      {
        id: 'sap',
        title: 'SAP Integration Setup',
        description: 'Connect SAP ERP to CLOE',
        readTime: '18 min',
        content: `
# SAP Integration Setup

Complete guide to integrating SAP ERP with CLOE.

## Prerequisites

- SAP ERP (ECC or S/4HANA)
- User with RFC permissions
- Network connectivity to SAP system

## Step 1: Create SAP User

In SAP GUI:
1. Transaction: **SU01**
2. Click **Create**
3. Fill in:
   - User ID: "CLOE_SYNC"
   - User Type: System
   - Valid From/To: Set appropriately
4. Go to **Logon Data** tab:
   - Set initial password
5. Click **Save**

## Step 2: Assign Roles

Transaction: **PFCG**

Create or assign role with:
- **FI-GL**: General Ledger Display (FB03)
- **FB03**: Display G/L Account Document
- **FSE1**: Display Trial Balance
- **SKA1**: Display G/L Accounts
- **T001**: Company Codes Display
- **RFC Access**: For remote function calls

## Step 3: Enable RFC

1. Transaction: **SM59**
2. Create RFC Destination:
   - RFC Destination: "CLOE_EXTERNAL"
   - Connection Type: "T" (TCP/IP)
   - Activation Type: Registered Server Program
3. Configure:
   - Program ID: "CLOE_INTEGRATION"
   - Gateway Host: [Your SAP Host]
   - Gateway Service: sapgw00
4. Click **Test Connection**

## Step 4: Get Connection Details

You'll need:
- **System ID (SID)**: e.g., "PRD"
- **Client**: e.g., "100"
- **Host**: SAP application server hostname
- **System Number**: e.g., "00"
- **Language**: "EN" (English)

## Step 5: Configure in CLOE

1. Log in to CLOE
2. Navigate to **Integrations**
3. Click **Add Integration**
4. Fill in:
   - **ERP System**: SAP
   - **Integration Name**: "SAP Production"
   - **System ID**: [Your SID]
   - **Client**: [Your Client]
   - **Host**: [SAP Hostname]
   - **Language**: EN
   - **Username**: CLOE_SYNC
   - **Password**: [SAP User Password]
5. Enable sync options:
   - ✅ Sync Trial Balance
   - ✅ Sync Chart of Accounts
   - ✅ Sync Entities
6. Click **Save Integration**

## Step 6: Test Connection

1. Click **Test Connection**
2. CLOE will:
   - Connect to SAP via RFC
   - Verify credentials
   - Check permissions
3. Status should show **Connected**

## Step 7: Map Company Codes

SAP uses Company Codes instead of subsidiaries:

1. Navigate to **Consol Config → Group Structure**
2. Click **Map ERP Entities**
3. System fetches company codes from SAP
4. Map each company code to CLOE entity:
   \`\`\`
   SAP CC 1000 → Entity A
   SAP CC 2000 → Entity B
   \`\`\`
5. Click **Save Mappings**

## Step 8: Configure Chart of Accounts

SAP has multiple chart of accounts:

1. In CLOE integration settings
2. Specify:
   - **Operating Chart of Accounts**: e.g., "INT"
   - **Country Chart of Accounts**: e.g., "CAUS"
3. CLOE will sync from operating COA

## Step 9: Test Data Sync

1. Navigate to **Upload → Trial Balance**
2. Click **Sync from ERP**
3. Select SAP integration
4. Select:
   - Company Code (entity)
   - Fiscal Year
   - Period
5. Click **Preview**
6. Review GL balances
7. Click **Proceed**

## SAP-Specific Features

### Fiscal Year Variant
SAP uses fiscal year variants. CLOE maps:
- SAP Period 001 → January
- SAP Period 012 → December
- SAP Period 013-016 → Special periods (excluded by default)

### Document Types
Filter by SAP document types:
- SA: G/L account document
- AA: Asset accounting
- KR: Vendor invoice
- DR: Customer invoice

### Ledger Selection
If using multiple ledgers:
- Specify Leading Ledger in integration settings
- Default: "0L" (Standard Ledger)

## Troubleshooting

### Error: "RFC Connection Failed"
- Check network connectivity
- Verify SAP system is running
- Confirm gateway service

### Error: "Authorization Error"
- Check user has required roles
- Verify RFC permissions
- Review authorization trace (ST01)

### Error: "No Data Returned"
- Verify posting period is open
- Check fiscal year variant
- Confirm GL data exists

## Security

- Use dedicated system user
- Rotate password quarterly
- Limit permissions to read-only
- Monitor RFC logs (SM58)
- Enable audit logging

## Performance

For large datasets:
- Sync runs in background (SAP job)
- Chunks data into batches
- Progress visible in CLOE
- Estimated time shown

## Support

SAP BASIS team:
- RFC configuration issues
- User authorization problems
- Performance optimization

CLOE support:
- Data mapping issues
- Sync errors
- Integration configuration
        `
      },
      {
        id: 'quickbooks',
        title: 'QuickBooks Integration Setup',
        description: 'Connect QuickBooks Online to CLOE',
        readTime: '15 min',
        content: `
# QuickBooks Integration Setup

Connect QuickBooks Online to CLOE using OAuth 2.0.

## Prerequisites

- QuickBooks Online account
- Company Administrator access
- Intuit Developer account (free)

## Step 1: Create Intuit Developer App

1. Go to **https://developer.intuit.com**
2. Sign in with your Intuit account
3. Click **My Apps** → **Create an App**
4. Select **QuickBooks Online and Payments**
5. Fill in:
   - **App Name**: "CLOE Integration"
   - **Select Scopes**:
     - ✅ Accounting
     - ✅ Payment
6. Click **Create App**

## Step 2: Get App Credentials

1. In your app dashboard
2. Go to **Keys & OAuth** tab
3. Select **Production** environment
4. Note down:
   - **Client ID**
   - **Client Secret**
5. Set **Redirect URI**: https://your-cloe-domain.com/api/integrations/quickbooks/callback

## Step 3: Configure in CLOE

1. Log in to CLOE
2. Navigate to **Integrations**
3. Click **Add Integration**
4. Fill in:
   - **ERP System**: QuickBooks
   - **Integration Name**: "QuickBooks Online"
   - **Client ID**: [From Step 2]
   - **Client Secret**: [From Step 2]
   - **Environment**: Production
5. Click **Save Integration**

## Step 4: Authorize Connection

1. Click **Connect to QuickBooks**
2. You'll be redirected to Intuit
3. Log in to QuickBooks
4. Select your company
5. Click **Authorize**
6. You'll be redirected back to CLOE
7. Status should show **Connected**

## Step 5: Get Company ID

After authorization, CLOE automatically:
- Retrieves Realm ID (Company ID)
- Stores in integration settings
- Displayed in integration card

## Step 6: Map Classes (if used)

QuickBooks uses Classes for departments/divisions:

1. Navigate to **Consol Config → Group Structure**
2. Click **Map ERP Entities**
3. If using QB Classes:
   - Map each class to CLOE entity
4. If not using classes:
   - Map company to single entity

## Step 7: Configure Sync Settings

In CLOE integration settings:

**Chart of Accounts**:
- Sync all active accounts
- Filter by account type (optional)

**Trial Balance**:
- Specify date range
- Select basis: Cash or Accrual

**Exclusions** (optional):
- Exclude inactive accounts
- Exclude zero-balance accounts

## Step 8: Test Sync

1. Navigate to **Upload → Trial Balance**
2. Click **Sync from ERP**
3. Select QuickBooks integration
4. Select period
5. Click **Preview**
6. Review data
7. Click **Proceed**

## QuickBooks-Specific Features

### Account Types
QuickBooks account types map to CLOE classes:
\`\`\`
Bank → Assets (Current)
Accounts Receivable → Assets (Current)
Other Current Asset → Assets (Current)
Fixed Asset → Assets (Non-Current)
Accounts Payable → Liabilities (Current)
Credit Card → Liabilities (Current)
Long Term Liability → Liabilities (Non-Current)
Equity → Equity
Income → Income
Cost of Goods Sold → Expenses
Expense → Expenses
Other Income → Income
Other Expense → Expenses
\`\`\`

### Reporting Basis
- **Accrual**: Revenue when earned, expenses when incurred
- **Cash**: Revenue when received, expenses when paid

Choose basis in sync settings.

### Multi-Currency
If using QB multi-currency:
- Home currency set as functional
- Foreign currency transactions converted
- Exchange rates from QB

## OAuth Token Refresh

OAuth tokens expire after 100 days:
- CLOE automatically refreshes
- No manual intervention needed
- Reauthorize if refresh fails

## Troubleshooting

### Error: "Invalid Grant"
- Token expired
- Click **Reconnect** to reauthorize

### Error: "Company Not Found"
- Wrong company selected during auth
- Reauthorize and select correct company

### Error: "Insufficient Permissions"
- User doesn't have admin access
- Contact QB company admin

### Error: "Rate Limit Exceeded"
- QB API limits: 500 requests/minute
- CLOE automatically throttles
- Wait and retry

## API Limits

QuickBooks API limits:
- 500 requests per minute per app
- 1,000 requests per hour (minor version)

CLOE handles this by:
- Batching requests
- Implementing retry logic
- Showing progress bar

## Security

- OAuth 2.0 (industry standard)
- Tokens encrypted in database
- HTTPS for all requests
- Auto-refresh tokens
- Revoke access anytime in QB

## Best Practices

1. **Use Admin Account**: For initial setup
2. **Set Up Auto-Sync**: Schedule nightly sync
3. **Monitor Sync Logs**: Check for errors
4. **Map Classes Correctly**: Ensure accurate entity mapping
5. **Test Before Close**: Run test sync before month-end

## Support

QuickBooks issues:
- Intuit Developer Support
- QuickBooks Community

CLOE issues:
- Submit ticket in CLOE
- Provide: Integration ID, Company ID
        `
      },
      {
        id: 'tally',
        title: 'Tally ERP Integration Setup',
        description: 'Connect Tally ERP to CLOE',
        readTime: '12 min',
        content: `
# Tally ERP Integration Setup

Connect Tally ERP 9 or Tally Prime to CLOE using TallyConnector.

## Prerequisites

- Tally ERP 9 (Release 6.0 or higher) or Tally Prime
- ODBC feature enabled in Tally
- Network connectivity to Tally server
- Administrative access to Tally

## Step 1: Enable ODBC in Tally

1. Open Tally
2. Go to **Gateway of Tally**
3. Press **F1** (Help) → **TDL & Customization**
4. Press **F3** (Company Features)
5. Enable:
   - ✅ **Integrate with** → **ODBC**
6. Set **ODBC Port**: 9000 (default)
7. Accept

## Step 2: Configure TallyServer (Optional)

For remote access:

1. Open **Configuration** in Tally
2. Go to **TallyServer.9000**
3. Set:
   - **Port**: 9000
   - **Access**: Allow all (or specific IPs)
   - **Security**: Set password (recommended)
4. Save configuration

## Step 3: Get Tally Company Details

You'll need:
- **Company Name**: Exact name in Tally
- **Host**: IP address or hostname where Tally runs
- **Port**: 9000 (or custom port)
- **Financial Year**: Fiscal year to sync

## Step 4: Test Connectivity

From CLOE server, test Tally connection:

**Windows**:
CODE_BLOCK_START
telnet [Tally-Host] 9000
CODE_BLOCK_START

**Linux**:
CODE_BLOCK_BASH
nc -zv [Tally-Host] 9000
CODE_BLOCK_START

Should return: "Connected"

## Step 5: Configure in CLOE

1. Log in to CLOE
2. Navigate to **Integrations**
3. Click **Add Integration**
4. Fill in:
   - **ERP System**: Tally ERP
   - **Integration Name**: "Tally Production"
   - **Host**: [Tally Server IP/Hostname]
   - **Port**: 9000
   - **Company Name**: [Exact Tally Company Name]
5. Enable sync options:
   - ✅ Sync Trial Balance
   - ✅ Sync Chart of Accounts
6. Click **Save Integration**

## Step 6: Test Connection

1. Click **Test Connection**
2. CLOE will:
   - Connect to Tally ODBC
   - Verify company exists
   - Check permissions
3. Status should show **Connected**

If failed:
- Check Tally is running
- Verify ODBC is enabled
- Confirm firewall allows port 9000
- Ensure company name is exact

## Step 7: Map Ledger Groups

Tally uses Ledger Groups (similar to account classes):

1. Navigate to **Consol Config → Group Structure**
2. If you have multiple companies in Tally:
   - Create entity for each
   - Map in **Map ERP Entities**
3. For single company:
   - Map to single CLOE entity

## Step 8: Configure Account Mapping

Tally → CLOE class mapping:

**Tally Group** → **CLOE Class**
\`\`\`
Cash-in-Hand → Assets (Current)
Bank Accounts → Assets (Current)
Sundry Debtors → Assets (Current)
Stock-in-Hand → Assets (Current)
Fixed Assets → Assets (Non-Current)
Sundry Creditors → Liabilities (Current)
Bank OD → Liabilities (Current)
Duties & Taxes → Liabilities (Current)
Loans (Liability) → Liabilities (Non-Current)
Capital Account → Equity
Reserves & Surplus → Equity
Sales Accounts → Income
Purchase Accounts → Expenses
Direct Expenses → Expenses
Indirect Expenses → Expenses
\`\`\`

## Step 9: Test Data Sync

1. Navigate to **Upload → Trial Balance**
2. Click **Sync from ERP**
3. Select Tally integration
4. Select:
   - Company (entity)
   - Financial Year
   - Period (month)
5. Click **Preview**
6. Review ledger balances
7. Click **Proceed**

## Tally-Specific Features

### Multi-Company Support
If managing multiple companies:
1. Create separate integration for each
2. Or use company selector in sync

### Voucher Type Filtering
Filter by voucher types:
- Sales
- Purchase
- Payment
- Receipt
- Journal
- Contra

### Cost Centers
If using Tally Cost Centers:
- Map to CLOE entities
- Enables department-wise consolidation

### Godown/Location
If tracking by location:
- Can map to CLOE entities
- Useful for multi-location businesses

## Period Mapping

Tally fiscal year → CLOE period:
\`\`\`
Apr 2024 - Mar 2025 → FY 2024-25
Period 1 (Apr) → 2024-04-30
Period 2 (May) → 2024-05-31
...
Period 12 (Mar) → 2025-03-31
\`\`\`

## Troubleshooting

### Error: "Connection Refused"
- Check Tally is running
- Verify ODBC port is 9000
- Confirm firewall settings
- Test with telnet

### Error: "Company Not Found"
- Company name must match exactly
- Check spelling and spaces
- Use name from Tally company list

### Error: "No Data Returned"
- Verify financial year has data
- Check period has transactions
- Confirm vouchers are saved

### Error: "Timeout"
- Large dataset may take time
- Increase timeout in CLOE settings
- Consider breaking into smaller periods

## Performance Tips

For large Tally companies:
- Sync one month at a time
- Use period-end dates
- Schedule sync during off-hours
- Monitor Tally server resources

## Security

- Set ODBC password in Tally
- Limit ODBC access to CLOE IP only
- Use VPN for remote connections
- Enable Tally Security Control
- Regular backups before sync

## Support

Tally issues:
- Tally Solutions support
- Tally Partner

CLOE issues:
- Submit ticket with:
  - Tally version
  - Company name
  - Error message
        `
      }
    ]
  },
  {
    id: 'advanced',
    title: 'Advanced Topics',
    icon: Shield,
    color: 'from-orange-500 to-red-500',
    articles: [
      {
        id: 'eliminations',
        title: 'Intercompany Eliminations',
        description: 'Automate elimination of intercompany transactions',
        readTime: '15 min',
        content: `
# Intercompany Eliminations

Eliminate intercompany transactions for accurate consolidated financials.

## Types of Eliminations

### 1. Intercompany Receivables/Payables
**Example**: Entity A owes Entity B $10,000

**Before Elimination**:
\`\`\`
Entity A: Accounts Payable (B) = $10,000 Credit
Entity B: Accounts Receivable (A) = $10,000 Debit
\`\`\`

**Elimination Entry**:
\`\`\`
Debit: Accounts Payable (Entity A) = $10,000
Credit: Accounts Receivable (Entity B) = $10,000
\`\`\`

### 2. Intercompany Revenue/Expense
**Example**: Entity A invoices Entity B for $5,000 services

**Before Elimination**:
\`\`\`
Entity A: Revenue = $5,000 Credit
Entity B: Expense = $5,000 Debit
\`\`\`

**Elimination Entry**:
\`\`\`
Debit: Revenue (Entity A) = $5,000
Credit: Expense (Entity B) = $5,000
\`\`\`

### 3. Inventory in Transit
**Example**: Entity A sold goods to Entity B for $3,000 (cost $2,000)

**Unrealized Profit Elimination**:
\`\`\`
Debit: Revenue (Entity A) = $3,000
Credit: Cost of Sales (Entity A) = $2,000
Credit: Inventory (Entity B) = $1,000
\`\`\`

## Setting Up Eliminations

### Step 1: Mark Elimination Accounts

In Chart of Accounts:
1. Find intercompany accounts
2. Check **To Be Eliminated** box
3. Save

**Typical Accounts to Mark**:
- Intercompany Receivables
- Intercompany Payables
- Intercompany Revenue
- Intercompany Expenses
- Due From/To Group Companies

### Step 2: Create Elimination Templates

1. Navigate to **Eliminations → Templates**
2. Click **Create New Template**
3. Name: "IC Receivables/Payables"
4. Add journal lines:
   - Debit account
   - Credit account
   - Amount (can be variable)
5. Save template

### Step 3: Create Manual Elimination

1. Navigate to **Eliminations → Journal Entries**
2. Click **Create New Entry**
3. Fill in:
   - Entry Name
   - Period
   - Description
4. Add lines:
   - Select entities
   - Select GL codes
   - Enter amounts
5. Ensure Debit = Credit
6. Click **Save and Post**

### Step 4: Use GL Pair Matching

For automatic matching:

1. Navigate to **Eliminations → GL Pairs**
2. Click **Create Pair**
3. Set up matching:
   - **GL1**: Entity A, Account 2110 (IC Payable)
   - **GL2**: Entity B, Account 1210 (IC Receivable)
   - **Difference GL**: 9999 (IC Variance)
4. Save
5. Run **Auto-Match** to find balances
6. System creates elimination entry

## Elimination Process

### Automatic Elimination

During consolidation, CLOE:
1. Identifies accounts marked "To Be Eliminated"
2. Matches pairs across entities
3. Creates elimination entries
4. Applies to consolidation working
5. Shows in elimination column

### Manual Elimination

For complex scenarios:
1. Create journal entry
2. Specify entities and accounts
3. Enter amounts
4. Post to consolidation

## Best Practices

### 1. Consistent Coding
Use dedicated account ranges:
- 1200-1299: IC Receivables
- 2200-2299: IC Payables
- 4900-4999: IC Revenue
- 5900-5999: IC Expenses

### 2. Entity-Specific Accounts
Create accounts per counterparty:
- 1210: Due from Entity A
- 1220: Due from Entity B
- 2210: Due to Entity A
- 2220: Due to Entity B

### 3. Regular Reconciliation
- Reconcile IC accounts monthly
- Investigate unmatched amounts
- Clear old balances
- Document differences

### 4. Audit Trail
- Document all eliminations
- Attach supporting schedules
- Get approvals
- Review by external auditor

## Partial Ownership Eliminations

For 60% owned subsidiary:

**Full Elimination** (still required):
- 100% of IC revenue/expense
- 100% of IC receivables/payables

**NCI Consideration**:
- Unrealized profit eliminated 100%
- NCI share shown separately in equity

## Currency Considerations

If entities use different currencies:
1. Translate to group currency first
2. Then eliminate
3. Exchange differences go to FCTR

**Example**:
\`\`\`
Entity A (USD): IC Receivable = $10,000
Entity B (EUR): IC Payable = €9,200
Spot Rate: 1 EUR = 1.10 USD
Translated: €9,200 × 1.10 = $10,120
Difference: $120 → FCTR
\`\`\`

## Reporting

Consolidation working shows:
- **Entity Columns**: Original amounts
- **Elimination Column**: All eliminations
- **Consolidated Column**: Net of eliminations

Balance sheet should show:
- No intercompany receivables
- No intercompany payables
- Net of IC revenue/expense

## Troubleshooting

### Unmatched IC Balances
**Causes**:
- Timing differences
- In-transit items
- Exchange rate differences
- Booking errors

**Resolution**:
1. Reconcile with counterparty
2. Investigate differences
3. Adjust if needed
4. Document variance

### Elimination Not Working
**Check**:
- Accounts marked correctly
- GL pairs set up
- Period matches
- Entities included in consolidation

## Support

For complex eliminations:
- Review IFRS 10
- Consult with auditor
- Use templates
- Contact CLOE support
        `
      },
      {
        id: 'currency-translation',
        title: 'Multi-Currency Translation',
        description: 'Translate foreign currency financial statements',
        readTime: '18 min',
        content: `
# Multi-Currency Translation

Translate foreign subsidiary financials to group reporting currency.

## Translation Methods

### 1. Current Rate Method
Used for self-sustaining foreign operations.

**Balance Sheet**:
- Assets & Liabilities: Closing Rate
- Equity: Historical Rate
- Difference: Foreign Currency Translation Reserve (FCTR)

**Income Statement**:
- All items: Average Rate
- Or: Actual rate at transaction date

### 2. Temporal Method
Used for integrated foreign operations.

**Balance Sheet**:
- Monetary items: Closing Rate
- Non-monetary items: Historical Rate

**Income Statement**:
- Revenue/Expenses: Average Rate
- Depreciation: Historical Rate
- Exchange gains/losses: Profit or Loss

## Setting Up Translation

### Step 1: Configure Currencies

1. Navigate to **Consol Config → Currencies**
2. Add all currencies used by entities
3. Mark one as **Group Reporting Currency** (e.g., USD)
4. Enter exchange rates:
   - Closing Rate (period-end)
   - Average Rate (period average)

### Step 2: Set Entity Functional Currency

1. Navigate to **Consol Config → Group Structure**
2. For each entity, set:
   - **Functional Currency**: Local currency
   - **Presentation Currency**: (Optional) If different

**Example**:
\`\`\`
Entity A: Functional = EUR, Presentation = EUR
Entity B: Functional = GBP, Presentation = USD
Entity C: Functional = JPY, Presentation = USD
\`\`\`

### Step 3: Create Translation Rules

1. Navigate to **Platform → Translation Rules**
2. Click **Create Rule**
3. Set up:
   - **Entity**: Which entity
   - **From Currency**: Functional currency
   - **To Currency**: Group reporting currency
   - **Applies To**: All / Class / Specific GL
   - **Rate Type**: Closing / Average / Historical
   - **FCTR Account**: Where to book translation differences

**Example Rule**:
\`\`\`
Entity: UK Subsidiary
From: GBP
To: USD
Applies To: Assets (Class)
Rate Type: Closing Rate
FCTR Account: 3900 (FCTR - Reserve)
\`\`\`

### Step 4: Enter Exchange Rates

**Manual Entry**:
1. Go to **Consol Config → Currencies**
2. Click currency
3. Click **Add Rate**
4. Enter:
   - Period
   - Closing Rate
   - Average Rate
5. Save

**Auto-Fetch** (if enabled):
- Rates fetched daily from ECB/Fed
- Closing rate = last day of period
- Average rate = arithmetic mean of daily rates

**Example Rates (Dec 2024)**:
\`\`\`
EUR/USD:
  Closing: 1.0850
  Average: 1.0920

GBP/USD:
  Closing: 1.2650
  Average: 1.2720

USD/JPY:
  Closing: 149.50
  Average: 148.20
\`\`\`

## Translation Process

### Step 1: Upload Functional Currency Data

Upload trial balance in entity's functional currency:
\`\`\`
Entity: UK Sub
GL 1001: Cash = £100,000
GL 2001: AP = £50,000
GL 4001: Revenue = £200,000
\`\`\`

### Step 2: Run Translation

1. Navigate to **Consolidation → Translations**
2. Select period
3. Select entity
4. Click **Calculate Translation**

System applies rules:
\`\`\`
Cash (Asset):
  £100,000 × 1.2650 (Closing) = $126,500

AP (Liability):
  £50,000 × 1.2650 (Closing) = $63,250

Revenue (Income):
  £200,000 × 1.2720 (Average) = $254,400
\`\`\`

### Step 3: Review Translation Adjustment

FCTR (balancing amount) calculated:
\`\`\`
Assets (translated) = $XXX
Liabilities (translated) = $XXX
Equity (historical) = $XXX
Income (average) = $XXX
Expenses (average) = $XXX

FCTR = Plug to balance
\`\`\`

### Step 4: Include in Consolidation

Translated amounts flow to consolidation working:
- Entity columns show translated amounts
- Elimination entries applied
- Consolidated total calculated

## Class-Specific Rules

Different classes need different rates:

**Balance Sheet**:
\`\`\`
Current Assets → Closing Rate
Non-Current Assets → Closing Rate
  (Except: PPE can use Historical if temporal method)
Current Liabilities → Closing Rate
Non-Current Liabilities → Closing Rate
Equity → Historical Rate
\`\`\`

**Income Statement**:
\`\`\`
Revenue → Average Rate
Cost of Sales → Average Rate
Operating Expenses → Average Rate
Finance Costs → Average Rate
Tax → Average Rate
\`\`\`

## Historical Rate Tracking

For equity and non-monetary items at historical rate:

1. System tracks original transaction date
2. Uses exchange rate from that date
3. Maintains historical cost

**Example**:
\`\`\`
Building purchased 3 years ago:
  Cost: €1,000,000
  Rate at purchase: 1.15
  Historical USD: $1,150,000
  (Not retranslated at closing rate)
\`\`\`

## Hyperinflationary Economies

For highly inflationary economies (>100% over 3 years):

1. Apply IAS 29 adjustment first
2. Then translate to group currency
3. Use closing rate for all items

Mark entity as hyperinflationary:
- Consol Config → Entity → Hyperinflationary = Yes

## Presentation Currency vs Functional

If presentation ≠ functional:

1. Translate from functional to presentation
2. Then consolidate all entities
3. Final statements in group reporting currency

**Example**:
\`\`\`
Entity B: Functional = GBP, Presentation = USD

Step 1: Translate GBP → USD (entity level)
Step 2: Consolidate USD amounts (group level)
\`\`\`

## FCTR in Equity

Translation differences go to equity:
\`\`\`
Consolidated Balance Sheet:
  Assets: $XXX
  Liabilities: $XXX
  Equity:
    Share Capital: $XXX
    Retained Earnings: $XXX
    FCTR: $XXX (separate line)
\`\`\`

On disposal of foreign operation:
- Recycle FCTR to profit or loss
- Show as gain/loss on disposal

## Audit Considerations

Auditors will check:
- ✅ Correct rate used for each class
- ✅ FCTR calculation accurate
- ✅ Rates from reliable source
- ✅ Documentation of translation method
- ✅ Disclosure of rate changes
- ✅ Sensitivity analysis

## Best Practices

1. **Document Method**: Current rate or temporal
2. **Source Rates**: Use reliable source (central bank)
3. **Rate Consistency**: Same rate for all entities in same currency
4. **Monthly Review**: Check rate movements
5. **Sensitivity Analysis**: Test impact of rate changes
6. **Audit Trail**: Keep rate history

## Troubleshooting

### FCTR Not Balancing
- Check all items have rate assigned
- Verify equity at historical rate
- Ensure income statement uses average rate
- Recalculate translation

### Wrong Rate Used
- Check translation rules
- Verify class assignment
- Review rate date
- Confirm rate source

## Support

Complex translation issues:
- Review IAS 21
- Consult with auditor
- Contact CLOE support with:
  - Entity functional currency
  - Translation method used
  - Rate source
  - FCTR calculation
        `
      }
    ]
  }
];

export default function DocsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState(DOCUMENTATION_SECTIONS[0].id);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'technical',
    priority: 'medium',
    description: '',
    email: ''
  });
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const currentSection = DOCUMENTATION_SECTIONS.find(s => s.id === selectedSection);
  const currentArticle = currentSection?.articles.find(a => a.id === selectedArticle);

  const filteredSections = searchTerm
    ? DOCUMENTATION_SECTIONS.map(section => ({
        ...section,
        articles: section.articles.filter(article =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.content.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(section => section.articles.length > 0)
    : DOCUMENTATION_SECTIONS;

  const handleSubmitTicket = async () => {
    // In production, this would call an API
    console.log('Submitting ticket:', ticketForm);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setTicketSubmitted(true);
    setTimeout(() => {
      setShowTicketModal(false);
      setTicketSubmitted(false);
      setTicketForm({
        subject: '',
        category: 'technical',
        priority: 'medium',
        description: '',
        email: ''
      });
    }, 2000);
  };

  return (
    <div className="h-screen flex flex-col bg-[#f7f5f2]">
      <PageHeader
        title="Documentation & Help"
        subtitle="Everything you need to know about CLOE"
        icon={BookOpen}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search documentation..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredSections.map((section) => (
              <div key={section.id} className="mb-6">
                <button
                  onClick={() => {
                    setSelectedSection(section.id);
                    setSelectedArticle(null);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg mb-2 transition-colors ${
                    selectedSection === section.id && !selectedArticle
                      ? 'bg-gradient-to-r ' + section.color + ' text-white'
                      : 'hover:bg-gray-100 text-slate-900'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    selectedSection === section.id && !selectedArticle
                      ? 'bg-white/20'
                      : 'bg-gray-100'
                  }`}>
                    <section.icon size={20} className={
                      selectedSection === section.id && !selectedArticle ? 'text-white' : 'text-slate-600'
                    } />
                  </div>
                  <span className="font-semibold">{section.title}</span>
                </button>

                {selectedSection === section.id && (
                  <div className="ml-4 space-y-1">
                    {section.articles.map((article) => (
                      <button
                        key={article.id}
                        onClick={() => setSelectedArticle(article.id)}
                        className={`w-full text-left p-2 rounded-lg flex items-start gap-2 transition-colors ${
                          selectedArticle === article.id
                            ? 'bg-blue-50 text-blue-700'
                            : 'hover:bg-gray-50 text-slate-700'
                        }`}
                      >
                        <ChevronRight size={16} className="mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{article.title}</div>
                          <div className="text-xs text-gray-500">{article.readTime}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Support Ticket Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => setShowTicketModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <MessageSquare size={20} />
              Create Support Ticket
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {currentArticle ? (
            /* Article View */
            <div className="max-w-4xl mx-auto p-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Article Header */}
                <div className={`bg-gradient-to-r ${currentSection.color} p-8 text-white`}>
                  <div className="flex items-center gap-2 text-sm mb-3 opacity-90">
                    <currentSection.icon size={16} />
                    <span>{currentSection.title}</span>
                    <ChevronRight size={16} />
                    <span>{currentArticle.title}</span>
                  </div>
                  <h1 className="text-3xl font-bold mb-2">{currentArticle.title}</h1>
                  <p className="text-lg opacity-90">{currentArticle.description}</p>
                  <div className="flex items-center gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{currentArticle.readTime} read</span>
                    </div>
                  </div>
                </div>

                {/* Article Content */}
                <div className="p-8 prose prose-slate max-w-none">
                  {currentArticle.content.split('\n').map((line, idx) => {
                    // Simple markdown rendering
                    if (line.startsWith('# ')) {
                      return <h1 key={idx} className="text-3xl font-bold text-slate-900 mt-8 mb-4">{line.slice(2)}</h1>;
                    } else if (line.startsWith('## ')) {
                      return <h2 key={idx} className="text-2xl font-bold text-slate-900 mt-6 mb-3">{line.slice(3)}</h2>;
                    } else if (line.startsWith('### ')) {
                      return <h3 key={idx} className="text-xl font-bold text-slate-900 mt-4 mb-2">{line.slice(4)}</h3>;
                    } else if (line.startsWith('- ')) {
                      return <li key={idx} className="text-slate-700 ml-4">{line.slice(2)}</li>;
                    } else if (line.startsWith('**') && line.endsWith('**')) {
                      return <p key={idx} className="font-bold text-slate-900 my-2">{line.slice(2, -2)}</p>;
                    } else if (line.startsWith('CODE_BLOCK')) {
                      return null; // Skip code block markers
                    } else if (line.startsWith('```')) {
                      return null; // Skip any remaining backtick markers
                    } else if (line.trim() === '') {
                      return <br key={idx} />;
                    } else {
                      return <p key={idx} className="text-slate-700 my-2">{line}</p>;
                    }
                  })}
                </div>
              </div>

              {/* Related Articles */}
              <div className="mt-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Related Articles</h3>
                <div className="grid gap-4">
                  {currentSection.articles
                    .filter(a => a.id !== currentArticle.id)
                    .slice(0, 3)
                    .map((article) => (
                      <button
                        key={article.id}
                        onClick={() => setSelectedArticle(article.id)}
                        className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all text-left"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-slate-900">{article.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{article.description}</p>
                          </div>
                          <ArrowRight className="text-blue-600 flex-shrink-0 ml-4" size={20} />
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            /* Section Overview */
            <div className="max-w-6xl mx-auto p-8">
              <div className={`bg-gradient-to-r ${currentSection.color} rounded-xl p-8 text-white mb-8`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 bg-white/20 rounded-lg">
                    <currentSection.icon size={32} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">{currentSection.title}</h1>
                    <p className="text-lg opacity-90 mt-2">
                      {currentSection.articles.length} articles in this section
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {currentSection.articles.map((article) => (
                  <button
                    key={article.id}
                    onClick={() => setSelectedArticle(article.id)}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-blue-400 transition-all text-left group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {article.title}
                      </h3>
                      <Play className="text-blue-600 flex-shrink-0 ml-4 group-hover:translate-x-1 transition-transform" size={20} />
                    </div>
                    <p className="text-gray-600 mb-4">{article.description}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock size={16} />
                      <span>{article.readTime}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Support Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex items-center justify-between rounded-t-xl">
              <div>
                <h2 className="text-xl font-bold">Create Support Ticket</h2>
                <p className="text-blue-100 text-sm mt-1">
                  We'll get back to you within 24 hours
                </p>
              </div>
              <button
                onClick={() => setShowTicketModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {ticketSubmitted ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-green-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Ticket Submitted!</h3>
                <p className="text-gray-600">
                  We've received your support request and will respond shortly.
                </p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    value={ticketForm.email}
                    onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                    placeholder="your.email@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                    placeholder="Brief description of your issue"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                    >
                      <option value="technical">Technical Issue</option>
                      <option value="data">Data/Upload Issue</option>
                      <option value="feature">Feature Request</option>
                      <option value="billing">Billing Question</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={ticketForm.priority}
                      onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 resize-none"
                    placeholder="Please provide detailed information about your issue..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowTicketModal(false)}
                    className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitTicket}
                    disabled={!ticketForm.email || !ticketForm.subject || !ticketForm.description}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <Send size={20} />
                    Submit Ticket
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
