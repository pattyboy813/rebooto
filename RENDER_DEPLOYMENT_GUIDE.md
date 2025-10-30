# Deploying Rebooto on Render

Complete step-by-step guide to deploy the Rebooto gamified IT support learning platform on Render.com with PostgreSQL database and email integration.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Architecture Overview](#architecture-overview)
- [Step 1: Prepare Your Repository](#step-1-prepare-your-repository)
- [Step 2: Create PostgreSQL Database](#step-2-create-postgresql-database)
- [Step 3: Deploy Web Service](#step-3-deploy-web-service)
- [Step 4: Configure Environment Variables](#step-4-configure-environment-variables)
- [Step 5: Run Database Migrations](#step-5-run-database-migrations)
- [Step 6: Verify Deployment](#step-6-verify-deployment)
- [Email Integration Options](#email-integration-options)
- [Troubleshooting](#troubleshooting)
- [Cost & Limitations](#cost--limitations)

---

## Prerequisites

✅ **Required:**
- GitHub, GitLab, or Bitbucket account with Rebooto repository
- Render account (sign up free at [render.com](https://render.com))
- Git installed locally

✅ **Optional (for email):**
- Microsoft 365 tenant with admin access
- Azure AD app registration (for self-hosted email)

---

## Architecture Overview

Rebooto on Render consists of:

```
┌─────────────────────────────────────┐
│  Render Web Service                 │
│  • Node.js/Express backend          │
│  • Vite frontend (built to static)  │
│  • Port: 10000 (auto-assigned)      │
└──────────────┬──────────────────────┘
               │
               │ DATABASE_URL (Internal)
               ▼
┌─────────────────────────────────────┐
│  Render PostgreSQL Database         │
│  • Neon-backed managed database     │
│  • Free tier: 90 days, 1GB storage  │
└─────────────────────────────────────┘
```

---

## Step 1: Prepare Your Repository

### 1.1 Verify package.json Scripts

Ensure your `package.json` includes:

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "tsc && vite build",
    "start": "NODE_ENV=production tsx server/index.ts",
    "db:push": "drizzle-kit push"
  },
  "engines": {
    "node": ">=20.x"
  }
}
```

### 1.2 Create render.yaml (Optional but Recommended)

Create `render.yaml` in your repository root for infrastructure-as-code:

```yaml
databases:
  - name: rebooto-db
    databaseName: rebooto
    user: rebooto_user
    region: oregon
    plan: free

services:
  - type: web
    name: rebooto
    runtime: node
    region: oregon
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: rebooto-db
          property: connectionString
      - key: SESSION_SECRET
        generateValue: true
      - key: PORT
        value: 10000
    autoDeploy: true
```

### 1.3 Commit and Push

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

---

## Step 2: Create PostgreSQL Database

### Option A: Using Render Dashboard (Recommended)

1. **Log in to Render** → Go to [dashboard.render.com](https://dashboard.render.com)

2. **Create Database**:
   - Click **"New +"** → Select **"PostgreSQL"**
   
3. **Configure Database**:
   - **Name**: `rebooto-db` (or your preferred name)
   - **Database**: `rebooto` (auto-filled)
   - **User**: `rebooto_user` (auto-filled)
   - **Region**: Select **Oregon (US West)** or closest to you
   - **PostgreSQL Version**: **16** (recommended)
   - **Datadog API Key**: Leave blank
   
4. **Select Plan**:
   - Choose **"Free"** tier
   - ⚠️ **Note**: Free tier expires after 90 days, includes 1GB storage
   
5. **Create Database**:
   - Click **"Create Database"**
   - Wait 2-3 minutes for provisioning

6. **Copy Connection String**:
   - Once created, scroll to **"Connections"** section
   - **IMPORTANT**: Copy the **"Internal Database URL"**
   - Format: `postgresql://user:password@dpg-xxx.oregon-postgres.render.com/rebooto`
   - Save this - you'll need it in Step 4

### Option B: Using render.yaml (Automatic)

If you created `render.yaml` in Step 1, skip manual database creation. Render will automatically provision it when you deploy.

---

## Step 3: Deploy Web Service

### 3.1 Connect Repository

1. In Render dashboard, click **"New +"** → Select **"Web Service"**

2. **Connect Git Provider**:
   - Click **"Connect a repository"**
   - Authorize Render to access your GitHub/GitLab/Bitbucket
   - Select your Rebooto repository

### 3.2 Configure Web Service

Fill in the deployment configuration:

**Basic Settings:**
- **Name**: `rebooto` (becomes `rebooto.onrender.com`)
- **Region**: **Oregon (US West)** - ⚠️ **MUST MATCH** database region
- **Branch**: `main` (or your default branch)
- **Root Directory**: `.` (leave blank if Rebooto is at repo root)
- **Runtime**: **Node**

**Build & Deploy:**
- **Build Command**: 
  ```bash
  npm install && npm run build
  ```
- **Start Command**:
  ```bash
  npm start
  ```

**Instance Type:**
- Select **"Free"** tier
- ⚠️ **Note**: Free tier spins down after 15 min inactivity (cold start ~30-60s)

### 3.3 Don't Deploy Yet!

Click **"Advanced"** to configure environment variables first (next step).

---

## Step 4: Configure Environment Variables

### 4.1 Required Variables (All Deployments)

In the **"Advanced"** section → **"Environment Variables"**, add:

```bash
# Node environment
NODE_ENV=production

# Database connection
DATABASE_URL=<paste Internal Database URL from Step 2>

# Session secret (generate a random 64-character string)
SESSION_SECRET=<generate_random_string_here>

# Port (Render auto-assigns 10000)
PORT=10000
```

**Generate SESSION_SECRET**:
```bash
# On your local machine, run:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4.2 Email Integration (Choose One Option)

#### Option A: Replit Connector (Not Applicable on Render)

⚠️ **Replit Outlook connector only works on Replit**. For Render, use Option B.

#### Option B: Azure AD OAuth2 (Recommended for Render)

Follow the [Azure AD Email Setup Guide](./AZURE_AD_EMAIL_SETUP.md) first, then add these variables:

```bash
# Azure AD OAuth2 Configuration
AZURE_TENANT_ID=your-tenant-id-from-azure
AZURE_CLIENT_ID=your-client-id-from-azure
AZURE_CLIENT_SECRET=your-client-secret-from-azure
SHARED_MAILBOX_EMAIL=noreply@yourdomain.com
```

**Quick Setup Summary**:
1. Register app in Azure AD ([Azure Portal](https://portal.azure.com))
2. Grant `Mail.Send` API permission
3. Create client secret
4. Create shared mailbox in Microsoft 365
5. Copy tenant ID, client ID, and secret to Render env vars

**Without Email** (Optional):
If you want to deploy without email initially, you can skip email variables. Password reset will log to console only (dev mode).

### 4.3 Optional Variables

```bash
# OpenAI for AI course generation (if you use this feature)
OPENAI_API_KEY=sk-your-openai-api-key

# Custom domain (if you have one)
# RENDER_EXTERNAL_URL=https://yourdomain.com
```

---

## Step 5: Run Database Migrations

After your service deploys successfully, you need to initialize the database schema.

### 5.1 Access Shell

1. Go to your deployed web service in Render dashboard
2. Click **"Shell"** tab (top navigation)
3. Wait for shell to connect

### 5.2 Run Drizzle Push

In the shell, run:

```bash
# Push database schema
npm run db:push

# If that fails with a conflict, force push:
npm run db:push -- --force
```

This creates all tables: `users`, `courses`, `lessons`, `achievements`, `enrollments`, `userProgress`, `userAchievements`, `emailSignups`, `passwordResetTokens`, `blogPosts`.

### 5.3 Create Admin User (Optional)

To create an admin account:

```bash
# Connect to PostgreSQL (use External Database URL from Render dashboard)
psql <EXTERNAL_DATABASE_URL>

# Insert admin user (update email/password as needed)
INSERT INTO users (email, "firstName", "lastName", "authProvider", "hashedPassword", "isAdmin", "isActive")
VALUES (
  'admin@yourdomain.com',
  'Admin',
  'User',
  'local',
  '$2b$10$your_hashed_password_here',  -- Hash your password first
  true,
  true
);
```

**To hash a password**:
```javascript
// On your local machine:
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourPassword123', 10, (e,h) => console.log(h))"
```

Or manually register on the site and then update the user:
```sql
UPDATE users SET "isAdmin" = true WHERE email = 'your@email.com';
```

---

## Step 6: Verify Deployment

### 6.1 Deploy Service

After configuring environment variables and clicking **"Create Web Service"**, Render will:

1. ✅ Clone your repository
2. ✅ Run `npm install && npm run build`
3. ✅ Start the service with `npm start`
4. ✅ Assign URL: `https://rebooto.onrender.com`

**Monitor deployment** in the **"Logs"** tab.

### 6.2 Check Application

1. **Visit your app**:
   ```
   https://your-service-name.onrender.com
   ```

2. **Test landing page**:
   - Should see Rebooto homepage with gradient design
   - Email signup form should work

3. **Test authentication**:
   - Navigate to `/auth`
   - Try registering a new account
   - Log in with created account

4. **Test admin portal** (if you created admin user):
   - Log in with admin credentials
   - Navigate to `/admin/dashboard`
   - Verify stats are loading

### 6.3 Test Email (If Configured)

1. Go to `/forgot-password`
2. Enter your email
3. Check your inbox for password reset email
4. Verify branded HTML email with gradient button

If email doesn't arrive:
- Check Render logs for error messages
- Verify Azure AD env vars are correct
- Check Microsoft 365 shared mailbox sent items

---

## Email Integration Options

### Replit Connector vs. Azure AD

| Feature | Replit Connector | Azure AD OAuth2 |
|---------|------------------|-----------------|
| **Works on Render?** | ❌ No | ✅ Yes |
| **Setup Complexity** | Easy (OAuth UI) | Moderate (Azure config) |
| **Cost** | Free on Replit | Requires M365 license |
| **Shared Mailbox** | Manual setup | Native support |
| **Auto Token Refresh** | ✅ Yes | ✅ Yes |

### Setting Up Azure AD for Render

See the complete guide: [AZURE_AD_EMAIL_SETUP.md](./AZURE_AD_EMAIL_SETUP.md)

**Quick checklist**:
- [ ] Register app in Azure AD
- [ ] Grant `Mail.Send` API permission
- [ ] Grant admin consent
- [ ] Create client secret
- [ ] Create shared mailbox
- [ ] Add 4 env vars to Render

---

## Troubleshooting

### ❌ Build Fails: "Cannot find module"

**Cause**: Missing dependencies in `package.json`

**Solution**:
```bash
# Locally, verify all dependencies are listed:
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

Render will auto-redeploy.

---

### ❌ Database Connection Error

**Error**: `getaddrinfo ENOTFOUND` or `connection refused`

**Cause**: Wrong `DATABASE_URL` or region mismatch

**Solutions**:
1. **Verify DATABASE_URL**:
   - Go to database → "Connections" → Copy **Internal Database URL**
   - Update in web service → "Environment" → `DATABASE_URL`

2. **Check regions match**:
   - Database region: Oregon
   - Web service region: Oregon
   - If different, recreate one to match

3. **SSL mode**:
   Render PostgreSQL requires SSL. Verify in your code:
   ```javascript
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     ssl: { rejectUnauthorized: false }  // Required for Render
   });
   ```

---

### ❌ Application Won't Start

**Error**: `Application failed to respond`

**Solutions**:

1. **Check PORT binding**:
   ```javascript
   // In server/index.ts, ensure:
   const PORT = process.env.PORT || 5000;
   app.listen(PORT, '0.0.0.0', () => {
     console.log(`Server running on port ${PORT}`);
   });
   ```

2. **Verify start command**:
   - Should be: `npm start`
   - Which runs: `NODE_ENV=production tsx server/index.ts`

3. **Check logs**:
   - Go to web service → "Logs" tab
   - Look for stack traces or error messages

---

### ❌ Password Reset Emails Not Sending

**Error**: Email send fails with 401 or 403

**Solutions**:

1. **Verify Azure AD configuration**:
   ```bash
   # Check logs for:
   "Using Azure AD OAuth2 for email authentication"
   
   # If you see:
   "Using Replit Outlook connector for email authentication"
   # Then Azure env vars are not set correctly
   ```

2. **Check API permissions**:
   - Go to Azure Portal → Your app → API permissions
   - Verify `Mail.Send` has green checkmark
   - Click "Grant admin consent" if not

3. **Verify shared mailbox**:
   ```bash
   # In Render env vars, check:
   SHARED_MAILBOX_EMAIL=noreply@yourdomain.com
   
   # Must match exact mailbox address in Microsoft 365
   ```

4. **Test manually**:
   In Render shell:
   ```bash
   node -e "
   const { sendEmail } = require('./server/outlook');
   sendEmail('test@example.com', 'Test', '<p>Test email</p>')
     .then(r => console.log('Result:', r));
   "
   ```

---

### ❌ 502 Bad Gateway After 30 Seconds

**Cause**: Application takes too long to start (free tier timeout)

**Solutions**:

1. **Reduce cold start time**:
   - Minimize dependencies
   - Lazy-load heavy modules

2. **Keep service warm** (optional paid add-on):
   - Upgrade to paid plan
   - Or use a cron job to ping service every 10 minutes

---

### ❌ Database Tables Don't Exist

**Error**: `relation "users" does not exist`

**Cause**: Forgot to run database migrations

**Solution**:
```bash
# In Render shell:
npm run db:push
```

Or connect via psql and run schema manually:
```bash
# Copy schema from shared/schema.ts and create tables
psql <EXTERNAL_DATABASE_URL> < schema.sql
```

---

## Cost & Limitations

### Free Tier (2025)

**Web Service (Free)**:
- ✅ 750 hours/month (enough for 1 service)
- ✅ 512 MB RAM
- ✅ 0.5 CPU
- ❌ Spins down after 15 min inactivity
- ❌ Cold start: 30-60 seconds
- ✅ 100 GB bandwidth/month
- ✅ Auto-deploy from Git

**PostgreSQL (Free)**:
- ✅ 1 GB storage
- ✅ 90-day lifespan (expires after 3 months)
- ❌ Only 1 free database per account
- ✅ Automatic backups
- ✅ TLS/SSL enabled

### Paid Plans

**Starter Plan ($7/month per service)**:
- ✅ No spin-down (always on)
- ✅ 1 GB RAM
- ✅ 1 CPU
- ✅ Custom domains

**PostgreSQL Standard ($7/month)**:
- ✅ 1 GB storage (expandable)
- ✅ No expiration
- ✅ Point-in-time recovery
- ✅ High availability

### Recommended Setup for Production

**Minimum viable production** ($14/month):
- Starter web service: $7
- Standard PostgreSQL: $7
- Custom domain (bring your own)
- Azure AD email (M365 license separate)

**Scalable production** ($21/month):
- Pro web service: $14 (2 GB RAM, 2 CPU)
- Standard PostgreSQL: $7
- Redis cache: Add-on available

---

## Auto-Deploy from Git

Render automatically redeploys when you push to your connected branch:

```bash
# Make changes locally
git add .
git commit -m "Update course generator prompt"
git push origin main

# Render auto-detects push and redeploys
# Watch progress in Render dashboard → Logs
```

**Disable auto-deploy**:
- Go to web service → Settings
- Toggle "Auto-Deploy" off
- Deploy manually via "Manual Deploy" button

---

## Environment-Specific Configuration

### Production vs. Staging

**Option 1: Separate Services**

Deploy two services from different branches:

```yaml
# render.yaml
services:
  - type: web
    name: rebooto-production
    branch: main
    envVars:
      - key: NODE_ENV
        value: production
        
  - type: web
    name: rebooto-staging
    branch: develop
    envVars:
      - key: NODE_ENV
        value: staging
```

**Option 2: Blueprint YAML**

Use Render's Blueprint spec for complete infrastructure:

```yaml
# render.yaml (full example)
databases:
  - name: rebooto-db-prod
    databaseName: rebooto_prod
    region: oregon
    plan: standard

services:
  - type: web
    name: rebooto-app
    runtime: node
    region: oregon
    plan: starter
    buildCommand: npm ci && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: rebooto-db-prod
          property: connectionString
      - key: SESSION_SECRET
        generateValue: true
      - key: AZURE_TENANT_ID
        sync: false  # Manage manually for security
      - key: AZURE_CLIENT_ID
        sync: false
      - key: AZURE_CLIENT_SECRET
        sync: false
      - key: SHARED_MAILBOX_EMAIL
        value: noreply@yourdomain.com
```

---

## Custom Domain Setup

### 1. Add Domain to Render

1. Go to web service → Settings → Custom Domain
2. Click "Add Custom Domain"
3. Enter: `app.yourdomain.com`

### 2. Configure DNS

Add CNAME record with your DNS provider:

```
Type:  CNAME
Name:  app
Value: rebooto.onrender.com
TTL:   3600
```

### 3. Enable HTTPS

Render auto-provisions SSL certificate (Let's Encrypt):
- Usually completes in 15-30 minutes
- Certificate auto-renews

### 4. Update Environment

Add to environment variables:

```bash
RENDER_EXTERNAL_URL=https://app.yourdomain.com
```

---

## Monitoring & Logging

### Built-in Render Features

**Logs**:
- Real-time logs in dashboard
- Searchable and filterable
- Downloadable for analysis

**Metrics**:
- CPU usage
- Memory usage
- Request count
- Response times

### External Monitoring (Optional)

**Uptime Monitoring**:
- [UptimeRobot](https://uptimerobot.com/) (free)
- [Pingdom](https://www.pingdom.com/)

**Error Tracking**:
- [Sentry](https://sentry.io/) (free tier available)
- [LogRocket](https://logrocket.com/)

**Application Performance**:
- [New Relic](https://newrelic.com/)
- [Datadog](https://www.datadoghq.com/)

---

## Backup & Disaster Recovery

### Database Backups

**Free tier**:
- Automatic daily backups (last 7 days)
- No manual restore

**Paid tier**:
- Point-in-time recovery
- Manual backups on-demand
- Restore to any point in last 7 days

### Manual Backup

```bash
# Export database to local file
pg_dump <EXTERNAL_DATABASE_URL> > backup.sql

# Restore from backup
psql <EXTERNAL_DATABASE_URL> < backup.sql
```

### Code Rollback

**Git-based rollback**:
```bash
# Find commit to rollback to
git log --oneline

# Rollback
git revert <commit-hash>
git push origin main

# Or force push previous commit
git reset --hard <commit-hash>
git push origin main --force
```

Render auto-deploys the reverted code.

---

## Performance Optimization

### 1. Enable Caching

Add Redis for session storage:

```yaml
# render.yaml
services:
  - type: redis
    name: rebooto-cache
    plan: free
    maxmemoryPolicy: allkeys-lru
```

Update session configuration:
```javascript
// Use Redis instead of PostgreSQL for sessions
const RedisStore = require('connect-redis').default;
const redis = require('redis');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

app.use(session({
  store: new RedisStore({ client: redisClient }),
  // ... other options
}));
```

### 2. Optimize Build

**Package.json**:
```json
{
  "scripts": {
    "build": "vite build --minify esbuild",
    "start": "NODE_ENV=production node --max-old-space-size=460 server/index.js"
  }
}
```

### 3. Database Optimization

**Add indexes** for frequently queried fields:
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_user_progress_user_id ON "userProgress"("userId");
```

---

## Security Checklist

### ✅ Before Going Live

- [ ] `NODE_ENV=production` set
- [ ] Strong `SESSION_SECRET` (64+ chars)
- [ ] Database SSL enabled (`rejectUnauthorized: false`)
- [ ] Azure client secrets stored in Render env vars (not code)
- [ ] Email shared mailbox configured (not personal account)
- [ ] Admin user password changed from default
- [ ] CORS configured for production domain only
- [ ] Rate limiting enabled for API endpoints
- [ ] SQL injection prevention (using parameterized queries)
- [ ] XSS prevention (React auto-escapes)
- [ ] CSRF protection enabled for forms
- [ ] HTTPS enforced (automatic on Render)
- [ ] Environment variables never logged
- [ ] Error messages don't expose sensitive info
- [ ] Database backups tested
- [ ] Uptime monitoring configured

---

## Next Steps

After successful deployment:

1. **Test all features** thoroughly
2. **Monitor logs** for errors in first 24 hours
3. **Set up email** (Azure AD OAuth2)
4. **Create admin account** and test admin portal
5. **Generate sample course** with AI course creator
6. **Add custom domain** (optional)
7. **Configure uptime monitoring**
8. **Plan upgrade to paid tier** before 90-day database expiry

---

## Support Resources

- **Render Docs**: https://render.com/docs
- **Render Status**: https://status.render.com
- **Render Community**: https://community.render.com
- **Azure AD Setup**: [AZURE_AD_EMAIL_SETUP.md](./AZURE_AD_EMAIL_SETUP.md)
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

## Summary

Your Rebooto platform is now live on Render! 🎉

**What you've deployed**:
- ✅ Full-stack Node.js/Express/React application
- ✅ PostgreSQL database with Drizzle ORM
- ✅ Email integration (Azure AD OAuth2)
- ✅ Auto-deploy from Git
- ✅ HTTPS enabled
- ✅ Scalable architecture

**Live URL**: `https://your-service-name.onrender.com`

Need help? Check the [Troubleshooting](#troubleshooting) section or open an issue on GitHub!
