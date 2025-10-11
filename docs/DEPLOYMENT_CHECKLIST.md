# 🚀 Production Deployment Checklist

## Pre-Deployment Tasks

### 🔴 CRITICAL - Must Complete Before Deployment

- [ ] **Rotate ALL exposed credentials immediately**
  - [ ] Generate new Supabase project (or rotate keys)
  - [ ] Generate new OpenAI API key
  - [ ] Generate strong JWT secret: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
  - [ ] Update `.env.local` with new credentials
  - [ ] Verify `.env.local` is in `.gitignore`

- [ ] **Remove `.env.local` from git history if committed**
  ```bash
  git filter-branch --force --index-filter \
    "git rm --cached --ignore-unmatch .env.local" \
    --prune-empty --tag-name-filter cat -- --all
  git push origin --force --all
  ```

- [ ] **Set production environment variables**
  - [ ] Copy `.env.example` to create production `.env`
  - [ ] Fill in all required variables
  - [ ] Set `NODE_ENV=production`
  - [ ] Set `NEXT_PUBLIC_ENABLE_DEMO=false`
  - [ ] Set `ENABLE_TEST_ENDPOINTS=false`
  - [ ] Set `ENABLE_CONSOLE_LOGS=false`

### 🟠 HIGH PRIORITY - Database & Security

- [ ] **Run database migration**
  - [ ] Backup current database
  - [ ] Run `sql/PRODUCTION_DEPLOYMENT_MIGRATION.sql` on Supabase
  - [ ] Verify all indexes created: Check Supabase Dashboard > Database > Indexes
  - [ ] Verify RLS enabled: Check Supabase Dashboard > Authentication > Policies

- [ ] **Configure Row Level Security (RLS) Policies**
  - [ ] Review default policies in migration file
  - [ ] Customize policies based on your security requirements
  - [ ] Test policies with different user roles
  - [ ] Enable RLS on all tables in Supabase Dashboard

- [ ] **Add authentication to API routes**
  - [ ] Update `/app/api/openai/route.js` with auth check
  - [ ] Update `/app/api/chat/route.js` with auth check
  - [ ] Update `/app/api/consolidation/*/route.js` with auth check
  - [ ] Update `/app/api/exchange-rates/route.js` with auth check
  - [ ] Remove or protect test endpoint `/app/api/consolidation/test/route.js`

- [ ] **Implement rate limiting**
  - [ ] Install: `npm install express-rate-limit`
  - [ ] Add rate limiting to AI endpoints (max 100 req/hour/user)
  - [ ] Add rate limiting to API endpoints (max 60 req/min/IP)
  - [ ] Add cost monitoring for OpenAI API calls

### 🟡 MEDIUM PRIORITY - Code Quality & Configuration

- [ ] **Clean up console statements**
  - [ ] Remove console.log from `lib/auth.js`
  - [ ] Remove console.log from all page files
  - [ ] Remove console.log from components
  - [ ] Replace with proper logging library (Winston/Pino) if needed

- [ ] **Input validation**
  - [ ] Install Zod: `npm install zod`
  - [ ] Add validation to all API POST/PUT endpoints
  - [ ] Validate file uploads (type, size, content)
  - [ ] Sanitize user inputs before database queries

- [ ] **Error handling improvements**
  - [ ] Update API routes to return generic errors to clients
  - [ ] Log detailed errors server-side only
  - [ ] Add error boundaries to main pages
  - [ ] Create custom error pages (404, 500)

- [ ] **Complete TODO items**
  - [ ] Implement proper permission checking in `contexts/AuthContext.js:66`
  - [ ] Review and complete any other TODO comments

### ⚪ OPTIONAL - Nice to Have

- [ ] **Monitoring & Logging**
  - [ ] Set up Sentry or similar for error tracking
  - [ ] Configure application logging
  - [ ] Set up uptime monitoring
  - [ ] Configure alerts for critical errors

- [ ] **Performance optimizations**
  - [ ] Add database connection pooling config
  - [ ] Implement caching for static data (COA, entities)
  - [ ] Add pagination to large data fetches
  - [ ] Optimize images and static assets

- [ ] **Documentation**
  - [ ] Document all API endpoints (OpenAPI/Swagger)
  - [ ] Create user guide
  - [ ] Document deployment process
  - [ ] Create backup and recovery procedures

## Deployment Steps

### 1. Pre-deployment Verification

```bash
# Install dependencies
npm install

# Run linter
npm run lint

# Build the application
npm run build

# Test the build locally
npm start
```

### 2. Database Setup

1. Log into Supabase Dashboard
2. Navigate to SQL Editor
3. Run `sql/PRODUCTION_DEPLOYMENT_MIGRATION.sql`
4. Verify success in Database > Tables view
5. Check Indexes tab to confirm all indexes created
6. Enable RLS on all tables in Authentication > Policies

### 3. Environment Setup on Hosting Platform

**For Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add JWT_SECRET
vercel env add OPENAI_API_KEY
vercel env add NODE_ENV
# ... add all variables from .env.example
```

**For Other Platforms:**
- Set all environment variables from `.env.example`
- Ensure build command is `npm run build`
- Ensure start command is `npm start`
- Set Node version to 18.x or higher

### 4. Deploy

```bash
# Deploy to Vercel
vercel --prod

# Or use your platform's deployment command
```

### 5. Post-Deployment Verification

- [ ] **Test authentication flow**
  - [ ] Create new user account
  - [ ] Login with credentials
  - [ ] Verify session persistence
  - [ ] Test logout

- [ ] **Test core features**
  - [ ] Upload trial balance
  - [ ] Create entities
  - [ ] View consolidation workings
  - [ ] Generate reports
  - [ ] Test AI features (limited)

- [ ] **Security checks**
  - [ ] Verify HTTPS is enforced
  - [ ] Check security headers: https://securityheaders.com
  - [ ] Verify cookies are secure
  - [ ] Test unauthenticated access to protected routes
  - [ ] Verify RLS policies prevent cross-tenant data access

- [ ] **Performance checks**
  - [ ] Test page load times
  - [ ] Check Lighthouse scores
  - [ ] Monitor initial API response times
  - [ ] Verify image optimization

- [ ] **Error monitoring**
  - [ ] Trigger a test error
  - [ ] Verify error is logged/reported
  - [ ] Check error doesn't expose sensitive info

## Post-Deployment Monitoring

### First 24 Hours
- [ ] Monitor error logs every 2 hours
- [ ] Check database query performance
- [ ] Monitor API costs (OpenAI)
- [ ] Watch for authentication issues
- [ ] Monitor server resource usage

### First Week
- [ ] Daily error log review
- [ ] Check user feedback
- [ ] Monitor API rate limits
- [ ] Review security logs
- [ ] Check backup completion

### Ongoing
- [ ] Weekly database backups
- [ ] Monthly security updates
- [ ] Quarterly dependency updates
- [ ] Review and rotate API keys every 90 days

## Rollback Plan

If critical issues are discovered:

1. **Immediate Actions**
   ```bash
   # Revert to previous deployment
   vercel rollback
   ```

2. **Database Rollback** (if needed)
   - Restore from backup
   - Document issues encountered
   - Test in staging before re-deploying

3. **Communication**
   - Notify users of downtime
   - Provide estimated time to resolution
   - Document root cause

## Security Incident Response

If credentials are exposed:

1. **Immediate** (within 1 hour)
   - Rotate all API keys
   - Invalidate all user sessions
   - Enable IP blocking if needed

2. **Short-term** (within 24 hours)
   - Review access logs
   - Identify affected users
   - Force password reset if needed

3. **Long-term** (within 1 week)
   - Implement additional security measures
   - Document incident
   - Update security procedures

## Support Contacts

- **Supabase Support**: support@supabase.io
- **OpenAI Support**: help.openai.com
- **Deployment Platform**: [Your platform's support]
- **DNS Provider**: [Your DNS provider support]

## Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Vercel Security](https://vercel.com/docs/security)
- [OWASP Security Guidelines](https://owasp.org/www-project-web-security-testing-guide/)

---

**Last Updated**: [Add date when you review this]
**Reviewed By**: [Add your name]
**Next Review Date**: [Schedule quarterly reviews]
