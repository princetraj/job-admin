# Production Build Guide

## Overview

This guide explains how to create production builds with different environment configurations for your Job Portal Admin Panel.

## Understanding Environment Variables in Production

**Important:** In React (Create React App), environment variables are **embedded at build time**, not runtime. This means:

- Variables are baked into the JavaScript bundle during `npm run build`
- You cannot change them after building without rebuilding
- Different environments require different builds

## Method 1: Using .env.production File (Recommended for Simple Deployments)

### Step 1: Create Production Environment File

Create a file named `.env.production` in the admin-panel root:

```bash
cd C:\wamp64\www\jobprotal\admin-panel
notepad .env.production
```

Add your production API URL:

```env
REACT_APP_API_BASE_URL=https://api.yourjobportal.com/api/v1
```

### Step 2: Build for Production

```bash
npm run build
```

This will:
- Use variables from `.env.production`
- Create optimized bundle in `/build` folder
- Embed the production API URL

### Step 3: Deploy

Upload the `/build` folder contents to your web server.

---

## Method 2: Environment-Specific Builds (Multiple Environments)

### Setup for Multiple Environments

Create separate environment files:

**Development (.env.development):**
```env
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
```

**Staging (.env.staging):**
```env
REACT_APP_API_BASE_URL=https://staging-api.yourjobportal.com/api/v1
```

**Production (.env.production):**
```env
REACT_APP_API_BASE_URL=https://api.yourjobportal.com/api/v1
```

### Update package.json

Add custom build scripts in `package.json`:

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "build:staging": "env-cmd -f .env.staging react-scripts build",
    "build:production": "env-cmd -f .env.production react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

### Install env-cmd

```bash
npm install env-cmd --save-dev
```

### Build for Specific Environment

```bash
# Development build (uses .env.development)
npm run build

# Staging build
npm run build:staging

# Production build
npm run build:production
```

---

## Method 3: Command Line Environment Variables (CI/CD)

### Windows (PowerShell)

```powershell
$env:REACT_APP_API_BASE_URL="https://api.yourjobportal.com/api/v1"
npm run build
```

### Windows (CMD)

```cmd
set REACT_APP_API_BASE_URL=https://api.yourjobportal.com/api/v1 && npm run build
```

### Linux/Mac

```bash
REACT_APP_API_BASE_URL=https://api.yourjobportal.com/api/v1 npm run build
```

### In CI/CD Pipeline (GitHub Actions Example)

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Build
        env:
          REACT_APP_API_BASE_URL: https://api.yourjobportal.com/api/v1
        run: npm run build
      - name: Deploy
        # Your deployment steps here
```

---

## Method 4: Using Hosting Platform Environment Variables

### Vercel

1. Go to your project on Vercel
2. Navigate to **Settings → Environment Variables**
3. Add variable:
   - **Name:** `REACT_APP_API_BASE_URL`
   - **Value:** `https://api.yourjobportal.com/api/v1`
   - **Environments:** Select Production, Preview, Development as needed
4. Click **Save**
5. Redeploy your application

**Note:** Vercel automatically rebuilds with new environment variables.

### Netlify

1. Go to **Site Settings → Build & Deploy → Environment**
2. Click **Edit Variables**
3. Add:
   - **Key:** `REACT_APP_API_BASE_URL`
   - **Value:** `https://api.yourjobportal.com/api/v1`
4. Click **Save**
5. Trigger a new deploy

### AWS Amplify

1. Go to **App Settings → Environment Variables**
2. Add variable:
   - **Variable name:** `REACT_APP_API_BASE_URL`
   - **Value:** `https://api.yourjobportal.com/api/v1`
3. Click **Save**
4. Redeploy

### Heroku

```bash
heroku config:set REACT_APP_API_BASE_URL=https://api.yourjobportal.com/api/v1 -a your-app-name
```

---

## Complete Build Process

### For Local Production Build

**Step 1: Create .env.production**

```env
REACT_APP_API_BASE_URL=https://api.yourjobportal.com/api/v1
```

**Step 2: Build**

```bash
cd C:\wamp64\www\jobprotal\admin-panel
npm run build
```

**Step 3: Test Locally (Optional)**

```bash
# Install serve if you haven't
npm install -g serve

# Serve the build folder
serve -s build
```

Open http://localhost:3000 and test with production API.

**Step 4: Deploy**

Upload everything in the `/build` folder to your web server:

```
build/
├── index.html
├── static/
│   ├── css/
│   ├── js/
│   └── media/
├── manifest.json
└── ...
```

---

## Verification

### Check Which API URL is Used

After building, you can verify the API URL:

**Method 1: Search in Build Files**

```bash
# Windows PowerShell
Select-String -Path "build/static/js/*.js" -Pattern "localhost:8000"

# Linux/Mac
grep -r "localhost:8000" build/static/js/
```

If you find "localhost:8000", you built with development settings!

**Method 2: Check in Browser**

1. Deploy and open the application
2. Open Developer Tools (F12)
3. Go to Console tab
4. Look for: `API Base URL: <your-url>`

---

## Common Issues & Solutions

### Issue 1: Production build still using localhost

**Cause:** `.env.production` not created or not read correctly

**Solution:**
```bash
# Verify .env.production exists
dir .env.production

# Delete old build
rmdir /s build

# Build again
npm run build
```

### Issue 2: Environment variables not updating

**Cause:** Old build cached

**Solution:**
```bash
# Clear build folder
rmdir /s build

# Clear npm cache
npm cache clean --force

# Reinstall and rebuild
npm install
npm run build
```

### Issue 3: Wrong API URL after deployment

**Cause:** Built with wrong environment file

**Solution:**
- Delete the build folder
- Ensure correct .env.production file exists
- Build again with: `npm run build`
- Verify the build before deploying

---

## Best Practices

### 1. Multiple Builds for Multiple Environments

Create separate builds for each environment:

```bash
# Build for staging
npm run build:staging
mv build build-staging

# Build for production
npm run build:production
mv build build-production
```

### 2. Use .env.local for Local Overrides

Create `.env.local` for local development without affecting git:

```env
# .env.local (not committed to git)
REACT_APP_API_BASE_URL=http://localhost:3001/api/v1
```

Priority order:
1. `.env.local` (highest priority, not committed)
2. `.env.production` or `.env.development`
3. `.env` (lowest priority)

### 3. Document Your URLs

Keep a reference of all your API URLs:

```
Development:  http://localhost:8000/api/v1
Staging:      https://staging-api.yourjobportal.com/api/v1
Production:   https://api.yourjobportal.com/api/v1
```

### 4. Verify Before Deployment

Always test the production build locally:

```bash
npm run build
serve -s build
# Test at http://localhost:3000
```

### 5. Git Configuration

Your `.gitignore` should include:

```gitignore
# Environment files with secrets
.env.local
.env.*.local

# But commit these:
# .env
# .env.example
# .env.production (if no secrets)
```

---

## Security Considerations

### What NOT to Put in Environment Variables

❌ **Never put these in React environment variables:**
- API Keys
- Secret Keys
- Database Passwords
- Private Tokens
- Sensitive Credentials

✅ **React environment variables are PUBLIC** - they're in the JavaScript bundle!

### What's Safe to Put

✅ **Safe to include:**
- API Base URLs
- Public Configuration
- Feature Flags
- Public API Keys (that are meant to be public)

### Handling Secrets

Secrets should be:
1. Stored on the backend only
2. Accessed via authenticated API calls
3. Never exposed to the frontend

---

## Quick Reference

### Development

```bash
npm start
# Uses .env or .env.development
```

### Production Build

```bash
npm run build
# Uses .env.production
```

### Test Production Build

```bash
serve -s build
```

### Deploy Build Folder

Upload `/build` contents to:
- Apache: `/var/www/html/`
- Nginx: `/usr/share/nginx/html/`
- Or your hosting platform

---

## Troubleshooting Commands

```bash
# Check if .env.production exists
dir .env.production

# View .env.production content
type .env.production

# Clean everything and rebuild
rmdir /s build
rmdir /s node_modules
npm install
npm run build

# Search for API URL in build
findstr /s "localhost" build\static\js\*.js
```

---

## Support

If you need help with production builds:

1. Verify `.env.production` exists and has correct URL
2. Delete `build` folder and rebuild
3. Check console in browser after deployment
4. Verify CORS is enabled on your production API

---

**Last Updated:** October 7, 2025
