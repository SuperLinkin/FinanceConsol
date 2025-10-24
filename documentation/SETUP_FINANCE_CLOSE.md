# Finance Close Module - Quick Setup Guide

## 🎯 What You Need

A separate authentication system for the Finance Close module that is **completely isolated** from the Reporting module.

## 📝 Setup Steps

### Step 1: Run the SQL Script

Open **Supabase SQL Editor** and execute:

**File:** `sql/Finance_Close_Auth_Setup.sql`

Copy the entire file contents and click **Run**.

### Step 2: Verify Setup

Run this query to confirm:

```sql
SELECT username, full_name, company_name, is_active
FROM public.close_users
WHERE username = 'close_demo';
```

**Expected Result:**
| username | full_name | company_name | is_active |
|----------|-----------|--------------|-----------|
| close_demo | Demo User | Acme Corporation | true |

### Step 3: Test Login

1. Go to: `http://localhost:3000/login`
2. Select: **CLOE - Finance Close**
3. Enter:
   - Username: `close_demo`
   - Password: `Demo@2025`
4. Click **Sign In**
5. Should redirect to: `/close` (Finance Close Dashboard)

## ✅ That's It!

Your Finance Close authentication is now set up and completely isolated from the Reporting module.

---

## 🔐 Security Features

- ✅ **Separate Database Table** - No links to Reporting tables
- ✅ **Separate API Endpoint** - `/api/auth/login-close`
- ✅ **BCrypt Password Hashing** - 10 rounds
- ✅ **Account Lockout** - 5 failed attempts = 30 min lock
- ✅ **Row Level Security** - RLS policies enabled

---

## 📚 Demo Credentials

### CLOE - Reporting
- **Username:** Admin
- **Password:** Test
- **Access:** Financial consolidation

### CLOE - Finance Close
- **Username:** close_demo
- **Password:** Demo@2025
- **Access:** Period-end close management

---

## 🆘 Troubleshooting

### Can't log in?

**Check 1:** Is the table created?
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'close_users'
);
```

**Check 2:** Does demo user exist?
```sql
SELECT * FROM close_users WHERE username = 'close_demo';
```

**Check 3:** Is account locked?
```sql
UPDATE close_users
SET failed_login_attempts = 0, locked_until = NULL
WHERE username = 'close_demo';
```

---

## 📖 Full Documentation

For complete details, see:
- **`FINANCE_CLOSE_AUTH_README.md`** - Technical documentation
- **`DUAL_AUTH_SUMMARY.md`** - Quick reference
- **`sql/Finance_Close_Auth_Setup.sql`** - Setup script with comments

---

## 🔧 Adding More Users

1. Generate password hash:
```javascript
const bcrypt = require('bcryptjs');
bcrypt.hash('YourPassword', 10).then(hash => console.log(hash));
```

2. Insert user:
```sql
INSERT INTO public.close_users (
  username, password_hash, full_name,
  email, company_name, is_active
)
VALUES (
  'john_doe',
  'your_bcrypt_hash_here',
  'John Doe',
  'john@company.com',
  'Company Name',
  true
);
```

---

**Need Help?** Check the documentation files or review the setup script for detailed comments.
