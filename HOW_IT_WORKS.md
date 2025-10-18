# How Environment Variables Work

## Simple Explanation

Your admin panel now automatically uses the correct API URL based on the command you run:

### Development (Dev Server)
```bash
npm start
```
**Uses:** `.env` → `http://localhost:8000/api/v1`

### Production (Build)
```bash
npm run build
```
**Uses:** `.env.production` → `https://api.yourjobportal.com/api/v1`

---

## How It Works Automatically

Create React App has built-in logic:

1. **When you run `npm start`:**
   - Looks for `.env.development` first
   - If not found, uses `.env`
   - Result: Your local API URL is used

2. **When you run `npm run build`:**
   - Looks for `.env.production` first
   - If not found, uses `.env`
   - Result: Your production API URL is embedded in the build

---

## Your Current Setup

### File Structure
```
admin-panel/
├── .env                 # Development: http://localhost:8000/api/v1
├── .env.production      # Production: https://api.yourjobportal.com/api/v1
└── .env.example         # Template for others
```

### What Happens

**Development:**
```bash
npm start
# ✅ Uses .env
# ✅ API calls go to: http://localhost:8000/api/v1
# ✅ Server runs at: http://localhost:3000
```

**Production Build:**
```bash
npm run build
# ✅ Uses .env.production
# ✅ API URL embedded: https://api.yourjobportal.com/api/v1
# ✅ Creates: /build folder ready to deploy
```

---

## No Extra Configuration Needed!

You don't need to:
- ❌ Change any code
- ❌ Install extra packages
- ❌ Add build scripts
- ❌ Manually switch URLs

It just works automatically! ✅

---

## Testing

### Test Development
```bash
npm start
```
Open http://localhost:3000 and check browser console:
```
API Base URL: http://localhost:8000/api/v1
```

### Test Production Build
```bash
npm run build
npx serve -s build
```
Open http://localhost:3000 and check browser console:
```
API Base URL: https://api.yourjobportal.com/api/v1
```

---

## Changing API URLs

### Change Development URL
Edit `.env`:
```env
REACT_APP_API_BASE_URL=http://localhost:3001/api/v1
```
Restart dev server: `Ctrl+C` then `npm start`

### Change Production URL
Edit `.env.production`:
```env
REACT_APP_API_BASE_URL=https://new-api.yourjobportal.com/api/v1
```
Rebuild: `npm run build`

---

## Priority Order

If multiple env files exist, Create React App uses this priority:

**Development (`npm start`):**
1. `.env.development.local` (highest)
2. `.env.local`
3. `.env.development`
4. `.env` (lowest)

**Production (`npm run build`):**
1. `.env.production.local` (highest)
2. `.env.local`
3. `.env.production`
4. `.env` (lowest)

---

## Summary

✅ **Development:** Uses `.env` automatically
✅ **Production:** Uses `.env.production` automatically
✅ **No manual switching needed**
✅ **Just works!**

---

## Quick Commands Reference

| Command | Environment | API URL Source |
|---------|-------------|----------------|
| `npm start` | Development | `.env` |
| `npm run build` | Production | `.env.production` |
| `npm test` | Test | `.env.test` |

---

**Last Updated:** October 7, 2025
