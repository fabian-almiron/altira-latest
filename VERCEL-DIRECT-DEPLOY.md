# 🎯 Direct Vercel Deployment with Your API Token

## 🔑 You Have Vercel API Access!

Since you have a Vercel token, you can deploy **directly to Vercel** without needing v0's integration!

---

## ⚡ Two Deployment Methods

### Method 1: Via v0 API (Recommended for Most Users)
- Uses v0's built-in deployment
- Requires Vercel connected on v0.dev
- Endpoint: `POST /api/deploy`

### Method 2: Direct Vercel API (Your Power Option!)
- Uses YOUR Vercel token
- No v0 integration needed
- Full control
- Endpoint: `POST /api/deploy/vercel-direct`

---

## 🔧 Setup for Direct Deployment

### 1. Add Vercel Token to Environment

You already have `VERCEL_OIDC_TOKEN`, but for the Vercel API, you need:

```bash
# .env.local
VERCEL_TOKEN=your_vercel_token_here
```

**Get your Vercel token:**
1. Go to https://vercel.com/account/tokens
2. Create a new token
3. Copy and add to `.env.local`

### 2. Optional: Add Team ID

If deploying to a team:

```bash
VERCEL_TEAM_ID=team_xxxxxxxxxxxxx
```

---

## 🚀 How to Use Direct Deployment

### Via API

```typescript
const response = await fetch('/api/deploy/vercel-direct', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    chatId: 'your_chat_id',
    projectName: 'my-awesome-app', // Optional
    teamId: 'team_xxxxx', // Optional
  }),
});

const data = await response.json();
console.log('Deployed to:', data.deployment.vercelUrl);
```

### Response

```json
{
  "success": true,
  "deployment": {
    "id": "dpl_xxxxx",
    "url": "my-app-xxxxx.vercel.app",
    "inspectorUrl": "https://vercel.com/...",
    "status": "READY",
    "vercelUrl": "https://my-app-xxxxx.vercel.app"
  },
  "message": "Deployment created successfully on Vercel"
}
```

---

## 🎨 Important Note About Code Access

**Challenge:** The v0 API provides a `demo` URL (hosted preview), but not the actual source code files.

**Current Solution:**
The direct deployment creates a redirect to v0's hosted version. This works but isn't ideal.

**Better Approach:**
1. Export code from v0.dev first
2. Upload to GitHub
3. Deploy from GitHub to Vercel

**OR:**

Use v0's deployment API (Method 1) which handles this automatically!

---

## 🔄 Recommended Workflow

### For Quick Previews
Use **Direct Vercel API** (`/api/deploy/vercel-direct`):
- Fast
- Full control
- Uses your Vercel quota

### For Production Deployments
Use **v0 API** (`/api/deploy`):
- Proper code deployment
- Handles all file management
- Integrated with v0's system

---

## 💡 Enhanced Features You Can Add

With direct Vercel API access, you can:

### 1. **Custom Domains**
```typescript
// Add custom domain to deployment
await fetch(`https://api.vercel.com/v9/projects/${projectId}/domains`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${VERCEL_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'myapp.com',
  }),
});
```

### 2. **Environment Variables**
```typescript
// Set environment variables
await fetch(`https://api.vercel.com/v10/projects/${projectId}/env`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${VERCEL_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    key: 'API_KEY',
    value: 'secret_value',
    type: 'encrypted',
    target: ['production'],
  }),
});
```

### 3. **Deployment Status**
```typescript
// Check deployment status
const status = await fetch(
  `https://api.vercel.com/v13/deployments/${deploymentId}`,
  {
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
    },
  },
);
```

### 4. **List Deployments**
```typescript
// Get all deployments
const deployments = await fetch(
  `https://api.vercel.com/v6/deployments?projectId=${projectId}`,
  {
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
    },
  },
);
```

---

## 🎯 Best Practices

### Security
- ✅ Keep `VERCEL_TOKEN` in `.env.local` (never commit!)
- ✅ Use environment-specific tokens
- ✅ Rotate tokens regularly
- ✅ Limit token permissions if possible

### Deployment Strategy
1. **Development:** Use v0's hosted preview
2. **Staging:** Deploy to Vercel preview
3. **Production:** Deploy to Vercel production with custom domain

### Error Handling
```typescript
try {
  const res = await fetch('/api/deploy/vercel-direct', {
    method: 'POST',
    body: JSON.stringify({ chatId }),
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    // Handle specific errors
    if (data.error === 'Vercel token not configured') {
      alert('Please add VERCEL_TOKEN to .env.local');
    } else {
      alert(`Deployment failed: ${data.details}`);
    }
  } else {
    // Success!
    window.open(data.deployment.vercelUrl, '_blank');
  }
} catch (error) {
  console.error('Deployment error:', error);
}
```

---

## 🔗 Vercel API Resources

- **API Docs:** https://vercel.com/docs/rest-api
- **Deployments:** https://vercel.com/docs/rest-api/endpoints/deployments
- **Projects:** https://vercel.com/docs/rest-api/endpoints/projects
- **Domains:** https://vercel.com/docs/rest-api/endpoints/domains
- **Tokens:** https://vercel.com/account/tokens

---

## 🚧 Limitations & Workarounds

### Limitation 1: No Source Code from v0 API
**Problem:** v0 API returns demo URL, not source files

**Workarounds:**
1. Use v0's deployment API (Method 1)
2. Export from v0.dev → GitHub → Vercel
3. Create redirect deployment (current implementation)

### Limitation 2: Rate Limits
**Problem:** Vercel API has rate limits

**Solution:**
- Cache deployment status
- Implement retry logic
- Use webhooks for status updates

### Limitation 3: Build Configuration
**Problem:** Can't customize build settings via simple API

**Solution:**
- Include `vercel.json` in deployment
- Use project settings API
- Pre-configure projects on Vercel dashboard

---

## 🎉 What You Can Build

With direct Vercel API access, you can create:

1. **Automated CI/CD Pipeline**
   - Deploy on every chat completion
   - Run tests before deployment
   - Rollback on failures

2. **Multi-Environment Deployments**
   - Dev, staging, production
   - Preview deployments for each chat
   - A/B testing setups

3. **Team Collaboration**
   - Deploy to team projects
   - Shared deployment history
   - Access control

4. **Custom Workflows**
   - Slack notifications on deploy
   - Deployment approval process
   - Automated domain assignment

---

## 🔄 Migration Path

### Current State
- v0 generates code
- Hosted on v0's servers
- Preview available immediately

### With Direct Vercel API
- v0 generates code
- **You deploy to YOUR Vercel account**
- Full control over hosting
- Custom domains, env vars, etc.

### Future Enhancement
- Extract source code from v0
- Deploy actual files to Vercel
- Full production-ready deployments

---

**Your Vercel API access gives you superpowers! 🚀**

Use Method 1 (`/api/deploy`) for simplicity, or Method 2 (`/api/deploy/vercel-direct`) for full control!

