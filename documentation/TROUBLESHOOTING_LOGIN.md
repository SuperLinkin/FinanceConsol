# Login Troubleshooting Guide

## Demo Credentials
- **Username**: `demo`
- **Password**: `Demo123!`

## Steps to Fix Login Issues

### Step 1: Verify Database Setup

1. Go to Supabase SQL Editor
2. Run the verification queries from `sql/VERIFY_SETUP.sql`
3. Check that all queries return expected results

### Step 2: Re-run Database Setup (if needed)

If verification fails:

1. Open `sql/COMPLETE_DATABASE_SETUP.sql` in Supabase SQL Editor
2. Run the entire script
3. Wait for it to complete (should see "Success" message)
4. Run verification queries again

### Step 3: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to login
4. Look for error messages

Common errors:
- **"JWT_SECRET not set"** → Check `.env.local` file
- **"Invalid username or password"** → Database not set up correctly
- **"Network error"** → Check if dev server is running

### Step 4: Verify Dev Server is Running

```bash
npm run dev
```

Should see: `Ready on http://localhost:3000`

### Step 5: Check Server Logs

When you try to login, you should see console output like:
```
Login attempt for username: demo
User lookup for username: demo
User found: YES
Verifying password...
Password valid: true
Authentication result: { success: true }
```

If you see `User found: NO`, the database isn't set up correctly.

### Step 6: Manual Password Hash Verification

Run this in your terminal:
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.compare('Demo123!', '$2b\$10\$NQ0.SEIn1UVSv2siR5fTI.e69ZL1Zpl2B2L80wSST5rDb3O6BfBp.', (err, result) => console.log('Password matches:', result));"
```

Should print: `Password matches: true`

### Step 7: Quick Database Check via Supabase

1. Go to Supabase Dashboard
2. Click "Table Editor"
3. Check if these tables exist:
   - companies
   - users
   - entities
   - currencies

4. Click on "users" table
5. You should see 1 row with username "demo"

### Step 8: Reset Everything

If nothing works:

1. Run `sql/COMPLETE_DATABASE_SETUP.sql` again
2. Restart your dev server: `npm run dev`
3. Clear browser cache and cookies
4. Try login again

## Still Not Working?

Check these files for errors:
- `lib/auth.js` - Authentication logic
- `app/api/auth/login/route.js` - Login API
- `.env.local` - Environment variables

## Common Issues

### Issue 1: "Invalid username or password"
**Cause**: User doesn't exist in database
**Fix**: Run `sql/COMPLETE_DATABASE_SETUP.sql`

### Issue 2: "JWT_SECRET not set"
**Cause**: Missing environment variable
**Fix**: Check `.env.local` has `JWT_SECRET=...`

### Issue 3: Page doesn't redirect after login
**Cause**: Frontend localStorage issue
**Fix**: Clear browser localStorage and try again

### Issue 4: "Cannot read properties of null"
**Cause**: Database query failed
**Fix**: Check Supabase connection and table structure

## Test Login via API Directly

Use this curl command:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"Demo123!"}'
```

Should return:
```json
{
  "success": true,
  "user": {
    "id": "...",
    "username": "demo",
    "email": "demo@democo.com",
    ...
  }
}
```

If this works but browser doesn't, it's a frontend issue.
If this fails, it's a backend/database issue.
