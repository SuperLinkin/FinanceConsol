# Entity Logic - Entity Tagging & Impact Analysis Feature

## Overview
Added comprehensive entity assignment and impact calculation features to the Entity Logic page, allowing users to tag logic rules to specific entities and preview the financial impact before applying them.

## New Features

### 1. Entity Assignment
- **Multi-Entity Selection**: Users can assign a single logic rule to multiple entities using checkboxes
- **Assignment Management**: View, add, or remove entity assignments when creating/editing logic
- **Visual Indicators**: Entity count badges in the logic list table showing number of assigned entities
- **Entity Details**: Hover over entity count to see which entities are assigned

### 2. Impact Calculation
Users can now calculate and preview the impact of a logic rule on selected entities:

#### Currency Translation Impact
- Shows which GL accounts will be affected based on account class
- Displays original balance, translated amount, and FCTR impact
- Uses exchange rates to calculate translation differences
- Preview of top 5 most impacted accounts

#### Full Consolidation Impact
- Calculates ownership percentage application
- Shows NCI (Non-Controlling Interest) portion
- Displays consolidated amounts for all accounts
- Impact summary with total amounts

#### Custom Calculation Impact
- Shows affected accounts based on custom formula
- Displays formula application preview
- Total impact calculation

### 3. Database Integration

#### New Table: `entity_logic_assignments`
```sql
- id: uuid (primary key)
- logic_id: uuid (foreign key to entity_logic)
- entity_id: uuid (foreign key to entities)
- is_active: boolean
- priority: integer
- created_at, updated_at: timestamps
```

#### New Functions
- `fetchAllAssignedEntities()`: Loads all entity assignments grouped by logic
- `fetchAssignedEntities(logicId)`: Gets entities assigned to specific logic
- `assignEntitiesToLogic(logicId, entityIds)`: Saves entity assignments (upsert)
- `calculateImpact(entityIds, logicType, config)`: Calculates financial impact

### 4. UI Enhancements

#### Modal Tabs
- **Configuration Tab**: Original logic setup form
- **Entity Assignment & Impact Tab**: New entity management interface

#### Entity Assignment Section
- Scrollable entity list with checkboxes
- Shows entity code, name, and currency details
- Selected entities summary with badges
- Real-time selection counter

#### Impact Preview
- "Calculate Impact" button
- Loading state during calculation
- Expandable impact details
- Color-coded status indicators
- Top 5 affected accounts breakdown

#### Logic List Table
- New "Entities" column showing assignment count
- Building icon with entity count badge
- Tooltip showing entity names on hover
- Blue badge styling for visual consistency

## User Workflow

### Creating Logic with Entity Assignment
1. Click "Create Logic" button
2. Fill in logic configuration (Configuration tab)
3. Switch to "Entity Assignment & Impact" tab
4. Select entities using checkboxes
5. Click "Calculate Impact" to preview effects
6. Review impact analysis (accounts affected, amounts, etc.)
7. Click "Create Logic" to save both logic and assignments

### Editing Logic Assignments
1. Click edit icon on any logic rule
2. Previously assigned entities are pre-selected
3. Modify entity selection as needed
4. Recalculate impact if configuration changed
5. Save to update both logic and assignments

### Viewing Impact
- Impact shows per-entity breakdown
- Total GL accounts affected
- Total financial impact amount
- Top 5 most affected accounts with details
- Expandable/collapsible details section

## Technical Implementation

### State Management
```javascript
- modalTab: Controls Configuration vs Entity Assignment tabs
- selectedEntityIds: Array of selected entity IDs
- assignedEntities: Object mapping logic_id to assigned entities
- impactData: Calculated impact analysis results
- showImpactPreview: Toggle for impact details
- calculatingImpact: Loading state
```

### Impact Calculation Logic
1. Fetches trial balance data for selected entities
2. Enriches with Chart of Accounts class information
3. Applies logic-specific calculations:
   - Translation: Uses exchange rates and account class filters
   - Consolidation: Applies ownership percentages
   - Custom: Applies formula (simplified)
4. Aggregates results and identifies top affected accounts
5. Returns structured impact data for display

### Database Operations
- Upsert pattern: Deletes existing assignments, inserts new ones
- Cascading deletes: Assignments auto-delete when logic is deleted
- Efficient queries: Uses joins to fetch entity details with assignments
- Index optimization: Indexes on logic_id and entity_id for fast lookups

## Files Modified
- `app/entity-logic/page.js`: Main implementation
- `sql/ADD_ENTITY_LOGIC_ASSIGNMENTS.sql`: Database schema

## Dependencies
- Existing: supabase, lucide-react icons
- New Icons: Users, TrendingUp, ChevronDown, ChevronUp, Building2

## Future Enhancements
1. Real-time exchange rate integration (currently uses mock rate)
2. More sophisticated formula parser for custom calculations
3. Impact comparison between different logic configurations
4. Batch assignment of logic to entity groups
5. Impact history tracking and versioning
6. Export impact analysis to Excel

## Testing Checklist
- [ ] Create new logic and assign entities
- [ ] Calculate impact for different logic types
- [ ] Edit existing logic and modify assignments
- [ ] Verify entity count displays correctly in table
- [ ] Test with multiple entities selected
- [ ] Verify impact calculations are accurate
- [ ] Test expand/collapse of impact details
- [ ] Confirm assignments persist after page reload
- [ ] Test deleting logic removes assignments

## SQL Migration Required
Run `sql/ADD_ENTITY_LOGIC_ASSIGNMENTS.sql` in Supabase before using this feature.
