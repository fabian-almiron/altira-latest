# GitHub Organization Setup Guide

## 🎉 Your System Now Supports GitHub Organizations!

Both the **Export to GitHub** and **Deploy to Vercel** features now support deploying to GitHub organizations like TruKraft.

---

## ✅ What Was Changed

### Files Updated:
1. **`env.example`** - Added `GITHUB_ORG` environment variable
2. **`app/api/export/github/route.ts`** - Updated to use org endpoint when configured
3. **`app/api/deploy/github-vercel/route.ts`** - Updated to use org endpoint when configured

### How It Works:
- If `GITHUB_ORG` is set → Repos created under: `https://github.com/TruKraft/[repo-name]`
- If `GITHUB_ORG` is empty → Repos created under: `https://github.com/[your-username]/[repo-name]`

---

## 🚀 Setup Instructions

### 1. Add Organization to Environment Variables

Open your `.env.local` file and add these lines:

```bash
GITHUB_ORG=TruKraft
```

### 2. (Optional) Add Teams for Automatic Access

If you want to automatically give your team members access to exported repos, add:

```bash
GITHUB_TEAMS=developers,designers,admins
GITHUB_TEAM_PERMISSION=push
```

**Find your team slugs:**
```bash
chmod +x get-github-teams.sh
./get-github-teams.sh YOUR_TOKEN TruKraft
```

Your complete `.env.local` should include:

```bash
# GitHub Configuration
GITHUB_TOKEN=ghp_your_github_token_here
GITHUB_ORG=TruKraft
GITHUB_TEAMS=developers,designers
GITHUB_TEAM_PERMISSION=push
```

**Permission Levels:**
- `pull` - Can read and clone
- `push` - Can read, clone, and push (recommended)
- `admin` - Full access including settings
- `maintain` - Can manage without destructive actions
- `triage` - Can manage issues and PRs

### 3. Verify Your Token Has Organization Access

You've already verified this works! ✅

Your token has:
- ✅ `repo` scope - Can create repositories
- ✅ `workflow` scope - Can manage GitHub Actions
- ✅ `admin:org` scope - Full organization admin rights
- ✅ Organization access - Can access TruKraft
- ✅ 1 repository found

### 4. Test It Out!

Now when you use either:
- **"Export to GitHub"** button
- **"Deploy to Vercel"** button (which exports to GitHub first)

Your repositories will be created under the **TruKraft organization**:
`https://github.com/TruKraft/[your-repo-name]`

---

## 📋 Example URLs

### Before (Personal Account):
```
https://github.com/your-username/my-v0-project
```

### After (TruKraft Organization):
```
https://github.com/TruKraft/my-v0-project
```

---

## 🔄 Switch Back to Personal Account

To switch back to your personal account, simply:

1. Remove or comment out the `GITHUB_ORG` line in `.env.local`:
   ```bash
   # GITHUB_ORG=TruKraft
   ```

2. Or set it to empty:
   ```bash
   GITHUB_ORG=
   ```

---

## 🎯 Console Output

When exporting/deploying, you'll see:

```
Creating repository at: org/TruKraft
✅ GitHub repo created: https://github.com/TruKraft/my-project
```

---

## 💡 Benefits of Organization Deployment

✅ **Centralized management** - All projects under one organization  
✅ **Team collaboration** - Team members can access all repos  
✅ **Professional appearance** - `TruKraft/project` looks more professional  
✅ **Consistent branding** - All projects under your company brand  
✅ **Easy sharing** - Organization repos are easier to manage permissions  

---

## 👥 Team-Based Access (New Feature!)

### How It Works:
When you export or deploy, the repository is automatically added to the specified teams in your organization. All team members get immediate access with the permission level you configured.

### Example Workflow:
1. You export a new project
2. System creates repo at `github.com/TruKraft/my-project`
3. System automatically adds repo to `developers` team
4. System automatically adds repo to `designers` team
5. All team members can now access the repo!

### Benefits:
- 🚀 **Instant access** - No manual invitation needed
- 🔐 **Consistent permissions** - All repos get same team access
- 💼 **Professional** - Proper team-based workflow
- ⚡ **Saves time** - No need to manually add collaborators

### Console Output:
```
Creating repository at: org/TruKraft
✅ GitHub repo created: https://github.com/TruKraft/my-project
🔐 Adding repo to 2 team(s)...
✅ Added repo to team: developers (push access)
✅ Added repo to team: designers (pull access)
```

---

## ⚙️ Technical Details

### API Endpoints Used:

**Personal Account:**
```
POST https://api.github.com/user/repos
```

**Organization:**
```
POST https://api.github.com/orgs/TruKraft/repos
```

### Token Requirements:
- Your token needs `repo` scope (you have it ✅)
- Your token must be authorized for the organization (you have it ✅)
- You need owner/admin rights in the org (you have it ✅)

---

## 🆘 Troubleshooting

### "Repository already exists" Error
- Repository name already exists in TruKraft
- Choose a different name or delete the existing repo first

### "Not Found" or "403 Forbidden" Error
- Check that `GITHUB_ORG=TruKraft` is correct (case-sensitive)
- Verify your token has access to the organization
- Re-run the token check script: `./check-github-token.sh YOUR_TOKEN`

### Repos Still Going to Personal Account
- Make sure you added `GITHUB_ORG=TruKraft` to `.env.local` (not just `env.example`)
- Restart your development server after adding the variable
- Check the console logs for "Creating repository at: org/TruKraft"

---

**You're all set! 🎉** Your exports and deployments will now go to the TruKraft organization!

