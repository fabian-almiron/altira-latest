# Delete Functionality - Complete Cleanup

## 🗑️ Overview

When you delete a website/chat from the **Clients** page, the system now performs a **complete cleanup** across all platforms:

---

## ✅ What Gets Deleted

### 1. **v0.dev Account** ⭐ NEW!
- ✅ Chat is deleted from your v0.dev account
- ✅ All messages and conversation history removed
- ✅ Generated code and files removed from v0

### 2. **GitHub Repository** (if deployed)
- ✅ Repository deleted from GitHub
- ✅ Works for both personal and organization repos
- ✅ All code, commits, and history removed

### 3. **Vercel Project** (if deployed)
- ✅ Project deleted from Vercel
- ✅ All deployments removed
- ✅ Live site taken down

### 4. **Local Database**
- ✅ Chat ownership record deleted
- ✅ Client information removed
- ✅ Deployment tracking data cleared

---

## 🔄 Delete Process Flow

```
User clicks "Delete" in Clients page
          ↓
Confirmation dialog appears
          ↓
User confirms deletion
          ↓
┌─────────────────────────────────────┐
│ 1. Delete from v0.dev               │ ⭐ NEW!
│    - Chat and all messages removed  │
└─────────────────────────────────────┘
          ↓
┌─────────────────────────────────────┐
│ 2. Delete GitHub Repository         │
│    - If repo URL exists             │
│    - Uses GitHub API                │
└─────────────────────────────────────┘
          ↓
┌─────────────────────────────────────┐
│ 3. Delete Vercel Project            │
│    - If project ID exists           │
│    - Uses Vercel API                │
└─────────────────────────────────────┘
          ↓
┌─────────────────────────────────────┐
│ 4. Delete Local Records             │
│    - Chat ownership                 │
│    - Client data                    │
└─────────────────────────────────────┘
          ↓
    ✅ Complete!
```

---

## 🛡️ Safety Features

### Confirmation Dialog
Before deletion, users see a clear warning:

```
⚠️ This will permanently delete:
  • The chat from your v0.dev account
  • All chat messages and generated code
  • The GitHub repository (if deployed)
  • The Vercel project and deployment (if deployed)
  • All local records and client data

⚠️ This action cannot be undone and will delete from v0.dev!
```

### Graceful Failure Handling
- If v0.dev deletion fails → Continues with other deletions
- If GitHub deletion fails → Continues with other deletions
- If Vercel deletion fails → Continues with other deletions
- Errors are logged but don't stop the process

### Response Tracking
The API returns detailed information about what was deleted:

```json
{
  "success": true,
  "deletedFromV0": true,
  "deletedGithub": true,
  "deletedVercel": true,
  "message": "Chat deleted from v0.dev, local database, GitHub, and Vercel"
}
```

---

## 🔑 Required Permissions

### For Complete Deletion:

| Platform | Required | Environment Variable | What Happens Without It |
|----------|----------|---------------------|-------------------------|
| v0.dev | ✅ Yes | `V0_API_KEY` | Deletion fails |
| GitHub | Optional | `GITHUB_TOKEN` | GitHub repo not deleted |
| Vercel | Optional | `VERCEL_TOKEN` | Vercel project not deleted |

**Note:** Even if GitHub or Vercel tokens are missing, the chat will still be deleted from v0.dev and your local database.

---

## 📍 Where Can You Delete?

### ✅ Clients Page
- Navigate to `/clients`
- Click the three-dot menu (⋮) on any website
- Select "Delete Website"
- Confirm deletion

### ❌ Chats Page
- No delete functionality (view-only)
- Use Clients page to delete

### ❌ Individual Chat Page
- No delete button in chat interface
- Use Clients page to delete

---

## 🔍 Console Output

When deletion happens, you'll see detailed logs:

```bash
Deleting chat: abc123xyz by user: user_123
Authenticated user deleting shared chat: abc123xyz

🗑️  Deleting chat from v0.dev: abc123xyz
✅ Chat deleted from v0.dev successfully

Deleting GitHub repo: TruKraft/my-project
✅ GitHub repository deleted successfully

Deleting Vercel project: prj_abc123
✅ Vercel project deleted successfully

Deleted client: abc123xyz
Chat deleted successfully: abc123xyz
```

---

## ⚠️ Important Notes

### Cannot Be Undone
Once deleted, the chat is **permanently removed** from:
- Your v0.dev account (cannot be recovered)
- GitHub (repo is gone forever)
- Vercel (deployments are destroyed)

### Shared Data Mode
In shared data mode, **any authenticated user** can delete any chat. This is by design for team collaboration.

### Organization Repos
If you deployed to a GitHub organization (like TruKraft), the deletion will remove the repo from the organization. Make sure you have the necessary permissions.

---

## 🧪 Testing the Feature

### Test Deletion:
1. Create a test chat/website
2. Optionally deploy it to GitHub/Vercel
3. Go to `/clients`
4. Delete the test website
5. Verify:
   - Chat is gone from v0.dev dashboard
   - GitHub repo is deleted (if deployed)
   - Vercel project is deleted (if deployed)
   - Website removed from your Clients list

---

## 🔧 Technical Implementation

### API Endpoint
```
DELETE /api/chats/[chatId]
```

### Key Code Location
```
app/api/chats/[chatId]/route.ts
```

### v0 SDK Method Used
```typescript
await v0.chats.delete({ chatId })
```

### GitHub API
```typescript
DELETE /repos/{owner}/{repo}
```

### Vercel API
```typescript
DELETE /v9/projects/{projectId}
```

---

## 🎯 Benefits

✅ **Complete cleanup** - No orphaned data anywhere  
✅ **One-click deletion** - Remove from all platforms at once  
✅ **Clear warnings** - Users know exactly what will be deleted  
✅ **Graceful handling** - Continues even if one platform fails  
✅ **Detailed logging** - Easy to debug if something goes wrong  

---

## 🆘 Troubleshooting

### "Failed to delete chat from v0.dev"
**Possible causes:**
- Invalid V0_API_KEY
- Chat already deleted from v0
- v0.dev API is down

**Solution:** Check your API key and try again. Local records will still be deleted.

### "Failed to delete GitHub repository"
**Possible causes:**
- Invalid GITHUB_TOKEN
- Repo already deleted
- Insufficient permissions

**Solution:** Check token permissions. Chat will still be deleted from v0 and local database.

### "Failed to delete Vercel project"
**Possible causes:**
- Invalid VERCEL_TOKEN
- Project already deleted
- Insufficient permissions

**Solution:** Check token permissions. Chat will still be deleted from v0 and local database.

---

**Your delete functionality now provides complete, cross-platform cleanup!** 🎉

