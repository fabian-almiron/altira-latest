# 🔧 Deployment URL Fix

## What Changed?

The deployment system now uses **correct production URLs** instead of branch-specific deployment URLs:

### Before ❌
- **Live URL**: `fabian-portfolio-git-main-dev-strsdevcoms-projects.vercel.app` (branch-specific)
- **Dashboard**: `https://vercel.com/{accountId}/{projectName}` (sometimes 404)

### After ✅
- **Live URL**: `fabian-portfolio-iota.vercel.app` (production domain)
- **Dashboard**: `https://vercel.com/{projectName}` (always works)

---

## For New Deployments

All new deployments will automatically use the correct URLs. No action needed! 🎉

---

## For Existing Deployments

If you have existing deployments with incorrect URLs, run this fix:

### Option 1: Via Browser (Easiest)

1. Open your browser dev tools (F12)
2. Run this in the console:

```javascript
fetch('/api/deploy/fix-urls', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
  .then(r => r.json())
  .then(data => console.log('✅ Fixed:', data))
```

### Option 2: Via curl

```bash
curl -X POST http://localhost:3000/api/deploy/fix-urls \
  -H "Content-Type: application/json"
```

### Option 3: Via Your Code

```typescript
const response = await fetch('/api/deploy/fix-urls', {
  method: 'POST',
});

const result = await response.json();
console.log('Fixed deployments:', result.updatedCount);
```

---

## What the Fix Does

1. Finds all existing Vercel deployments in your database
2. Extracts the project name from existing URLs
3. Updates to correct format:
   - **Production URL**: `https://{projectName}.vercel.app`
   - **Dashboard URL**: `https://vercel.com/{projectName}`
4. Returns a summary of what was updated

---

## Response Example

```json
{
  "success": true,
  "message": "Successfully updated 3 deployment URLs",
  "totalChecked": 5,
  "updatedCount": 3,
  "updates": [
    {
      "chatId": "abc123",
      "oldUrls": {
        "deployment": "https://project-git-main-user.vercel.app",
        "project": "https://vercel.com/team123/project"
      },
      "newUrls": {
        "deployment": "https://project.vercel.app",
        "project": "https://vercel.com/project"
      }
    }
  ]
}
```

---

## Notes

- ✅ Safe to run multiple times (idempotent)
- ✅ Only updates URLs that need fixing
- ✅ Preserves all other deployment data
- ✅ Requires authentication
- ✅ Automatically extracts project names from existing data

---

## Troubleshooting

### "Could not determine project name"
This means the deployment doesn't have enough information. Check:
- Is `github_repo_name` set?
- Is `vercel_deployment_url` in the correct format?

### "Authentication required"
Make sure you're signed in to your account.

### No deployments updated
This is normal if:
- You have no existing deployments
- All URLs are already in the correct format

---

## Technical Details

The fix endpoint is located at:
```
/app/api/deploy/fix-urls/route.ts
```

It updates the `chat_ownership` table:
- `vercel_deployment_url` → Production domain
- `vercel_project_url` → Dashboard URL

The changes will be reflected immediately in:
- Dashboard deployment info
- "View Live" buttons
- "Dashboard" buttons

