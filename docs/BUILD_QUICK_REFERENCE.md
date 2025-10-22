# Production Build - Quick Reference

## TL;DR - Quick Commands

### Build for Production

```bash
# Step 1: Create production environment file
# Create file: .env.production
REACT_APP_API_BASE_URL=https://api.yourjobportal.com/api/v1

# Step 2: Build
npm run build

# Step 3: Test locally (optional)
npx serve -s build

# Step 4: Deploy
# Upload /build folder to your web server
```

---

## Environment Files Priority

1. `.env.local` (local overrides, not in git)
2. `.env.production` (production builds)
3. `.env.development` (development)
4. `.env` (default)

---

## Quick Setup

### Development

```bash
# Already configured in .env
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1

npm start
```

### Production

```bash
# Create .env.production
echo REACT_APP_API_BASE_URL=https://api.yourjobportal.com/api/v1 > .env.production

# Build
npm run build

# Result: /build folder ready to deploy
```

---

## Common Commands

```bash
# Start development server
npm start

# Build for production (uses .env.production)
npm run build

# Test production build locally
npx serve -s build

# Clean build
rmdir /s build
npm run build
```

---

## Verify Production Build

```bash
# Check API URL in build files
findstr /s "localhost:8000" build\static\js\*.js

# If found = Wrong! You're using dev URL
# If not found = Good! Using production URL
```

---

## Different API URLs

```bash
# Development
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1

# Staging
REACT_APP_API_BASE_URL=https://staging-api.yourjobportal.com/api/v1

# Production
REACT_APP_API_BASE_URL=https://api.yourjobportal.com/api/v1
```

---

## Hosting Platforms

### Vercel / Netlify / Amplify

Set in platform dashboard:
- **Variable:** `REACT_APP_API_BASE_URL`
- **Value:** `https://api.yourjobportal.com/api/v1`
- Redeploy

### Apache / Nginx

```bash
# Build locally
npm run build

# Upload /build contents to server
scp -r build/* user@server:/var/www/html/
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Still using localhost URL | Delete `/build`, create `.env.production`, rebuild |
| CORS errors | Enable CORS on your production API |
| 404 on refresh | Configure server redirects (see docs) |
| Changes not applied | Clear build folder and rebuild |

---

## File Structure

```
admin-panel/
├── .env                    # Development (committed)
├── .env.production         # Production (create this)
├── .env.example           # Template (committed)
├── build/                 # Production build (deploy this)
│   ├── index.html
│   └── static/
└── src/
```

---

## Important Notes

⚠️ **Build Time Variables**: Environment variables are embedded during build, not at runtime

⚠️ **Rebuild Required**: Changes to `.env.production` require rebuilding

⚠️ **Public Variables**: All `REACT_APP_*` variables are PUBLIC in the JavaScript bundle

⚠️ **No Secrets**: Never put API keys, passwords, or secrets in React environment variables

---

## Production Checklist

- [ ] Create `.env.production` with production API URL
- [ ] Run `npm run build`
- [ ] Test build locally with `npx serve -s build`
- [ ] Verify API URL (check browser console)
- [ ] Verify CORS is enabled on production API
- [ ] Upload `/build` folder contents to server
- [ ] Test login and functionality
- [ ] Monitor for errors in browser console

---

For detailed documentation, see:
- `PRODUCTION_BUILD_GUIDE.md` - Complete guide
- `ENV_CONFIGURATION.md` - Environment setup

**Last Updated:** October 7, 2025
