# JWT Token Management - Best Practices

## Your Question
> "But when this is being used by customers, how would this work? Do I have to keep updating the JWT token?"

## Short Answer
**NO**, you don't need to keep updating JWT tokens. The issue you experienced is a **one-time migration scenario** when you changed the JWT payload structure. In normal production operation, this never happens.

---

## How JWT Works in Your App

### Current Configuration
```javascript
// lib/auth.js - Line 32
.setExpirationTime('7d')  // JWT expires after 7 days
```

### Normal User Flow (Production)
1. User logs in → Gets JWT valid for **7 days**
2. JWT stored in HttpOnly cookie (secure, not accessible via JavaScript)
3. Every API request includes the JWT automatically
4. After 7 days → JWT expires → User must login again → Gets new JWT
5. **Cycle repeats** - no manual intervention needed

### What Happens When User Closes Browser?
- **Session persists** (JWT stored in cookie, not sessionStorage)
- User can return hours/days later
- As long as < 7 days, they stay logged in
- After 7 days of inactivity → Must login again

---

## JWT Payload Changes (Your Situation)

### What Happened to You
You made a code change that added `email` to the JWT payload:

```javascript
// BEFORE (your old code):
const token = await new SignJWT({
  userId,
  companyId,
  role,
  environment
})

// AFTER (your new code):
const token = await new SignJWT({
  userId,
  companyId,
  role,
  email,        // ← ADDED THIS
  environment
})
```

### The Problem
- **Active users** still have JWTs created with old code (no email field)
- **New code** expects email to exist in payload
- **Result:** API breaks for users with old JWTs

### Why This Rarely Happens
This only occurs when you:
1. Change the JWT payload structure in code
2. Deploy the new code while users have active sessions
3. The new code isn't backward compatible

In production, you should **rarely** change JWT payload structure. Most apps finalize JWT structure early and keep it stable.

---

## Solution: Backward Compatibility (Already Implemented)

### What We Did
Made your code handle **both old and new JWT formats**:

```javascript
// app/api/consolidation/save/route.js - Lines 39-51

// If email is missing from old JWT, fetch it from database
let userEmail = payload.email;
if (!userEmail) {
  console.log('⚠️ Email missing from JWT payload, fetching from database...');
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('email')
    .eq('id', payload.userId)
    .single();

  userEmail = user?.email || 'Unknown';
  console.log('✅ Fetched email from database:', userEmail);
}
```

### How This Works
- **New JWT** (has email): Uses `payload.email` directly (fast, no DB query)
- **Old JWT** (no email): Fetches email from database (one extra query)
- **After 7 days**: All old JWTs expire, everyone has new format
- **Performance impact**: Minimal (only affects transition period)

### Benefits
✅ Zero downtime deployment
✅ No forced logouts for active users
✅ Seamless transition
✅ Production-safe

---

## When Do You Need to Update JWT Structure?

### Common Scenarios (Rare)

1. **Adding new user permissions/roles**
   ```javascript
   // Adding permissions array to JWT
   { userId, companyId, role, permissions: [...] }
   ```

2. **Multi-tenancy changes**
   ```javascript
   // Adding workspace/tenant ID
   { userId, companyId, workspaceId, role }
   ```

3. **Feature flags per user**
   ```javascript
   // Adding feature flags
   { userId, companyId, role, features: {...} }
   ```

### How Often?
- **Typical SaaS app**: 0-2 times per year
- **Early stage startup**: Maybe 3-5 times in first year as you iterate
- **Mature product**: Almost never

---

## Best Practices for JWT Changes

### 1. **Plan Ahead** (Minimize Changes)
Include fields you might need in the future:

```javascript
const token = await new SignJWT({
  userId,
  companyId,
  role,
  email,
  permissions: [],        // Empty array, can populate later
  metadata: {},          // Flexible object for future use
  environment
})
```

### 2. **Make Changes Backward Compatible**
Always write fallback code:

```javascript
// ✅ GOOD - Handles old JWTs gracefully
const userRole = payload.role || 'user';
const permissions = payload.permissions || getDefaultPermissions();

// ❌ BAD - Breaks old JWTs
const permissions = payload.permissions.map(...);  // Crashes if undefined
```

### 3. **Versioning (Advanced)**
For major changes, add version field:

```javascript
const token = await new SignJWT({
  version: 2,  // Increment when making breaking changes
  userId,
  companyId,
  // ... rest of payload
})

// In consuming code:
if (payload.version === 1) {
  // Handle old format
} else if (payload.version === 2) {
  // Handle new format
}
```

### 4. **Database Fallback Pattern** (What We Used)
When adding required fields, fetch from database if missing:

```javascript
let fieldValue = payload.fieldName;
if (!fieldValue) {
  // Fetch from database for old JWTs
  const { data } = await db.select('fieldName').eq('id', payload.userId);
  fieldValue = data?.fieldName || defaultValue;
}
```

---

## Your App's JWT Lifecycle

### Timeline for Active User
```
Day 0: User logs in
       ↓
       Gets JWT (expires Day 7)
       ↓
Day 1-6: Makes API requests
       ↓
       JWT automatically included
       ↓
Day 7: JWT expires
       ↓
       Next request fails (401 Unauthorized)
       ↓
       Frontend redirects to login
       ↓
       User logs in again → New JWT (expires Day 14)
```

### Database Session Tracking
Your app also stores sessions in `user_sessions` table:

```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY,
  user_id UUID,
  session_token TEXT,
  expires_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  is_active BOOLEAN
)
```

This allows you to:
- Revoke sessions from admin panel
- Track user activity
- Force logout specific users
- See all active sessions per user

---

## Answers to Common Questions

### Q: Do customers need to manually update their JWT?
**A:** No, it happens automatically when they login. JWTs are created server-side during authentication.

### Q: What happens if I change JWT structure in production?
**A:** Use the backward compatibility pattern (already implemented). Users with old JWTs continue working, new logins get new format.

### Q: Can I force all users to re-login?
**A:** Yes, by invalidating all sessions:

```sql
-- Mark all sessions as inactive (forces re-login)
UPDATE user_sessions SET is_active = false;
```

### Q: How do I add a new field to JWT safely?
**A:** Follow this process:

1. Update `createSessionToken()` to include new field
2. Make consuming code backward compatible (check if field exists)
3. Deploy to production
4. Wait 7 days for all old JWTs to expire
5. Optional: Remove backward compatibility code

### Q: Should I store sensitive data in JWT?
**A:** No! JWTs are **base64 encoded**, not encrypted. Only store:
- ✅ User ID, company ID, role
- ✅ Non-sensitive identifiers
- ✅ Public metadata
- ❌ Passwords, API keys, credit cards
- ❌ Personal sensitive data (SSN, etc.)

---

## Monitoring JWT Issues

### Server Logs to Watch For
```javascript
// Your code already logs this:
console.log('🔐 Session payload:', {
  userId: payload.userId,
  companyId: payload.companyId,
  email: payload.email
});

// And this for old JWTs:
console.log('⚠️ Email missing from JWT payload, fetching from database...');
```

### What to Monitor
1. **Frequency of old JWT fallback** - Should decrease to 0 after 7 days
2. **Failed authentications** - Spike might indicate JWT issues
3. **Database queries for email** - Performance impact of fallback

---

## Summary

### Your Specific Case
- ✅ **Fixed**: Added backward compatibility for email field
- ✅ **Safe**: No users will experience downtime
- ✅ **Automatic**: Old JWTs will naturally expire in 7 days
- ✅ **No action needed**: Customers don't need to do anything

### General Answer
**You don't need to keep updating JWT tokens.** Changes to JWT structure are:
- Rare (maybe 1-2 times per year, if at all)
- Handled with backward compatibility
- Automatically resolved when JWTs expire (7 days)
- Never require customer action

Your app is production-ready! 🚀
