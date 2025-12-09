# 🚀 Deploy to Vercel via v0 API

## ✨ New Feature: Programmatic Deployment!

Your v0 clone now supports **deploying generated pages directly to Vercel** through the v0 API!

---

## 🎯 How to Deploy Your Generated Pages

### Method 1: Via v0.dev (Recommended for First-Time Setup)

1. **Connect Vercel Integration**
   - Go to https://v0.dev/settings/integrations
   - Click "Connect" next to Vercel
   - Authorize v0 to access your Vercel account

2. **Deploy from v0.dev**
   - Click the **⋯ menu** next to your chat
   - Select **"Deploy to Vercel"**
   - Or visit: `https://v0.dev/chat/YOUR_CHAT_ID/deploy`

3. **Configure & Deploy**
   - Choose or create a Vercel project
   - Click "Deploy"
   - Your app goes live in minutes!

### Method 2: Programmatic Deployment (Advanced)

Use the v0 API to deploy programmatically from your v0 clone:

```typescript
// Example: Deploy via API
const response = await fetch('/api/deploy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    chatId: 'your_chat_id',
    projectId: 'optional_project_id', // Optional
    versionId: 'optional_version_id', // Optional
  }),
});

const data = await response.json();
console.log('Deployment:', data.deployment);
```

---

## 🔧 API Endpoints

### 1. Create Deployment

**POST** `/api/deploy`

Triggers a deployment to Vercel for a specific chat.

**Request Body:**
```json
{
  "chatId": "string (required)",
  "projectId": "string (optional)",
  "versionId": "string (optional)"
}
```

**Response (Success):**
```json
{
  "success": true,
  "deployment": {
    "id": "deployment_id",
    "url": "https://your-app.vercel.app",
    "inspectorUrl": "https://vercel.com/...",
    "status": "building"
  },
  "message": "Deployment initiated successfully"
}
```

**Response (Error):**
```json
{
  "error": "Vercel integration not configured",
  "details": "Please link your Vercel account on v0.dev first"
}
```

### 2. Link Vercel Project

**POST** `/api/deploy/link-vercel`

Links a v0 project to a new Vercel project.

**Request Body:**
```json
{
  "projectId": "string (required)",
  "name": "string (required)"
}
```

---

## 🎨 UI Features Added

### 1. **Deploy Button in Chat Menu**
- Click **⋯** next to chat name
- Select **"Deploy to Vercel"**
- Opens v0.dev deploy page

### 2. **Export Hint with Deploy**
- Blue notification box after generation
- **"Export Code"** button
- **"Deploy"** button - NEW!
- Dismissible per chat

### 3. **Deploy Button Component** (Optional)
- Reusable `<DeployButton>` component
- Can be added anywhere in your UI
- Handles deployment flow with dialog

---

## 📋 Prerequisites

Before deploying, ensure:

1. ✅ **Vercel Account Connected**
   - Go to https://v0.dev/settings/integrations
   - Connect your Vercel account

2. ✅ **Valid V0_API_KEY**
   - Must have deployment permissions
   - Get from https://v0.dev/chat/settings/keys

3. ✅ **Chat Saved on v0.dev**
   - Chat must exist in your v0 account
   - Not just local-only chats

4. ✅ **Authentication** (for programmatic deployment)
   - Must be signed in
   - Must own the chat you're deploying

---

## 🔐 Security & Permissions

### Ownership Validation
The API checks that:
- User is authenticated (for programmatic deployment)
- User owns the chat being deployed
- Returns 403 Forbidden if ownership check fails

### Anonymous Users
- Can deploy via v0.dev (after signing in there)
- Cannot use programmatic API deployment
- Must create an account first

---

## 🌐 Deployment Flow

```
1. User clicks "Deploy to Vercel"
   ↓
2. API validates ownership
   ↓
3. Calls v0.deployments.create()
   ↓
4. v0 API creates deployment on Vercel
   ↓
5. Returns deployment URL & status
   ↓
6. User can monitor on v0.dev or Vercel dashboard
```

---

## 💡 Usage Examples

### Example 1: Deploy from Chat Menu
```
1. Generate a page in your v0 clone
2. Click ⋯ menu next to chat name
3. Select "Deploy to Vercel"
4. Opens v0.dev deploy page
5. Click "Deploy" on v0.dev
6. Done! Your app is live
```

### Example 2: Programmatic Deployment
```typescript
// In your custom component
import { useState } from 'react';

function MyDeployButton({ chatId }: { chatId: string }) {
  const [deploying, setDeploying] = useState(false);

  const handleDeploy = async () => {
    setDeploying(true);
    
    try {
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert(`Deployed! Visit: ${data.deployment.url}`);
      } else {
        alert(`Error: ${data.error}`);
      }
    } finally {
      setDeploying(false);
    }
  };

  return (
    <button onClick={handleDeploy} disabled={deploying}>
      {deploying ? 'Deploying...' : 'Deploy to Vercel'}
    </button>
  );
}
```

### Example 3: Link New Vercel Project
```typescript
// Link a v0 project to Vercel
const response = await fetch('/api/deploy/link-vercel', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: 'your_v0_project_id',
    name: 'my-awesome-app',
  }),
});

const data = await response.json();
console.log('Linked project:', data.project);
```

---

## 🐛 Troubleshooting

### Error: "Vercel integration not configured"
**Solution:** Connect your Vercel account on v0.dev
1. Go to https://v0.dev/settings/integrations
2. Click "Connect" for Vercel
3. Authorize the integration
4. Try deploying again

### Error: "You do not have permission to deploy this chat"
**Solution:** Sign in with the account that created the chat
- Only the chat owner can deploy
- Check you're signed in to the correct account

### Error: "Chat ID is required"
**Solution:** Ensure you're passing a valid chat ID
```typescript
// ✅ Correct
{ chatId: "abc123xyz" }

// ❌ Wrong
{ chatId: "" }
{ chatId: null }
```

### Deployment succeeds but app doesn't work
**Solution:** Check deployment logs on Vercel
1. Go to https://vercel.com/dashboard
2. Find your project
3. Click on the deployment
4. Check build logs for errors

---

## 📚 Additional Resources

- **v0 API Docs:** https://v0.dev/docs/api/platform/reference/deployments/create
- **v0 SDK:** https://github.com/vercel/v0-sdk
- **Vercel Docs:** https://vercel.com/docs
- **v0 Integrations:** https://v0.dev/settings/integrations

---

## 🎉 What's Next?

Now that you can deploy programmatically, you can:

1. **Automate Deployments**
   - Deploy on every chat completion
   - Create CI/CD workflows
   - Batch deploy multiple chats

2. **Custom Workflows**
   - Add approval steps
   - Integrate with your tools
   - Build deployment dashboards

3. **Team Collaboration**
   - Share deployment links
   - Track deployment history
   - Manage multiple projects

---

**Happy Deploying! 🚀**

