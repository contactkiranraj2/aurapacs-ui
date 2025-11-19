# Design Document

## Overview

This design addresses authentication issues with minimal code changes by fixing the OTP verification flow and adding cache control headers. The core problem is that the OTP verify endpoint returns tokens but the client-side code tries to use `signInWithOtp` which doesn't work with the server-generated tokens. The solution is to use `setSession` instead.

## Architecture

The authentication flow remains largely unchanged, with targeted fixes in two areas:

1. **OTP Verification Flow**: Server generates session tokens → Client receives tokens → Client calls `setSession` with tokens
2. **Cache Control**: All auth endpoints add `Cache-Control: no-store` header → Client uses hard navigation after login

## Components and Interfaces

### Modified Components

#### 1. OTP Verify API Route (`/api/auth/otp/verify`)
- **Current Issue**: Returns tokens but client doesn't use them properly
- **Fix**: Add Cache-Control header to response
- **Interface**: Returns `{ access_token, refresh_token, expires_in, user }`

#### 2. Login Page (`/app/login/page.tsx`)
- **Current Issue**: Calls `signInWithOtp` with shadow email (doesn't work)
- **Fix**: Call `setSession` with tokens from server response
- **Change**: Replace `supabase.auth.signInWithOtp()` with `supabase.auth.setSession()`

#### 3. Email Login API Route (`/api/auth/login`)
- **Current Issue**: No cache control
- **Fix**: Add Cache-Control header to response

### Data Flow

```
OTP Login Flow:
1. User enters mobile → POST /api/auth/otp/send
2. User enters OTP → POST /api/auth/otp/verify
3. Server validates OTP → generates tokens → returns { access_token, refresh_token }
4. Client receives response → calls supabase.auth.setSession({ access_token, refresh_token })
5. Client navigates → window.location.href = '/cases' (hard reload)

Email Login Flow:
1. User enters credentials → POST /api/auth/login
2. Server validates → sets cookies → returns with Cache-Control header
3. Client navigates → window.location.href = '/cases' (hard reload)
```

## Data Models

No database schema changes required. Existing models remain unchanged:
- `otp_codes` table
- `profiles` table
- Supabase auth users

## Error Handling

### OTP Verification Errors
- Invalid OTP: Return 400 with error message
- Expired OTP: Return 400 with error message
- Session creation failure: Return 500 with error message
- Client-side setSession failure: Display error to user

### Cache Control
- No special error handling needed
- Headers are additive and don't break existing functionality

## Testing Strategy

### Manual Testing
1. Test OTP login flow end-to-end
2. Verify page reloads after login (check Network tab for fresh requests)
3. Test email login flow
4. Verify no cached content served after authentication

### Verification Points
- OTP verify returns tokens in response body
- Client successfully calls setSession
- Cache-Control headers present in auth responses
- Hard navigation occurs after login (URL changes, page reloads)
