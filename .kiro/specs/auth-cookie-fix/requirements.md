# Requirements Document

## Introduction

This document outlines the requirements for fixing authentication issues in the AuraPACS application, specifically addressing Supabase cookie management complexity, OTP-based patient registration flow, and cache control after login.

## Glossary

- **Supabase Client**: A client instance that communicates with Supabase backend services for authentication and data operations
- **SSR Client**: Server-side rendering client that manages cookies through Next.js server components
- **OTP**: One-Time Password used for mobile-based authentication
- **Session Cookie**: HTTP cookie containing authentication tokens for maintaining user sessions
- **Cache-Control Header**: HTTP header that controls browser and CDN caching behavior
- **Shadow Email**: A synthetic email address generated from a mobile number for users who register via OTP

## Requirements

### Requirement 1

**User Story:** As a patient, I want to login using my mobile number with OTP, so that I can access my medical records without authentication failures

#### Acceptance Criteria

1. WHEN a patient submits a valid OTP, THE System SHALL establish an authenticated session using setSession instead of signInWithOtp
2. THE System SHALL remove the broken client-side signInWithOtp call from the login page
3. WHEN OTP verification succeeds, THE System SHALL use the access and refresh tokens from the server response

### Requirement 2

**User Story:** As a user, I want pages to reload after login, so that I see fresh authenticated content without cached data

#### Acceptance Criteria

1. WHEN a user successfully logs in via email, THE System SHALL add Cache-Control no-store header to the response
2. WHEN a user successfully logs in via OTP, THE System SHALL add Cache-Control no-store header to the response
3. WHEN a user navigates after login, THE System SHALL use window.location.href instead of router.push for hard reload
