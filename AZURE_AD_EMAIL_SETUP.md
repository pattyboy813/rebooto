# Azure AD Email Setup for Self-Hosting

This guide explains how to configure OAuth2 authentication for sending emails through a Microsoft 365 shared mailbox when hosting Rebooto outside of Replit.

## Overview

Rebooto supports two email authentication methods:
1. **Replit Connector** (automatic when hosted on Replit)
2. **Azure AD OAuth2** (for self-hosting with shared mailbox)

## Azure AD App Registration Setup

### Step 1: Register an Application in Azure AD

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Configure:
   - **Name**: `Rebooto Email Service` (or your preferred name)
   - **Supported account types**: Accounts in this organizational directory only
   - **Redirect URI**: Not needed for server-to-server auth
5. Click **Register**

### Step 2: Create Client Secret

1. In your app registration, go to **Certificates & secrets**
2. Click **New client secret**
3. Add a description: `Rebooto Production Secret`
4. Choose expiration period (recommended: 24 months)
5. Click **Add**
6. **IMPORTANT**: Copy the secret **Value** immediately - you won't see it again!

### Step 3: Configure API Permissions

1. Go to **API permissions**
2. Click **Add a permission** → **Microsoft Graph** → **Application permissions**
3. Add these permissions:
   - `Mail.Send` - Send mail as any user
   - `Mail.ReadWrite` - Read and write mail in all mailboxes (optional, for sent items)
4. Click **Add permissions**
5. **IMPORTANT**: Click **Grant admin consent** for your organization

### Step 4: Create Shared Mailbox (Optional but Recommended)

1. Go to [Microsoft 365 Admin Center](https://admin.microsoft.com)
2. Navigate to **Teams & groups** → **Shared mailboxes**
3. Click **Add a shared mailbox**
4. Configure:
   - **Name**: `Rebooto Notifications`
   - **Email**: `noreply@yourdomain.com` (or your preferred address)
5. Click **Add**
6. Grant your Azure AD app permissions to the shared mailbox

### Step 5: Collect Configuration Values

You'll need these values from Azure AD:

1. **Tenant ID**: 
   - Found in **Azure Active Directory** → **Overview** → **Tenant ID**
   
2. **Client ID (Application ID)**:
   - Found in your app registration → **Overview** → **Application (client) ID**
   
3. **Client Secret**:
   - The value you copied in Step 2

4. **Shared Mailbox Email**:
   - The email address of your shared mailbox (e.g., `noreply@yourdomain.com`)

## Environment Variable Configuration

Add these environment variables to your hosting environment:

```bash
# Azure AD OAuth2 Configuration
AZURE_TENANT_ID=your-tenant-id-here
AZURE_CLIENT_ID=your-client-id-here
AZURE_CLIENT_SECRET=your-client-secret-here
SHARED_MAILBOX_EMAIL=noreply@yourdomain.com

# Optional: If not set, defaults to development
NODE_ENV=production
```

### For Different Hosting Platforms

#### Docker / Docker Compose
Add to your `docker-compose.yml`:
```yaml
services:
  app:
    environment:
      - AZURE_TENANT_ID=${AZURE_TENANT_ID}
      - AZURE_CLIENT_ID=${AZURE_CLIENT_ID}
      - AZURE_CLIENT_SECRET=${AZURE_CLIENT_SECRET}
      - SHARED_MAILBOX_EMAIL=${SHARED_MAILBOX_EMAIL}
      - NODE_ENV=production
```

#### Kubernetes
Create a Secret:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: azure-email-config
type: Opaque
stringData:
  AZURE_TENANT_ID: "your-tenant-id"
  AZURE_CLIENT_ID: "your-client-id"
  AZURE_CLIENT_SECRET: "your-client-secret"
  SHARED_MAILBOX_EMAIL: "noreply@yourdomain.com"
```

#### AWS / Heroku / Other PaaS
Use your platform's environment variable management:
- AWS: Systems Manager Parameter Store or Secrets Manager
- Heroku: Config Vars in dashboard or `heroku config:set`
- Azure App Service: Configuration → Application settings

#### Traditional Server (systemd, PM2, etc.)
Create a `.env` file (DO NOT commit to git):
```bash
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
SHARED_MAILBOX_EMAIL=noreply@yourdomain.com
NODE_ENV=production
```

## Testing the Configuration

### 1. Test with cURL

Once deployed, test the password reset endpoint:

```bash
curl -X POST https://your-domain.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 2. Check Application Logs

Look for this log message on startup:
```
Using Azure AD OAuth2 for email authentication
```

If you see this instead, check your environment variables:
```
Using Replit Outlook connector for email authentication
```

### 3. Monitor Email Delivery

Check your shared mailbox's **Sent Items** folder to confirm emails are being sent.

## Security Best Practices

### 1. Rotate Secrets Regularly
- Set calendar reminders to rotate your client secret every 12-24 months
- Azure AD allows creating a new secret before the old one expires

### 2. Restrict API Permissions
- Only grant the minimum permissions needed (`Mail.Send`)
- Avoid granting `Mail.ReadWrite` unless you need to read emails

### 3. Monitor Usage
- Enable Azure AD sign-in logs to monitor the app's API usage
- Set up alerts for unusual activity

### 4. Protect Environment Variables
- Never commit secrets to version control
- Use secret management services (Azure Key Vault, AWS Secrets Manager, etc.)
- Rotate secrets if they're ever exposed

### 5. Shared Mailbox Isolation
- Use a dedicated shared mailbox for system emails
- Don't use personal mailboxes for application authentication

## Troubleshooting

### Error: "Failed to obtain Azure AD access token"

**Cause**: Invalid credentials or token endpoint issues

**Solutions**:
- Verify `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, and `AZURE_CLIENT_SECRET` are correct
- Check that the client secret hasn't expired
- Ensure your app has internet access to login.microsoftonline.com

### Error: "Insufficient privileges to complete the operation"

**Cause**: Missing API permissions or admin consent

**Solutions**:
- Go to Azure AD → Your app → API permissions
- Verify `Mail.Send` permission is added
- Click "Grant admin consent for [your org]"
- Wait 5-10 minutes for permissions to propagate

### Error: "The specified object was not found in the store"

**Cause**: Shared mailbox email address doesn't exist

**Solutions**:
- Verify `SHARED_MAILBOX_EMAIL` matches exactly (case-sensitive)
- Ensure the shared mailbox is created in Microsoft 365 Admin Center
- Check that the app has permissions to access the mailbox

### Emails Not Sending (No Error)

**Cause**: Application might be using wrong authentication method

**Solutions**:
- Check application logs for: "Using Azure AD OAuth2 for email authentication"
- Verify all four environment variables are set
- Restart the application after setting environment variables

## Comparison: Replit vs. Self-Hosted

| Feature | Replit Connector | Azure AD OAuth2 |
|---------|-----------------|-----------------|
| Setup Complexity | Easy (OAuth via UI) | Moderate (Azure AD config) |
| Hosting | Replit only | Any platform |
| Cost | Free tier available | Requires M365 license |
| Shared Mailbox | Requires manual setup | Native support |
| Token Management | Automatic | Automatic (cached) |
| Best For | Quick prototyping | Production deployment |

## Migration from Replit to Self-Hosted

When moving from Replit to your own infrastructure:

1. Complete Azure AD setup above
2. Set environment variables in your hosting platform
3. Deploy the application
4. Test email sending
5. Monitor logs to confirm Azure AD OAuth2 is being used

No code changes needed - the application automatically detects which authentication method to use!

## Support

For issues specific to:
- **Azure AD configuration**: Check [Microsoft Graph API documentation](https://docs.microsoft.com/en-us/graph/api/user-sendmail)
- **Rebooto application**: Check application logs and verify environment variables
- **Shared mailbox permissions**: Consult your Microsoft 365 administrator
