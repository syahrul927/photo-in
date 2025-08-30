# Google OAuth Token Utility

A comprehensive TypeScript utility for handling Google OAuth authentication in a single file.

## Setup

### Environment Variables
Required in your `.env` file:

```bash
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_DEVELOPER_KEY=your_developer_key
```

## Functions

### `generateAuthUrl(): string`
Returns the Google OAuth consent screen URL.

**Usage:**
```typescript
import { generateAuthUrl } from '@/lib/google-oauth-token';

const authUrl = generateAuthUrl();
// Redirect user to authUrl
```

### `exchangeCodeForTokens(code: string): Promise<TokenResponse>`
Exchanges the authorization code for access and refresh tokens.

**Usage:**
```typescript
import { exchangeCodeForTokens } from '@/lib/google-oauth-token';

try {
  const tokens = await exchangeCodeForTokens(authorizationCode);
  console.log(tokens.access_token);    // JWT access token
  console.log(tokens.refresh_token);   // Refresh token (store securely)
  console.log(tokens.expiry_date);     // Token expiration timestamp
} catch (error) {
  console.error('Token exchange failed:', error);
}
```

### `refreshAccessToken(refreshToken: string): Promise<TokenResponse>`
Refreshes an expired access token.

**Usage:**
```typescript
import { refreshAccessToken } from '@/lib/google-oauth-token';

async function refreshUserToken(storedRefreshToken: string) {
  try {
    const newTokens = await refreshAccessToken(storedRefreshToken);
    // Update stored tokens
    await updateUserTokens(newTokens);
    return newTokens.access_token;
  } catch (error) {
    // Handle refresh failure - user needs to re-authenticate
    redirectToLogin();
  }
}
```

### `verifyToken(accessToken: string): Promise<boolean>`
Checks if an access token is valid and not expired.

**Usage:**
```typescript
import { verifyToken } from '@/lib/google-oauth-token';

const isValid = await verifyToken(currentAccessToken);
if (!isValid) {
  // Token expired or invalid
  await refreshAccessToken(storedRefreshToken);
}
```

### `getUserInfo(accessToken: string): Promise<UserInfo>`
Retrieves user information from the access token.

**Usage:**
```typescript
import { getUserInfo } from '@/lib/google-oauth-token';

const user = await getUserInfo(accessToken);
console.log(user.email);    // "user@example.com"
console.log(user.name);     // "John Doe"
console.log(user.picture);  // "https://lh3.googleusercontent.com/..."
console.log(user.id);       // "123456789"
```

### `getAuthenticatedClient(tokens: Tokens): OAuth2Client`
Returns an authenticated Google API client for making API calls.

**Usage:**
```typescript
import { getAuthenticatedClient } from '@/lib/google-oauth-token';
import { google } from 'googleapis';

const oauth2Client = getAuthenticatedClient({
  access_token: accessToken,
  refresh_token: refreshToken
});

// Use with Google APIs
const drive = google.drive({ version: 'v3', auth: oauth2Client });
const files = await drive.files.list({
  pageSize: 10,
  fields: 'files(id, name, modifiedTime)'
});
```

## Complete Integration Example

### Next.js API Route Handler

```typescript
// app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens, getUserInfo } from '@/lib/google-oauth-token';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return NextResponse.redirect('/auth/error?reason=no-code');
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);
    
    // Get user information
    const userInfo = await getUserInfo(tokens.access_token);
    
    // Store user and tokens in database
    const user = await db.user.upsert({
      where: { email: userInfo.email },
      update: {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
        googleExpiryDate: new Date(tokens.expiry_date),
      },
      create: {
        email: userInfo.email,
        name: userInfo.name,
        avatarUrl: userInfo.picture,
        googleId: userInfo.id,
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
        googleExpiryDate: new Date(tokens.expiry_date),
      },
    });

    // Redirect to dashboard
    return NextResponse.redirect(`/dashboard?user=${user.id}`);
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect('/auth/error?reason=server-error');
  }
}
```

### Express.js Route Example

```typescript
// routes/auth.js
import { Router } from 'express';
import { 
  generateAuthUrl, 
  exchangeCodeForTokens, 
  getUserInfo,
  refreshAccessToken,
  verifyToken 
} from '../lib/google-oauth-token';

const router = Router();

// Initiate OAuth flow
router.get('/login', (req, res) => {
  const authUrl = generateAuthUrl();
  res.redirect(authUrl);
});

// Handle OAuth callback
router.get('/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'No authorization code provided' });
    }

    const tokens = await exchangeCodeForTokens(code);
    const userInfo = await getUserInfo(tokens.access_token);

    // Save to session/database
    req.session.tokens = tokens;
    req.session.user = userInfo;
    
    res.redirect('/dashboard');
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Refresh token route
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const newTokens = await refreshAccessToken(refreshToken);
    
    req.session.tokens = { ...req.session.tokens, ...newTokens };
    res.json(newTokens);
  } catch (error) {
    res.status(401).json({ error: 'Token refresh failed' });
  }
});
```

## Token Storage Best Practices

### Database Schema Example
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  google_id VARCHAR(255) UNIQUE,
  google_access_token TEXT ENCRYPTED,
  google_refresh_token TEXT ENCRYPTED,
  google_expiry_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Security Considerations
- Never expose refresh tokens to the client
- Store refresh tokens encrypted at rest
- Use HTTPS for all OAuth redirects
- Implement proper token rotation on refresh
- Consider token expiration strategies
- Validate state parameter to prevent CSRF

### Token Lifecycle Management
```typescript
// Check if token needs refresh
async function checkAndRefreshToken(user: User) {
  if (user.googleExpiryDate < new Date()) {
    const newTokens = await refreshAccessToken(user.googleRefreshToken);
    await updateUserTokens(user.id, newTokens);
  }
  
  return user.googleAccessToken;
}
```

## Backend-Only Token API (Zero-Knowledge Frontend)

When the frontend should know **nothing** about authentication, use session-based API endpoints:

### Full Backend OAuth Flow

```typescript
// app/api/auth/google/start/route.ts
import { generateAuthUrl } from '@/lib/google-oauth-token';

export async function GET() {
  const authUrl = generateAuthUrl();
  return Response.redirect(authUrl);
}

// app/api/auth/google/callback/route.ts  
import { exchangeCodeForTokens, getUserInfo } from '@/lib/google-oauth-token';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const userId = request.nextUrl.searchParams.get('state');
  
  if (!code) {
    return NextResponse.redirect('/auth/error');
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const userInfo = await getUserInfo(tokens.access_token);
    
    // Store tokens server-side (never expose to client)
    const user = await db.user.upsert({
      where: { email: userInfo.email },
      update: {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
        googleExpiryDate: new Date(tokens.expiry_date)
      },
      create: {
        email: userInfo.email,
        name: userInfo.name,
        avatarUrl: userInfo.picture,
        googleId: userInfo.id,
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
        googleExpiryDate: new Date(tokens.expiry_date)
      }
    });

    // Set session cookie (frontend doesn't see any tokens)
    const response = NextResponse.redirect('/dashboard');
    response.cookies.set('session', createSessionCookie(user.id), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    return NextResponse.redirect('/auth/error');
  }
}
```

### Zero-Knowledge API Endpoints

```typescript
// app/api/google/files/route.ts
import { getAuthenticatedClient } from '@/lib/google-oauth-token';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  // Get user ID from session (frontend never knows)
  const userId = getUserFromSession(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get tokens from secure storage
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Check if token needs refresh
  if (new Date() > new Date(user.googleExpiryDate)) {
    try {
      const tokens = await refreshAccessToken(user.googleRefreshToken);
      await db.user.update({
        where: { id: userId },
        data: { 
          googleAccessToken: tokens.access_token,
          googleExpiryDate: new Date(tokens.expiry_date)
        }
      });
    } catch (error) {
      return NextResponse.json({ error: 'Re-authentication required' }, { status: 401 });
    }
  }

  // Make authenticated API call
  try {
    const oauth2Client = getAuthenticatedClient({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const files = await drive.files.list({ pageSize: 10 });
    
    return NextResponse.json(files.data);
  } catch (error) {
    return NextResponse.json({ error: 'API request failed' }, { status: 500 });
  }
}
```

### Frontend Zero-Knowledge Pattern

```typescript
// Frontend - never touches tokens
class ZeroKnowledgeAPI {
  async getFiles() {
    // Just uses session cookie transparently
    const response = await fetch('/api/google/files', {
      credentials: 'include' // uses session cookie
    });
    
    if (response.status === 401) {
      // Redirect to login when session expires
      window.location.href = '/api/auth/google/start';
      return;
    }
    
    return response.json();
  }

  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/google/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    
    return response.json();
  }
}
```

### Session Management

```typescript
// lib/session.ts
import { db } from '@/lib/db';

async function getUserFromSession(request: NextRequest): Promise<string | null> {
  const sessionId = request.cookies.get('session')?.value;
  if (!sessionId) return null;

  const session = await db.session.findUnique({
    where: { id: sessionId },
    include: { user: true }
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session.userId;
}
```

### Complete Flow Summary

```mermaid
flowchart TD
    A[Frontend User] -->|Click Login| B[/api/auth/google/start]
    B -->|Redirect| C[Google Consent]
    C -->|Redirect| D[/api/auth/google/callback?code=xxx]
    D -->|Server-side| E[Store tokens securely]
    E -->|Set session cookie| F[Dashboard]
    F -->|API requests| G[/api/google/files]
    G -->|Auto-refresh tokens| H[G Drive API]
    H -->|Response| G
    G -->|Data| F
```

## Security Key Points
- **Zero client knowledge** - frontend never sees tokens
- **Session-based auth** - uses secure HTTP-only cookies
- **Backend token rotation** - automatic refresh on expiry
- **One redirect flow** - user only sees Google consent
- **Seamless API usage** - frontend uses regular endpoints

## Error Handling

All functions throw descriptive errors for proper handling:

```typescript
try {
  const tokens = await exchangeCodeForTokens(code);
} catch (error) {
  if (error.message.includes('invalid_grant')) {
    // User revoked access or code expired
    redirectToLogin();
  }
  
  if (error.message.includes('token has been expired')) {
    // Token expiration - attempt refresh
    await refreshAccessToken(refreshToken);
  }
  
  // Handle network or other errors
  showErrorMessage('Authentication failed');
}
```