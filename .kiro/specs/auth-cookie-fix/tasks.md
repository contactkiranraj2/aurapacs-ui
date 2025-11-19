# Implementation Plan

- [x] 1. Fix OTP verification response to include user data





  - Modify `/api/auth/otp/verify/route.ts` to return access_token, refresh_token, expires_in, and user object in response body
  - Add Cache-Control: no-store header to the response
  - _Requirements: 1.1, 1.3, 2.2_

- [x] 2. Update login page to use setSession for OTP flow





  - Replace `supabase.auth.signInWithOtp()` call with `supabase.auth.setSession()` in handleVerifyOtp function
  - Use tokens from server response (access_token, refresh_token)
  - Change navigation from `router.push()` to `window.location.href` for hard reload
  - _Requirements: 1.1, 1.2, 1.3, 2.3_

- [x] 3. Add cache control to email login endpoint





  - Add Cache-Control: no-store header to `/api/auth/login/route.tsx` response
  - Change client-side navigation from `router.push()` to `window.location.href` in login page
  - _Requirements: 2.1, 2.3_
