# Troubleshooting Google OAuth Token Issues

This guide helps resolve common issues when Google OAuth tokens are not appearing in the NextAuth session.

## Common Issues and Solutions

### 1. Tokens Not Appearing in Session

#### Symptoms:
- `session.token` is `undefined` or `null`
- Console shows session data but no token properties
- Backend authentication fails due to missing tokens

#### Solutions:

**A. Check NextAuth Configuration**

Ensure your `[...nextauth].ts` file has proper callbacks:

```typescript
// ✅ Correct configuration
callbacks: {
    jwt: async ({ token, account }) => {
        if (account) {
            token.accessToken = account.access_token;
            token.idToken = account.id_token;
            token.refeshToken = account.refresh_token;
        }
        return token;
    },
    session: async ({ session, token }) => {
        session.token = {
            accessToken: token.accessToken,
            idToken: token.idToken,
            refeshToken: token.refeshToken,
        };
        return session;
    }
}

// ❌ Incorrect - returning nested objects
session: async ({ session, token }) => {
    return { session, token }; // This won't work!
}
```

**B. Verify Environment Variables**

Check your `.env` file:

```bash
# Required variables
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=your-client-secret
```

**C. Google Cloud Console Configuration**

1. **Authorized JavaScript Origins:**
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)

2. **Authorized Redirect URIs:**
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

3. **Required Scopes:**
   - `openid`
   - `email`
   - `profile`
   - Add additional scopes as needed

### 2. Access Token Expires Quickly

#### Symptoms:
- Tokens work initially but fail after 1 hour
- API calls return 401 Unauthorized

#### Solutions:

**A. Request Offline Access**

Ensure your Google provider configuration includes:

```typescript
GoogleProvider({
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!,
    authorization: {
        params: {
            prompt: "consent",
            access_type: "offline", // This is crucial!
            response_type: "code"
        }
    }
})
```

**B. Implement Token Refresh**

```typescript
// Add to your JWT callback
jwt: async ({ token, account }) => {
    if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at * 1000;
    }
    
    // Return previous token if the access token has not expired yet
    if (Date.now() < token.accessTokenExpires) {
        return token;
    }
    
    // Access token has expired, try to update it
    return refreshAccessToken(token);
}
```

### 3. Debug Steps

#### Step 1: Enable Debug Logging

Add to your NextAuth config:

```typescript
export const authOptions: AuthOptions = {
    // ... other config
    debug: process.env.NODE_ENV === 'development',
    logger: {
        error(code, metadata) {
            console.error('NextAuth Error:', code, metadata);
        },
        warn(code) {
            console.warn('NextAuth Warning:', code);
        },
        debug(code, metadata) {
            console.log('NextAuth Debug:', code, metadata);
        }
    }
}
```

#### Step 2: Use the Debug Component

Add the `DebugSession` component to your app:

```typescript
import DebugSession from '@/components/Custom/DebugSession';

// Add to any page for testing
<DebugSession />
```

#### Step 3: Check Browser Network Tab

1. Open Developer Tools → Network tab
2. Sign in with Google
3. Look for requests to `/api/auth/`
4. Check response data for token information

#### Step 4: Console Debugging

Add temporary logging in your callbacks:

```typescript
jwt: async ({ token, account }) => {
    console.log('JWT Callback - Account:', account);
    console.log('JWT Callback - Token before:', token);
    
    if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        token.refeshToken = account.refresh_token;
    }
    
    console.log('JWT Callback - Token after:', token);
    return token;
},
session: async ({ session, token }) => {
    console.log('Session Callback - Token:', token);
    session.token = {
        accessToken: token.accessToken,
        idToken: token.idToken,
        refeshToken: token.refeshToken,
    };
    console.log('Session Callback - Final session:', session);
    return session;
}
```

### 4. Common Mistakes

#### ❌ Wrong Client ID Usage

```typescript
// Don't use API key as client ID
clientId: process.env.NEXT_PUBLIC_GOOGLE_API_KEY // Wrong!

// Use the actual client ID
clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID // Correct!
```

#### ❌ Missing TypeScript Declarations

```typescript
// Add these to extend NextAuth types
declare module 'next-auth' {
    interface Session {
        token?: {
            accessToken?: string;
            idToken?: string;
            refeshToken?: string;
        };
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        accessToken?: string;
        idToken?: string;
        refeshToken?: string;
    }
}
```

#### ❌ Incorrect Callback Returns

```typescript
// Wrong - returning nested objects
session: ({ session, token }) => ({ session, token })

// Correct - modifying and returning session
session: ({ session, token }) => {
    session.token = { /* token data */ };
    return session;
}
```

### 5. Testing Checklist

- [ ] Environment variables are set correctly
- [ ] Google Cloud Console is configured properly
- [ ] NextAuth callbacks are implemented correctly
- [ ] TypeScript declarations are added
- [ ] Debug logging is enabled
- [ ] Browser console shows no errors
- [ ] Network requests complete successfully
- [ ] Session contains token data

### 6. Alternative Token Access Methods

If session tokens still don't work, try these alternatives:

#### Server-Side Token Access

```typescript
// In API routes
import { getToken } from 'next-auth/jwt';

export default async function handler(req, res) {
    const token = await getToken({ req });
    console.log('Server-side token:', token);
}
```

#### Direct Database Access

If using a database adapter, tokens might be stored there:

```typescript
// Check your database for account tokens
// Table: accounts
// Fields: access_token, id_token, refresh_token
```

### 7. Production Considerations

- Use HTTPS in production
- Set proper NEXTAUTH_URL
- Use secure NEXTAUTH_SECRET
- Configure proper redirect URIs
- Test token refresh functionality
- Implement proper error handling

### 8. Getting Help

If issues persist:

1. Check NextAuth.js documentation
2. Review Google OAuth 2.0 documentation
3. Check GitHub issues for similar problems
4. Enable debug mode and share logs
5. Verify Google Cloud Console settings

Remember: Token issues are often configuration-related. Double-check all settings before implementing complex workarounds.