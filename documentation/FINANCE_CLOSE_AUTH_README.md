# Finance Close Module - Dual Authentication System

## Overview

The CLOE application now supports two completely isolated modules with separate authentication systems:

1. **CLOE - Reporting** (Original module for financial consolidation)
2. **CLOE - Finance Close** (New module for period-end close management)

## Security Architecture

### Complete Isolation

The two modules are **completely isolated** from each other:

- **Separate Database Tables**
  - Reporting: `public.users` table
  - Finance Close: `public.close_users` table
  - No foreign key relationships between them

- **Separate API Endpoints**
  - Reporting: `/api/auth/login`
  - Finance Close: `/api/auth/login-close`

- **Separate User Sessions**
  - Different localStorage structures
  - Module identifier stored with user data

### Authentication Flow

```
┌─────────────────┐
│   Login Page    │
│                 │
│  1. Select      │
│     Module      │
│  2. Enter       │
│     Credentials │
└────────┬────────┘
         │
         ├──────────────────┬──────────────────┐
         │                  │                  │
    Reporting          Finance Close
         │                  │
         ▼                  ▼
/api/auth/login    /api/auth/login-close
         │                  │
         ▼                  ▼
  public.users       public.close_users
         │                  │
         ▼                  ▼
    Dashboard         Close Dashboard
       (/)               (/close)
```

## Database Setup

### Step 1: Run SQL Script

Execute the SQL script in your Supabase SQL Editor:

```bash
sql/Finance_Close_Auth_Setup.sql
```

This will:
- Create the `close_users` table
- Add necessary indexes
- Enable Row Level Security
- Create RLS policies
- Insert demo user

### Step 2: Verify Setup

Run these verification queries:

```sql
-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'close_users'
);

-- Check demo user
SELECT username, full_name, company_name, is_active
FROM public.close_users
WHERE username = 'close_demo';
```

## Demo Credentials

### CLOE - Reporting
- **Username:** Admin
- **Password:** Test
- **Access:** Financial consolidation and reporting features

### CLOE - Finance Close
- **Username:** close_demo
- **Password:** Demo@2025
- **Access:** Period-end close management features

## User Management

### Adding New Finance Close Users

1. Generate password hash using bcrypt:

```javascript
const bcrypt = require('bcryptjs');
bcrypt.hash('YourPassword', 10).then(hash => console.log(hash));
```

2. Insert user into database:

```sql
INSERT INTO public.close_users (
  username,
  password_hash,
  full_name,
  email,
  company_name,
  is_active
)
VALUES (
  'john_doe',
  '$2b$10$your_bcrypt_hash_here',
  'John Doe',
  'john.doe@company.com',
  'Company Name',
  true
);
```

## Security Features

### Both Modules Include:

1. **Password Hashing**
   - BCrypt with 10 rounds
   - Passwords never stored in plain text

2. **Account Lockout**
   - 5 failed login attempts
   - 30-minute lockout period

3. **Failed Login Tracking**
   - Increments on each failed attempt
   - Resets on successful login

4. **Session Management**
   - User data stored in localStorage
   - Module identifier prevents cross-module access

5. **Row Level Security (RLS)**
   - Only service role can access auth tables
   - Additional protection layer

## API Endpoints

### Reporting Module

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "username": "Admin",
  "password": "Test"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "first_name": "Admin",
    "last_name": "User",
    "email": "admin@example.com",
    "role": "primary_admin",
    "company": {
      "company_name": "Company Name"
    }
  }
}
```

### Finance Close Module

**Endpoint:** `POST /api/auth/login-close`

**Request:**
```json
{
  "username": "close_demo",
  "password": "Demo@2025"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "close_demo",
    "full_name": "Demo User",
    "email": "demo@financeclose.com",
    "company_name": "Acme Corporation",
    "company_id": null
  }
}
```

## LocalStorage Structure

### Reporting Module
```javascript
{
  "currentUser": {
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "primary_admin",
    "userId": "uuid",
    "isPrimary": true,
    "module": "reporting"
  },
  "currentCompany": {
    "name": "Company Name",
    "env": "Production",
    "companyId": "uuid"
  }
}
```

### Finance Close Module
```javascript
{
  "currentUser": {
    "name": "Demo User",
    "email": "demo@financeclose.com",
    "userId": "uuid",
    "username": "close_demo",
    "module": "finance-close"
  },
  "currentCompany": {
    "name": "Acme Corporation",
    "env": "Production",
    "companyId": null
  }
}
```

## Module Routes

### Reporting Module Routes
- `/` - Dashboard
- `/settings` - Consolidation Config
- `/entity-setup` - Entity Management
- `/upload` - Data Upload
- `/chart-of-accounts` - COA Management
- `/trial-balance` - TB Management
- And many more...

### Finance Close Module Routes
- `/close` - Close Dashboard
- `/close/calendar` - Close Calendar
- `/close/tasks` - Task Management
- `/close/allocation` - Task Allocation
- `/close/reconciliation` - Reconciliation Management
- `/close/variance` - Variance Analysis
- `/close/management` - Management Analysis
- `/close/reports` - Reports
- `/close/settings` - Close Settings

## Troubleshooting

### Issue: Can't log in to Finance Close

**Check:**
1. Is the `close_users` table created?
2. Does the demo user exist?
3. Is the password correct? (Demo@2025)
4. Are RLS policies in place?

**Solution:**
```sql
-- Verify table exists
\dt close_users

-- Check demo user
SELECT * FROM close_users WHERE username = 'close_demo';

-- If not found, run Finance_Close_Auth_Setup.sql again
```

### Issue: "Invalid username or password" error

**Check:**
1. Correct module selected in dropdown
2. Username matches exactly (case-sensitive)
3. Password is correct
4. Account not locked (check `locked_until` field)

**Solution:**
```sql
-- Reset failed attempts and unlock
UPDATE close_users
SET failed_login_attempts = 0, locked_until = NULL
WHERE username = 'close_demo';
```

### Issue: Cross-module access

**Symptom:** User can access wrong module after login

**Solution:**
- Clear browser localStorage
- Log out completely
- Log back in with correct module selected

## Development Notes

### Environment Variables Required

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_ENABLE_DEMO=true  # Shows demo credentials
```

### Testing Authentication

```bash
# Test Reporting login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"Admin","password":"Test"}'

# Test Finance Close login
curl -X POST http://localhost:3000/api/auth/login-close \
  -H "Content-Type: application/json" \
  -d '{"username":"close_demo","password":"Demo@2025"}'
```

## Production Deployment

### Before Going Live:

1. **Change Default Passwords**
   - Generate new strong passwords
   - Update password hashes in database

2. **Disable Demo Credentials Display**
   ```bash
   NEXT_PUBLIC_ENABLE_DEMO=false
   ```

3. **Review RLS Policies**
   - Ensure proper access controls
   - Test with non-service roles

4. **Enable Audit Logging**
   - Track all login attempts
   - Monitor failed authentications

5. **Set Up Monitoring**
   - Alert on multiple failed logins
   - Track unusual access patterns

## Support

For issues or questions:
- Check SQL setup script: `sql/Finance_Close_Auth_Setup.sql`
- Review main SQL file: `sql/Current_SQL_SUPABASE.sql`
- Check API routes: `app/api/auth/login-close/route.js`
- Review login page: `app/login/page.js`

## License

© 2025 CLOE. All rights reserved.
