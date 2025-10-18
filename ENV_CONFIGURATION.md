# Environment Configuration

## Overview

The admin panel uses environment variables to configure the API connection. This allows you to easily switch between development, staging, and production environments.

## Setup

### 1. Create Environment File

Copy the example file to create your `.env` file:

```bash
cp .env.example .env
```

Or manually create `.env` in the root of the admin-panel directory.

### 2. Configure API URL

Edit the `.env` file and set your API base URL:

```env
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
```

## Environment Variables

### `REACT_APP_API_BASE_URL`

**Description:** The base URL for the Job Portal API

**Required:** Yes (but has a fallback to `http://localhost:8000/api/v1`)

**Examples:**

- **Development:**
  ```env
  REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
  ```

- **Production:**
  ```env
  REACT_APP_API_BASE_URL=https://api.yourjobportal.com/api/v1
  ```

- **Staging:**
  ```env
  REACT_APP_API_BASE_URL=https://staging-api.yourjobportal.com/api/v1
  ```

## Important Notes

### 1. REACT_APP_ Prefix
All custom environment variables in Create React App **must** start with `REACT_APP_` to be accessible in the application.

### 2. Restart Required
After changing environment variables, you **must restart** the development server:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm start
```

### 3. Build-Time Variables
Environment variables are embedded into the build at **build time**, not runtime. This means:

- For production builds, set the variables before running `npm run build`
- Changes to `.env` won't affect already-built production files
- You need to rebuild for changes to take effect in production

### 4. .env File Priority

Create React App supports multiple environment files with the following priority:

1. `.env.local` - Loaded for all environments, but ignored by git
2. `.env.development` - Loaded in development only
3. `.env.production` - Loaded in production only
4. `.env` - Loaded for all environments

**Recommendation:** Use `.env` for local development and set production variables in your hosting platform (Vercel, Netlify, etc.).

## Production Deployment

### Option 1: Environment Variables on Hosting Platform

Most hosting platforms (Vercel, Netlify, Heroku, etc.) allow you to set environment variables through their dashboard:

**Vercel:**
1. Go to Project Settings → Environment Variables
2. Add: `REACT_APP_API_BASE_URL` = `https://api.yourjobportal.com/api/v1`
3. Redeploy

**Netlify:**
1. Go to Site Settings → Environment Variables
2. Add: `REACT_APP_API_BASE_URL` = `https://api.yourjobportal.com/api/v1`
3. Redeploy

### Option 2: .env.production File

Create a `.env.production` file:

```env
REACT_APP_API_BASE_URL=https://api.yourjobportal.com/api/v1
```

Then build:

```bash
npm run build
```

## Debugging

### Check Current API URL

The application logs the API URL to the browser console in development mode. Open DevTools and look for:

```
API Base URL: http://localhost:8000/api/v1
```

### Common Issues

**Problem:** API calls failing after deployment
**Solution:** Verify the environment variable is set correctly on your hosting platform

**Problem:** Changes to .env not taking effect
**Solution:** Restart the development server (`Ctrl+C` then `npm start`)

**Problem:** CORS errors
**Solution:** Ensure your backend API allows requests from your frontend domain

## Security Notes

### DO NOT commit .env files

The `.env` file contains environment-specific configuration and should **never** be committed to Git.

✅ **Committed:**
- `.env.example` - Template file (safe to commit)

❌ **Not Committed:**
- `.env` - Your actual configuration
- `.env.local` - Local overrides
- `.env.production` - Production config (if used)

### Sensitive Data

While the API URL itself is not sensitive, follow these best practices:

1. **Never** put API keys, secrets, or passwords in environment variables in React apps
2. React environment variables are **public** - they're embedded in the JavaScript bundle
3. All authentication should be handled through secure HTTP-only cookies or tokens
4. Sensitive operations should always be validated on the backend

## Example Configurations

### Development Team Setup

```env
# Developer 1 (local backend)
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1

# Developer 2 (using shared dev server)
REACT_APP_API_BASE_URL=https://dev-api.jobportal.com/api/v1

# Developer 3 (custom port)
REACT_APP_API_BASE_URL=http://localhost:3001/api/v1
```

### Multi-Environment Setup

**Development (.env.development):**
```env
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
```

**Staging (.env.staging):**
```env
REACT_APP_API_BASE_URL=https://staging-api.jobportal.com/api/v1
```

**Production (.env.production):**
```env
REACT_APP_API_BASE_URL=https://api.jobportal.com/api/v1
```

## Testing the Configuration

After setting up your environment:

1. Start the development server:
   ```bash
   npm start
   ```

2. Open browser DevTools (F12)

3. Check the console for: `API Base URL: <your-url>`

4. Try logging in to verify API connectivity

## Support

If you encounter issues with environment configuration:

1. Verify the `.env` file exists in the root directory (next to `package.json`)
2. Ensure the variable name starts with `REACT_APP_`
3. Restart the development server
4. Check the browser console for the logged API URL
5. Verify the backend API is accessible at the configured URL

---

**Last Updated:** October 7, 2025
