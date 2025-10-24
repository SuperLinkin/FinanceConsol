# GL Pairs - Quick Start Guide

## ⚡ Quick Setup (5 minutes)

### 1. Run SQL (1 minute)
```
Open Supabase SQL Editor
→ Paste content from: sql/CREATE_ELIMINATION_GL_PAIRS_MULTITENANT.sql
→ Click "Run"
→ Wait for success message
```

### 2. Verify (30 seconds)
```sql
SELECT COUNT(*) FROM elimination_gl_pairs;
SELECT COUNT(*) FROM elimination_journal_entries;
SELECT COUNT(*) FROM elimination_journal_entry_lines;
```
Should return 0 for all (empty tables ready for use)

### 3. Test (3 minutes)
```
1. Go to: http://localhost:3005/eliminations
2. Click "GL Pairs" tab
3. Click "Create GL Pair"
4. Fill form and save
5. Click "Create Elimination Entry" on the pair
6. Review and post
7. Switch to "Elimination Entries" tab to see result
```

## 🎯 Key Features

### Multi-Tenant Isolation ✅
- Every company sees only their own data
- Enforced at database level (RLS)
- Double-checked in API layer

### GL Pairs
- Configure pairs of GLs across entities
- Auto-calculate balances from trial balance
- Auto-generate JE with proper Dr/Cr
- Handle differences automatically

### Journal Entries
- Multiple lines support
- Real-time balance validation
- Smart Dr/Cr entry (one clears the other)
- Entity-based GL filtering

## 📁 Files Created

```
sql/
  ├── CREATE_ELIMINATION_GL_PAIRS_MULTITENANT.sql  ← Run this!
  └── CREATE_ELIMINATION_GL_PAIRS_FIXED.sql        (old version)

docs/
  └── ELIMINATION_GL_PAIRS_FEATURE.md              (detailed guide)

/
  ├── ELIMINATION_GL_PAIRS_MULTITENANT_SETUP.md   (production guide)
  ├── ELIMINATION_GL_PAIRS_SETUP.md                (old guide)
  └── QUICK_START_GL_PAIRS.md                      (this file)

app/api/
  ├── elimination-pairs/route.js                   (updated ✅)
  └── elimination-entries/route.js                 (updated ✅)

app/
  └── eliminations/page.js                         (updated ✅)
```

## 🔒 Security

### Database Level
- RLS enabled on all tables
- Company-level policies
- CASCADE delete protection

### API Level
- Token authentication
- Company ownership verification
- Entity belongs to company check

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Tables not found | Run the SQL script |
| No data showing | Check user has correct company_id |
| 403 Unauthorized | Trying to access another company's data |
| Empty GL dropdown | Select entity first, then GL filters |
| Can't post JE | Ensure debits = credits (balanced) |

## 📞 Support

Read full documentation:
- Multi-tenant setup: `ELIMINATION_GL_PAIRS_MULTITENANT_SETUP.md`
- Feature guide: `docs/ELIMINATION_GL_PAIRS_FEATURE.md`

## ✅ Production Checklist

Before going live:
- [ ] SQL script executed successfully
- [ ] All 3 tables created
- [ ] RLS enabled (check with verification query)
- [ ] Tested GL Pair creation
- [ ] Tested JE generation
- [ ] Tested multi-tenant isolation
- [ ] API endpoints working
- [ ] Frontend loading correctly

## 🚀 That's It!

You're ready to use GL Pairs with full multi-tenant isolation!

**Next Steps:**
1. Run the SQL
2. Create your first GL pair
3. Generate an elimination entry
4. Start consolidating!
