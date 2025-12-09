# 🔑 Vercel Token Setup Guide

## ✨ You Have Vercel API Access!

Since you have a `VERCEL_OIDC_TOKEN`, you can enable **direct Vercel deployments**!

---

## 🚀 Quick Setup (2 Minutes)

### Step 1: Get Your Vercel Token

1. Go to https://vercel.com/account/tokens
2. Click **"Create Token"**
3. Name it: `v0-clone-deployment`
4. Set scope: **Full Account** (or specific team)
5. Click **"Create"**
6. **Copy the token** (you'll only see it once!)

### Step 2: Add to Environment Variables

Add this line to your `.env.local` file:

```bash
# Vercel API Token for direct deployments
VERCEL_TOKEN=your_vercel_token_here
```

### Step 3: Restart Your Dev Server

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

### Step 4: Test It!

1. Generate a page in your v0 clone
2. Click "Deploy to Vercel"
3. Select **"Direct Vercel API"** method
4. Click **"Deploy Now"**
5. Done! 🎉

---

## 🎯 What This Enables

### Before (Without Token)
- ❌ Must use v0's deployment system
- ❌ Requires Vercel connected on v0.dev
- ❌ Limited control

### After (With Token)
- ✅ Deploy directly from your v0 clone
- ✅ No v0 integration needed
- ✅ Full control over deployments
- ✅ Custom project names
- ✅ Deploy to specific teams
- ✅ Faster deployment process

---

## 🔧 Configuration Options

### Basic Setup (Minimum)
```bash
VERCEL_TOKEN=your_token_here
```

### Advanced Setup (Recommended)
```bash
# Vercel API Token
VERCEL_TOKEN=your_token_here

# Optional: Deploy to a specific team
VERCEL_TEAM_ID=team_xxxxxxxxxxxxx

# Optional: Default project name prefix
VERCEL_PROJECT_PREFIX=v0-
```

---

## 🎨 Two Deployment Methods

Your v0 clone now supports **TWO** deployment methods:

### Method 1: Via v0 API
- **Endpoint:** `POST /api/deploy`
- **Requires:** Vercel connected on v0.dev
- **Best for:** Production deployments
- **Pros:** Full code deployment, proper build process
- **Cons:** Requires v0 integration setup

### Method 2: Direct Vercel API ⚡ NEW!
- **Endpoint:** `POST /api/deploy/vercel-direct`
- **Requires:** VERCEL_TOKEN in .env.local
- **Best for:** Quick deployments, full control
- **Pros:** Fast, no v0 integration needed, full control
- **Cons:** Currently creates redirect to v0's hosted version

---

## 💡 Usage Examples

### Via UI (Easiest)

1. Click "Deploy to Vercel" button
2. Choose deployment method:
   - **"Via v0 (Recommended)"** - Uses v0's system
   - **"Direct Vercel API"** - Uses your token
3. Enter project name (optional)
4. Click "Deploy Now"

### Via API (Programmatic)

```typescript
// Direct Vercel deployment
const response = await fetch('/api/deploy/vercel-direct', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    chatId: 'your_chat_id',
    projectName: 'my-awesome-app',
  }),
});

const data = await response.json();
console.log('Deployed to:', data.deployment.vercelUrl);
```

---

## 🔐 Security Best Practices

### ✅ DO:
- Store token in `.env.local` (gitignored)
- Use environment-specific tokens
- Rotate tokens regularly
- Limit token permissions when possible
- Use team tokens for team deployments

### ❌ DON'T:
- Commit tokens to git
- Share tokens publicly
- Use production tokens in development
- Give tokens more permissions than needed

---

## 🐛 Troubleshooting

### Error: "Vercel token not configured"
**Solution:** Add `VERCEL_TOKEN` to `.env.local`
```bash
VERCEL_TOKEN=your_token_here
```

### Error: "Invalid token"
**Solution:** 
1. Check token is correct (no extra spaces)
2. Token might be expired - create a new one
3. Ensure token has deployment permissions

### Error: "Project already exists"
**Solution:** 
- Use a different project name
- Or deploy to existing project

### Deployment succeeds but doesn't work
**Current Limitation:** Direct API creates a redirect to v0's hosted version

**Better Solution:**
1. Export code from v0.dev
2. Push to GitHub
3. Deploy from GitHub to Vercel

**OR** use Method 1 (via v0 API) for full code deployment

---

## 🎯 Comparison Table

| Feature | Via v0 API | Direct Vercel API |
|---------|-----------|-------------------|
| **Setup** | Connect Vercel on v0.dev | Add VERCEL_TOKEN |
| **Speed** | Moderate | Fast |
| **Control** | Limited | Full |
| **Code Deployment** | ✅ Full | ⚠️ Redirect only* |
| **Custom Domains** | ❌ | ✅ |
| **Env Variables** | ❌ | ✅ |
| **Team Deployments** | ✅ | ✅ |
| **Best For** | Production | Quick tests |

*Currently creates redirect; full code deployment coming soon

---

## 🚀 Advanced Features (Coming Soon)

With your Vercel token, we can add:

### 1. Custom Domains
```typescript
// Add custom domain after deployment
await addCustomDomain(deploymentId, 'myapp.com');
```

### 2. Environment Variables
```typescript
// Set env vars for deployment
await setEnvVars(projectId, {
  API_KEY: 'secret',
  DATABASE_URL: 'postgres://...',
});
```

### 3. Deployment History
```typescript
// List all deployments
const deployments = await listDeployments(projectId);
```

### 4. Rollback
```typescript
// Rollback to previous deployment
await rollback(projectId, previousDeploymentId);
```

---

## 📚 Resources

- **Vercel API Docs:** https://vercel.com/docs/rest-api
- **Token Management:** https://vercel.com/account/tokens
- **Deployment API:** https://vercel.com/docs/rest-api/endpoints/deployments
- **v0 SDK Docs:** https://v0.dev/docs/api/platform

---

## 🎉 You're All Set!

With your Vercel token configured, you now have **supercharged deployment capabilities**!

**Next Steps:**
1. ✅ Add `VERCEL_TOKEN` to `.env.local`
2. ✅ Restart dev server
3. ✅ Generate a test page
4. ✅ Try deploying with "Direct Vercel API" method
5. ✅ Enjoy instant deployments! 🚀

---

**Questions?** Check `VERCEL-DIRECT-DEPLOY.md` for detailed documentation!

