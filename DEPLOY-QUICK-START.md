# 🚀 Quick Start: Deploy to Production

Get your v0 code live in 3 minutes with GitHub + Vercel!

---

## ⚡ Quick Setup (5 minutes)

### Step 1: Get Your Tokens

#### GitHub Token (30 seconds)
1. Go to https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Check ✅ `repo`
4. Generate and copy the token

#### Vercel Token (30 seconds)
1. Go to https://vercel.com/account/tokens
2. Click **"Create Token"**
3. Copy the token

#### Connect GitHub to Vercel (1 minute)
1. Go to https://vercel.com/dashboard
2. Settings → Git Integrations
3. Connect GitHub
4. Authorize access

### Step 2: Add to `.env.local`

```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VERCEL_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Deploy!

```javascript
// From your app
const response = await fetch('/api/deploy/github-vercel', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chatId: 'your-chat-id',
    repoName: 'my-awesome-app',
    isPrivate: true
  })
})

const result = await response.json()
console.log(result.deployment.deploymentUrl)
// → https://my-awesome-app-xxxxx.vercel.app
```

**Done!** Your app is live on Vercel and backed by GitHub! 🎉

---

## 🎯 What You Get

After deployment:

✅ **GitHub Repository**
- Full source code
- Version control
- Team collaboration

✅ **Live on Vercel**
- Production URL
- SSL certificate
- Global CDN
- Auto-scaling

✅ **Continuous Deployment**
- Push to GitHub → Auto-deploys
- Preview deployments for PRs
- Instant rollbacks

---

## 📦 Example Response

```json
{
  "success": true,
  "repository": {
    "url": "https://github.com/username/my-awesome-app"
  },
  "deployment": {
    "deploymentUrl": "https://my-awesome-app-xxxxx.vercel.app"
  }
}
```

Visit the `deploymentUrl` to see your live site!

---

## 🔄 Make Changes

```bash
# Clone your repo
git clone https://github.com/username/my-awesome-app.git
cd my-awesome-app

# Install dependencies
npm install

# Run locally
npm run dev
# → http://localhost:3000

# Make changes...
# Edit app/page.tsx

# Deploy changes
git add .
git commit -m "Update homepage"
git push

# 🚀 Vercel auto-deploys in ~1-2 minutes!
```

---

## 🎨 Add Custom Domain

1. Go to https://vercel.com
2. Select your project
3. Settings → Domains
4. Add `yourdomain.com`
5. Configure DNS
6. Done! SSL auto-generated

---

## 🛠️ Deployment Options

### Option 1: GitHub + Vercel (Recommended) ✅

```javascript
POST /api/deploy/github-vercel
```

**Best for**: Production apps, team projects

**Pros**:
- ✅ Version control
- ✅ Auto-deploys
- ✅ Easy rollbacks
- ✅ Team collaboration

### Option 2: GitHub Export Only

```javascript
POST /api/export/github
```

**Best for**: Just getting code, manual deployment

**Pros**:
- ✅ Source code on GitHub
- ✅ Full control
- ❌ Manual Vercel setup

### Option 3: v0 SDK Deploy

```javascript
POST /api/deploy
```

**Best for**: Quick previews

**Pros**:
- ✅ One-click
- ❌ No version control
- ❌ Limited to v0 platform

---

## 🐛 Troubleshooting

### Deployment Failed?

**Check:**
1. Tokens in `.env.local`
2. GitHub connected to Vercel
3. Repository name doesn't exist

**View Logs:**
- GitHub: Check repo exists
- Vercel: Dashboard → Deployments → View logs

### Fonts Not Working?

**Don't worry!** Our system automatically:
- ✅ Detects fonts v0 uses
- ✅ Fixes import issues
- ✅ Adds fallbacks

### Build Errors?

**Common fixes:**
- Update dependencies: `npm install`
- Clear cache: `rm -rf .next`
- Check Node version: `node -v` (need 18+)

---

## 📊 Monitoring

### Check Deployment Status

```javascript
// Response includes inspector URL
{
  "deployment": {
    "inspectorUrl": "https://vercel.com/username/project/dpl_xxx",
    "readyState": "BUILDING" // or "READY", "ERROR"
  }
}
```

### Deployment States

1. **BUILDING** → Wait 1-2 minutes
2. **READY** → Live!
3. **ERROR** → Check logs in inspector

---

## 🎓 Learn More

- **Full docs**: See `GITHUB-VERCEL-DEPLOY.md`
- **GitHub API**: https://docs.github.com/en/rest
- **Vercel API**: https://vercel.com/docs/rest-api
- **Next.js**: https://nextjs.org/docs

---

## ⚡ TL;DR

```bash
# 1. Get tokens
# GitHub: https://github.com/settings/tokens
# Vercel: https://vercel.com/account/tokens

# 2. Add to .env.local
GITHUB_TOKEN=ghp_xxx
VERCEL_TOKEN=xxx

# 3. Connect GitHub to Vercel
# https://vercel.com/dashboard → Settings → Git

# 4. Deploy via API
POST /api/deploy/github-vercel
{
  "chatId": "abc123",
  "repoName": "my-app"
}

# 5. Visit your live site! 🎉
```

**That's it!** Your app is live with version control and continuous deployment! 🚀

