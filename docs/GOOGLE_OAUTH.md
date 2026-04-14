# Google OAuth Setup Guide

This project supports Google Sign-In for both registration and login.

## Step 1 — Create a Google Cloud Project

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Click **New Project** → name it "Savvy UK"
3. Select the project

## Step 2 — Enable Google Identity API

1. Go to **APIs & Services → Library**
2. Search for **"Google Identity"** → Enable it

## Step 3 — Create OAuth 2.0 Credentials

1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Name: "Savvy UK Web"
5. Authorised JavaScript origins:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
6. Authorised redirect URIs:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
7. Click **Create** — copy your **Client ID** and **Client Secret**

## Step 4 — Add to Environment Variables

**backend/.env:**
```
GOOGLE_CLIENT_ID=123456789-xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx
```

**frontend/.env.local:**
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-xxxx.apps.googleusercontent.com
```

The `NEXT_PUBLIC_GOOGLE_CLIENT_ID` must match the backend `GOOGLE_CLIENT_ID` exactly.

## How It Works

1. User clicks **Continue with Google** on login or register page
2. Google Identity Services SDK pops up a Google account picker
3. After selection, Google returns an **ID token** to the frontend
4. Frontend sends the ID token to `POST /api/v1/auth/google`
5. Backend verifies the token with Google using `google-auth-library`
6. Backend creates or finds the user (upsert by email)
7. Returns our own JWT tokens — same flow as email/password
8. User is redirected to dashboard or onboarding

## Notes

- Google users are created with `emailVerified: true` automatically
- Google users have no password — they can only log in via Google
- The `googleId` field stores the Google `sub` identifier
- Profile picture URL is stored in `avatarUrl`

## Troubleshooting

**"Google Client ID not set"** — `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is missing from `.env.local`

**"Invalid Google token"** — Mismatch between frontend and backend `GOOGLE_CLIENT_ID`

**"Redirect URI mismatch"** — Your current domain is not listed in Google Console authorised origins

