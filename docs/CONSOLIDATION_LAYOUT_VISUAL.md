# Consolidation Workings - Visual Layout Guide

## Full Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Consolidation Workings                                 Multi-entity consol  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Period: [2024 ▼]  Statement: [Balance Sheet ▼]      [Save] [Export]       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ CHART OF ACCOUNTS  │ PARENT  │ SUB A  │ SUB B  │ ELIM  │ ADJ │ CONSOL │    │
│  ├────────────────────┼─────────┼────────┼────────┼───────┼─────┼────────┤    │
│  │ ▼ Assets           │    -    │   -    │   -    │   -   │  -  │   -    │    │
│  │   ▼ Current Assets │    -    │   -    │   -    │   -   │  -  │   -    │    │
│  │     ▼ Cash & CE    │    -    │   -    │   -    │   -   │  -  │   -    │    │
│  │       • Cash (2)   │ 100,000 │ 50,000 │ 30,000 │   0   │  0  │180,000 │    │
│  │       • Banks (3)  │ 200,000 │ 75,000 │ 40,000 │   0   │  0  │315,000 │    │
│  │     ▼ Receivables  │    -    │   -    │   -    │   -   │  -  │   -    │    │
│  │       • Trade AR   │  75,000 │ 40,000 │ 20,000 │(15,000│5,000│125,000 │    │
│  │                    │         │        │        │  ↑    │     │        │    │
│  │                    │         │        │        │ Click │     │        │    │
│  └────────────────────┴─────────┴────────┴────────┴───────┴─────┴────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Color Scheme

```
┌─────────────────────────────────────────────────┐
│ Header Row          │ #101828 (Dark Navy)       │
├─────────────────────────────────────────────────┤
│ Class Row           │ #101828 (Dark Navy)       │
│ Subclass Row        │ #f1f5f9 (Light Grey)      │
│ Note Row            │ #ffffff (White)           │
│ Subnote Row         │ #f8fafc (Very Light Grey) │
├─────────────────────────────────────────────────┤
│ Elimination Column  │ #fef2f2 (Red-50)          │
│ Adjustment Column   │ #eff6ff (Blue-50)         │
│ Consolidated Column │ #eef2ff (Indigo-50)       │
└─────────────────────────────────────────────────┘
```

## Interactive Elements

### 1. Expandable Hierarchy

```
Before Click:
┌─────────────────────┐
│ ▶ Assets            │  ← Click to expand
└─────────────────────┘

After Click:
┌─────────────────────┐
│ ▼ Assets            │  ← Click to collapse
│   ▶ Current Assets  │  ← Click to expand
└─────────────────────┘

Fully Expanded:
┌─────────────────────┐
│ ▼ Assets            │
│   ▼ Current Assets  │
│     ▼ Cash & CE     │
│       • Cash (2)    │  ← Leaf node with 2 accounts
│       • Banks (3)   │  ← Leaf node with 3 accounts
└─────────────────────┘
```

### 2. Elimination Drill-Down

```
Click on elimination amount:
┌────────────────────────────────────────┐
│ Elimination Entries - Trade Receivables│
│                                         │
│ Entry #1: Intercompany AR Elimination  │
│ Date: 2024-12-31                       │
│ Created by: John Doe                   │
│                                         │
│ Dr: Intercompany Payable     15,000    │
│ Cr: Intercompany Receivable  15,000    │
│                                         │
│ Description: Eliminate IC balance      │
│ between Parent and Sub A               │
│                                         │
│ [Close]                                │
└────────────────────────────────────────┘
```

### 3. Adjustment Drill-Down

```
Click on adjustment amount:
┌────────────────────────────────────────┐
│ Adjustment Entries - Trade Receivables │
│                                         │
│ Entry #1: Fair Value Adjustment        │
│ Date: 2024-12-31                       │
│ Created by: Jane Smith                 │
│                                         │
│ Dr: Trade Receivables         5,000    │
│ Cr: Revaluation Reserve       5,000    │
│                                         │
│ Description: FV adjustment on         │
│ acquisition date per PPA               │
│                                         │
│ [Close]                                │
└────────────────────────────────────────┘
```

## Scrolling Behavior

### Horizontal Scroll (Many Entities)

```
Fixed Left                Scrollable Middle               Fixed Right
┌──────────────┐  ┌─────┬─────┬─────┬─────┬─────┐  ┌────────────┐
│ COA          │  │Ent 1│Ent 2│Ent 3│Elim │ Adj │  │ Consolidated│
├──────────────┤  ├─────┼─────┼─────┼─────┼─────┤  ├────────────┤
│ Cash         │  │1,000│2,000│3,000│  0  │  0  │  │    6,000   │
│ AR           │  │5,000│4,000│3,000│(500)│ 100 │  │   11,600   │
└──────────────┘  └─────┴─────┴─────┴─────┴─────┘  └────────────┘
   Always visible    ← Scroll →                     Always visible
```

### Vertical Scroll (Many Accounts)

```
Fixed Top Header
┌─────────────────────────────────────────────────┐
│ COA          │ Parent │ Sub A  │ ... │ Consol  │
├─────────────────────────────────────────────────┤
│ Assets       │   -    │   -    │     │    -    │  ← Always visible
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ ▼ Current    │   -    │   -    │     │    -    │
│   Cash       │ 1,000  │ 2,000  │     │  3,000  │
│   AR         │ 5,000  │ 4,000  │     │  9,000  │
│   ...        │  ...   │  ...   │     │   ...   │  ← Scrollable
│   (100 more accounts)                           │
└─────────────────────────────────────────────────┘
```

## Sample Data Flow

### Example 1: Simple Asset Consolidation

```
Trial Balance Data:
┌────────┬────────┬────────┬────────┐
│ Entity │ Account│ Debit  │ Credit │
├────────┼────────┼────────┼────────┤
│ Parent │ 1000   │100,000 │      0 │
│ Sub A  │ 1000   │ 50,000 │      0 │
│ Sub B  │ 1000   │ 30,000 │      0 │
└────────┴────────┴────────┴────────┘

No eliminations, no adjustments

Display:
┌────────┬────────┬───────┬───────┬──────┬─────┬─────────┐
│ Cash   │ Parent │ Sub A │ Sub B │ Elim │ Adj │ Consol  │
├────────┼────────┼───────┼───────┼──────┼─────┼─────────┤
│        │100,000 │50,000 │30,000 │   0  │  0  │ 180,000 │
└────────┴────────┴───────┴───────┴──────┴─────┴─────────┘
                                                   ↑
                             Formula: 100k + 50k + 30k = 180k
```

### Example 2: With Intercompany Elimination

```
Trial Balance Data:
┌────────┬────────┬────────┬────────┐
│ Entity │ Account│ Debit  │ Credit │
├────────┼────────┼────────┼────────┤
│ Parent │ 1100   │ 75,000 │      0 │  ← Trade AR
│ Sub A  │ 1100   │ 40,000 │      0 │
│ Sub B  │ 1100   │ 20,000 │      0 │
└────────┴────────┴────────┴────────┘

Elimination Entry:
┌────────┬────────┬────────┐
│ Account│ Debit  │ Credit │
├────────┼────────┼────────┤
│ 2100   │ 15,000 │      0 │  ← IC Payable
│ 1100   │      0 │ 15,000 │  ← IC Receivable
└────────┴────────┴────────┘

Display:
┌────────┬────────┬───────┬───────┬─────────┬─────┬─────────┐
│ Trade  │ Parent │ Sub A │ Sub B │  Elim   │ Adj │ Consol  │
│   AR   │        │       │       │         │     │         │
├────────┼────────┼───────┼───────┼─────────┼─────┼─────────┤
│        │ 75,000 │40,000 │20,000 │(15,000) │  0  │ 120,000 │
└────────┴────────┴───────┴───────┴─────────┴─────┴─────────┘
                                      ↑
                          Click to see IC elimination detail
```

### Example 3: With Fair Value Adjustment

```
Trial Balance Data:
┌────────┬────────┬────────┬────────┐
│ Entity │ Account│ Debit  │ Credit │
├────────┼────────┼────────┼────────┤
│ Parent │ 1500   │200,000 │      0 │  ← Buildings
│ Sub A  │ 1500   │100,000 │      0 │
└────────┴────────┴────────┴────────┘

Adjustment Entry (Fair Value Step-up on Sub A):
┌────────┬────────┬────────┐
│ Account│ Debit  │ Credit │
├────────┼────────┼────────┤
│ 1500   │ 50,000 │      0 │  ← Buildings
│ 3200   │      0 │ 50,000 │  ← Revaluation Reserve
└────────┴────────┴────────┘

Display:
┌──────────┬────────┬────────┬──────┬────────┬─────────┐
│Buildings │ Parent │ Sub A  │ Elim │  Adj   │ Consol  │
├──────────┼────────┼────────┼──────┼────────┼─────────┤
│          │200,000 │100,000 │   0  │ 50,000 │ 350,000 │
└──────────┴────────┴────────┴──────┴────────┴─────────┘
                                        ↑
                          Click to see FV adjustment detail
```

## Responsive Design

### Desktop (> 1200px)
- All columns visible
- Comfortable spacing
- Sticky first/last columns

### Tablet (768px - 1200px)
- Horizontal scroll enabled
- First/last columns sticky
- Touch-friendly targets

### Mobile (< 768px)
- Horizontal scroll required
- Minimal column widths
- Simplified headers
- Touch gestures

## Keyboard Navigation

```
Arrow Keys:      Navigate cells
Enter:           Expand/collapse row
Spacebar:        Select row
Ctrl+F:          Search within page
Tab:             Move between controls
Shift+Tab:       Move backward
Esc:             Close modals
```

## Print Layout

When printing or exporting to PDF:

```
┌───────────────────────────────────────────┐
│ Company Name                              │
│ Consolidation Workings                    │
│ Period: 2024  Statement: Balance Sheet    │
├───────────────────────────────────────────┤
│                                           │
│ Full table with all columns               │
│ Page breaks at class level               │
│ Footer with page numbers                 │
│                                           │
└───────────────────────────────────────────┘
```

## Excel Export Format

```
Sheet 1: Balance Sheet
┌────────────┬────────┬───────┬───────┬──────┬─────┬─────────┐
│     A      │   B    │   C   │   D   │  E   │  F  │    G    │
├────────────┼────────┼───────┼───────┼──────┼─────┼─────────┤
│ Account    │ Parent │ Sub A │ Sub B │ Elim │ Adj │ Consol  │
│ Assets     │   -    │   -   │   -   │  -   │  -  │    -    │
│   Cash     │=TB!A1  │=TB!B1 │=TB!C1 │=E!A1 │=A!A1│=SUM(B:F)│
└────────────┴────────┴───────┴───────┴──────┴─────┴─────────┘
                                                        ↑
                                                  Formula preserved
```

---

This new layout transforms the consolidation workings into a **professional-grade consolidation workpaper** that matches industry standards and provides full transparency into the consolidation process!
