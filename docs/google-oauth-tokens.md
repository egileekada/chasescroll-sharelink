# Google OAuth Token Access Guide

This guide explains how to retrieve and use Google OAuth tokens after successful authentication using NextAuth.js in your application.

## Overview

After a successful Google OAuth sign-in, you can access tokens in multiple ways:

1. **Client-side using useSession hook**
2. **Client-side using getSession function**
3. **Server-side using getServerSession**
4. **Server-side using getToken (JWT)**
5. **Custom hook for token management**

## Token Types

- **Access Token**: Used to make authenticated requests to Google APIs
- **ID Token**: Contains user identity information (JWT format)
- **Refresh Token**: Used to obtain new access tokens when they expire

## Implementation Methods

### 1. Client-Side Token Access

#### Using useSession Hook

```typescript
import { useSession } from 'next-auth/react';

function MyComponent() {
    const { data: session } = useSession();
    
    const getTokens = () => {
        if (session?.token) {
            return {
                accessToken: session.token.accessToken,
                idToken: session.token.idToken,
                refreshToken: session.token.refeshToken
            };
        }
        return null;
    };
    
    // Use tokens for API calls
    const callGoogleAPI = async () => {
        const tokens = getTokens();
        if (tokens?.accessToken) {
            const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    'Authorization': `Bearer ${tokens.accessToken}`
                }
            });
            const userInfo = await response.json();
            console.log(userInfo);
        }
    };
}
```

#### Using getSession Function

```typescript
import { getSession } from 'next-auth/react';

const getFreshTokens = async () => {
    const session = await getSession();
    if (session?.token) {
        return {
            accessToken: session.token.accessToken,
            idToken: session.token.idToken,
            refreshToken: session.token.refeshToken
        };
    }
    return null;
};
```

### 2. Server-Side Token Access

#### Using getServerSession

```typescript
// pages/api/example.ts
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);
    
    if (session?.token) {
        const { accessToken, idToken, refreshToken } = session.token;
        // Use tokens for server-side API calls
    }
}
```

#### Using getToken (JWT)

```typescript
// pages/api/example.ts
import { getToken } from 'next-auth/jwt';

export default async function handler(req, res) {
    const token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (token) {
        const { accessToken, idToken, refreshToken } = token;
        // Use tokens for server-side operations
    }
}
```

### 3. Custom Hook for Token Management

Use the `useGoogleTokens` hook for comprehensive token management:

```typescript
import { useGoogleTokens } from '@/hooks/useGoogleTokens';

function MyComponent() {
    const { 
        tokens, 
        isLoading, 
        error, 
        refreshTokens, 
        sendTokensToBackend 
    } = useGoogleTokens();
    
    const handleUseTokens = async () => {
        if (tokens?.accessToken) {
            // Make Google API calls
            try {
                const userProfile = await getGoogleUserProfile(tokens.accessToken);
                console.log('User profile:', userProfile);
                
                // Send tokens to backend for storage
                await sendTokensToBackend(tokens);
            } catch (error) {
                console.error('Error using tokens:', error);
            }
        }
    };
    
    const handleRefreshTokens = async () => {
        const freshTokens = await refreshTokens();
        if (freshTokens) {
            console.log('Refreshed tokens:', freshTokens);
        }
    };
}
```

## Common Use Cases

### 1. Making Google API Calls

```typescript
// Get user's Google profile
const getUserProfile = async (accessToken: string) => {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return response.json();
};

// Get user's Google Drive files
const getDriveFiles = async (accessToken: string) => {
    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return response.json();
};
```

### 2. Storing Tokens in Backend

```typescript
// Send tokens to your backend API
const storeTokens = async (tokens: GoogleTokens) => {
    await fetch('/api/auth/store-tokens', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(tokens),
    });
};
```

### 3. Refreshing Expired Tokens

```typescript
const refreshAccessToken = async (refreshToken: string) => {
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            client_secret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
        }),
    });
    
    return response.json();
};
```

## Best Practices

1. **Security**: Never expose tokens in client-side logs or store them in localStorage
2. **Token Expiry**: Always handle token expiration and refresh when needed
3. **Error Handling**: Implement proper error handling for API calls
4. **Scopes**: Request only the necessary Google API scopes
5. **Storage**: Store sensitive tokens securely on the server-side

## Troubleshooting

### Tokens are undefined or null
- Ensure NextAuth callbacks are properly configured
- Check that the user is authenticated before accessing tokens
- Verify environment variables are set correctly

### Access token expired
- Use the refresh token to get a new access token
- Implement automatic token refresh logic

### API calls failing
- Verify the access token is valid and not expired
- Check that the required scopes are granted
- Ensure proper Authorization header format

## Files Modified/Created

- `src/components/Custom/modals/AccountSetup.tsx` - Updated with token access examples
- `src/hooks/useGoogleTokens.ts` - Custom hook for token management
- `src/pages/api/auth/store-tokens.ts` - Server-side token handling
- `src/pages/api/auth/[...nextauth].ts` - Updated NextAuth configuration

This implementation provides multiple ways to access and use Google OAuth tokens effectively in your application.