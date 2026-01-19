# Google OAuth Setup Guide

This guide explains how to set up Google OAuth authentication for the application.

## Prerequisites

1. A Google Cloud Platform (GCP) account
2. A GCP project with OAuth 2.0 credentials

## Step 1: Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - Choose **External** (unless you have a Google Workspace)
   - Fill in the required information (App name, User support email, etc.)
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if your app is in testing mode
6. For the OAuth client:
   - Application type: **Web application**
   - Name: Your app name
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://www.socialsync.space` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback` (for development)
     - `https://www.socialsync.space/api/auth/google/callback` (for production)
7. Click **Create**
8. Copy the **Client ID** and **Client Secret**

## Step 2: Configure Environment Variables

Add the following variables to your `.env.local` file:

```env
# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=https://www.socialsync.space/api/auth/google/callback

# Optional: Google Service Account (for server-side token verification)
# Store the entire JSON as a single-line string or use individual fields
GOOGLE_SERVICE_ACCOUNT={"type":"service_account","project_id":"socialsync-7f52d",...}
```

### For Development

```env
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

### For Production

```env
GOOGLE_REDIRECT_URI=https://www.socialsync.space/api/auth/google/callback
```

## Step 3: Service Account (Optional)

The service account key you provided can be used for server-side token verification if needed. You can store it in one of two ways:

### Option 1: Single JSON String
```env
GOOGLE_SERVICE_ACCOUNT={"type":"service_account","project_id":"socialsync-7f52d","private_key_id":"3b0f85eba98121e2288bdb3187277865412d9b7e",...}
```

### Option 2: Individual Fields (if you need to use them separately)
```env
GOOGLE_SERVICE_ACCOUNT_PROJECT_ID=socialsync-7f52d
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID=3b0f85eba98121e2288bdb3187277865412d9b7e
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL=firebase-adminsdk-fbsvc@socialsync-7f52d.iam.gserviceaccount.com
```

**Note:** The service account is currently not used in the OAuth flow, but it's stored for potential future use (e.g., Firebase Admin SDK operations).

## How It Works

1. User clicks "Sign in with Google" on login/register page
2. User is redirected to Google OAuth consent screen
3. User grants permissions
4. Google redirects back to `/api/auth/google/callback` with an authorization code
5. Server exchanges the code for user information
6. Server creates or logs in the user
7. User is redirected to the appropriate page (admin dashboard or home)

## Features

- **Automatic Account Linking**: If a user registers with email/password and later signs in with Google using the same email, their accounts are automatically linked
- **Email Verification**: Google-verified emails are automatically marked as verified
- **No Password Required**: Google OAuth users don't need a password
- **Session Management**: Uses the same JWT session system as regular login

## Troubleshooting

### "Google OAuth not configured"
- Ensure `GOOGLE_CLIENT_ID` is set in your environment variables

### "oauth_cancelled" error
- User cancelled the OAuth consent screen

### "oauth_failed" error
- Check that `GOOGLE_CLIENT_SECRET` is correct
- Verify the redirect URI matches exactly what's configured in Google Cloud Console

### Redirect URI mismatch
- Ensure the redirect URI in `.env.local` exactly matches the one in Google Cloud Console
- Check for trailing slashes, http vs https, etc.
