import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';

let connectionSettings: any;
let azureCredential: ClientSecretCredential | null = null;

/**
 * Authentication Strategy:
 * 1. If Azure AD credentials are provided (AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID),
 *    use OAuth2 client credentials flow for shared mailbox (portable, works anywhere)
 * 2. Otherwise, fall back to Replit's Outlook connector (Replit-hosted only)
 */

// Check if Azure AD OAuth2 credentials are configured
function isAzureOAuth2Configured(): boolean {
  return !!(
    process.env.AZURE_CLIENT_ID &&
    process.env.AZURE_CLIENT_SECRET &&
    process.env.AZURE_TENANT_ID
  );
}

// Get or create Azure credential (reused across calls)
function getAzureCredential(): ClientSecretCredential {
  if (!azureCredential) {
    azureCredential = new ClientSecretCredential(
      process.env.AZURE_TENANT_ID!,
      process.env.AZURE_CLIENT_ID!,
      process.env.AZURE_CLIENT_SECRET!
    );
  }
  return azureCredential;
}

// Get access token using Replit's Outlook connector
async function getReplitConnectorToken(): Promise<string> {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=outlook',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Outlook not connected via Replit connector');
  }
  return accessToken;
}

export async function getUncachableOutlookClient() {
  if (isAzureOAuth2Configured()) {
    console.log('Using Azure AD OAuth2 for email authentication');
    
    // Use TokenCredentialAuthenticationProvider for automatic token refresh
    const credential = getAzureCredential();
    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes: ['https://graph.microsoft.com/.default']
    });

    return Client.initWithMiddleware({
      authProvider: authProvider
    });
  } else {
    console.log('Using Replit Outlook connector for email authentication');
    
    // For Replit connector, use raw token (no automatic refresh available)
    const accessToken = await getReplitConnectorToken();
    return Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => accessToken
      }
    });
  }
}

export async function sendEmail(to: string, subject: string, body: string, from?: string) {
  try {
    const client = await getUncachableOutlookClient();
    
    const message = {
      subject: subject,
      body: {
        contentType: 'HTML',
        content: body
      },
      toRecipients: [
        {
          emailAddress: {
            address: to
          }
        }
      ]
    };

    // If using Azure OAuth2 with a shared mailbox, send from that mailbox
    if (isAzureOAuth2Configured() && process.env.SHARED_MAILBOX_EMAIL) {
      const mailbox = from || process.env.SHARED_MAILBOX_EMAIL;
      console.log(`Sending email from shared mailbox: ${mailbox}`);
      
      // Use /users/{mailbox}/sendMail endpoint for shared mailbox
      await client.api(`/users/${encodeURIComponent(mailbox)}/sendMail`).post({
        message: message,
        saveToSentItems: true
      });
    } else {
      // Send from current user's mailbox using /me/sendMail (Replit connector)
      await client.api('/me/sendMail').post({
        message: message,
        saveToSentItems: true
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
