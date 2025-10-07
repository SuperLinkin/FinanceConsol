# Entity Type Update - January 2025

## ✅ Changes Made

### Entity Type Options Updated

**Previous Options:**
- Subsidiary
- Joint Venture
- Associate
- Branch

**New Options:**
- **Parent** ⭐ NEW
- **Parent + Subsidiary** ⭐ NEW
- Subsidiary
- Joint Venture
- Associate
- Branch

---

## 📋 Entity Type Definitions

### 1. Parent
- **Description:** Ultimate parent entity with no parent company
- **Use Case:** Top-level holding company
- **Parent Entity:** None (leave blank)
- **Ownership %:** 0% (not owned by anyone)
- **Example:** "Parent Company Ltd" - the ultimate parent of the group

### 2. Parent + Subsidiary
- **Description:** Mid-tier holding company that has both a parent AND owns subsidiaries
- **Use Case:** Intermediate holding companies in multi-tier structures
- **Parent Entity:** Must select parent entity
- **Ownership %:** % owned by parent (e.g., 80%)
- **Example:** "European Holdings Ltd" - owned by Parent Company, owns its own subsidiaries

### 3. Subsidiary
- **Description:** Entity owned by a parent
- **Use Case:** Standard subsidiary
- **Parent Entity:** Must select parent entity
- **Ownership %:** % owned by parent (typically 51-100%)
- **Example:** "US Operations Inc" - owned by parent

### 4. Joint Venture
- **Description:** Entity jointly controlled with other parties
- **Use Case:** Shared control arrangements
- **Parent Entity:** Can select parent
- **Ownership %:** Typically 50% or less
- **Example:** "Tech JV Ltd" - 50/50 with partner

### 5. Associate
- **Description:** Entity with significant influence but not control
- **Use Case:** Equity method investments
- **Parent Entity:** Can select parent
- **Ownership %:** Typically 20-50%
- **Example:** "Associated Trading Co" - 30% ownership

### 6. Branch
- **Description:** Non-incorporated extension of parent entity
- **Use Case:** Branches, divisions, or offices
- **Parent Entity:** Must select parent entity
- **Ownership %:** 100% (integral part of parent)
- **Example:** "Singapore Branch" - extension of parent

---

## 📊 Excel Template Updated

The Excel template now includes **3 example rows** showing:

1. **Row 1:** Parent entity (PARENT01)
   - Entity Type: Parent
   - No parent entity code
   - 0% ownership

2. **Row 2:** Standard subsidiary (SUB001)
   - Entity Type: Subsidiary
   - Parent: PARENT01
   - 100% ownership

3. **Row 3:** Mid-tier holding company (MID001)
   - Entity Type: Parent + Subsidiary
   - Parent: PARENT01
   - 80% ownership
   - Has its own subsidiaries below it

---

## 🏢 Use Cases

### Simple Two-Tier Structure:
```
Parent Company Ltd (Parent)
└── Subsidiary Inc (Subsidiary) - 100%
```

### Complex Multi-Tier Structure:
```
Global Holdings Corp (Parent)
├── US Holdings LLC (Parent + Subsidiary) - 100%
│   ├── US Operations Inc (Subsidiary) - 100%
│   └── Tech Services LLC (Subsidiary) - 80%
├── European Holdings Ltd (Parent + Subsidiary) - 90%
│   ├── UK Trading Co (Subsidiary) - 100%
│   └── French Branch (Branch) - 100%
└── Asia Pacific JV (Joint Venture) - 50%
```

---

## 🎯 Benefits

1. **Clearer Hierarchy:** Easier to identify parent entities vs subsidiaries
2. **Mid-Tier Visibility:** "Parent + Subsidiary" makes intermediate holdings clear
3. **Better Organization:** Structure reflects real-world group arrangements
4. **Template Examples:** Users see how to structure their group

---

## ✅ Testing Status

- ✅ Form dropdown updated
- ✅ Excel template updated with 3 examples
- ✅ Build compiles successfully
- ✅ No errors introduced
- ✅ Bulk upload still works with new types

---

## 📱 Where to See Changes

**Location:** Entity Setup page
**Path:** `/entity-setup`

**Actions:**
1. Click "Add Entity" button
2. See new "Entity Type" dropdown with 6 options
3. Download Excel template - see 3 example rows with different types

---

**Updated By:** Claude Code
**Date:** January 2025
**Status:** ✅ COMPLETE
