# 🚀 Git Export Setup Guide

Export your v0-generated code directly to GitHub or Bitbucket repositories!

---

## 🎯 What This Does

Instead of deploying through v0.dev, you can:
1. **Export source code** to a Git repository (GitHub or Bitbucket)
2. **Own the code** in your own repository
3. **Deploy from Git** to Vercel (or anywhere else)
4. **Bypass the v0 deployment limitation** for initial deployments

---

## ⚙️ Setup

### Option A: GitHub Export (Recommended)

#### 1. Create a GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. **Token name:** `v0-clone-export`
4. **Expiration:** Choose your preference (90 days recommended)
5. **Scopes:** Select these permissions:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)

6. Click **"Generate token"**
7. **COPY THE TOKEN** (you won't see it again!)

#### 2. Add to `.env.local`

```bash
# GitHub Export
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### Option B: Bitbucket Export

#### 1. Create a Bitbucket App Password

1. Go to: https://bitbucket.org/account/settings/app-passwords/
2. Click **"Create app password"**
3. **Label:** `v0-clone-export`
4. **Permissions:** Select:
   - ✅ **Repositories:** Read, Write
   - ✅ **Pull requests:** Read, Write (optional)

5. Click **"Create"**
6. **COPY THE PASSWORD** (you won't see it again!)

#### 2. Add to `.env.local`

```bash
# Bitbucket Export
BITBUCKET_USERNAME=your-bitbucket-username
BITBUCKET_APP_PASSWORD=xxxxxxxxxxxxxxxxxxxxx
```

---

## 🎨 How to Use

### 1. Generate Your Page

- Use your v0 clone to generate a page
- Make sure you're happy with the result

### 2. Export to Git

1. Click **"Export to Git"** button (in preview panel or chat menu)
2. Choose platform: **GitHub** or **Bitbucket**
3. Enter **repository name** (e.g., `my-landing-page`)
4. For Bitbucket: Enter your **workspace name**
5. Click **"Export Now"**

### 3. Wait for Export

- The system will:
  - Create a new repository
  - Push all generated files
  - Show you the repository URL

### 4. Deploy to Vercel

Now you can deploy the "normal" way:

1. Go to: https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select your GitHub/Bitbucket account
4. Choose the repository you just created
5. Click **"Deploy"**
6. Done! ✅

---

## 📁 What Gets Exported

### **From v0 (Your Custom Code):**
- ✅ `app/page.tsx` - Main page component
- ✅ `components/hero.tsx` - Custom components
- ✅ `components/about.tsx` - More custom components
- ✅ All other AI-generated files

### **Auto-Included Templates (Base Setup):**
- ✅ `components/ui/button.tsx` - shadcn Button
- ✅ `components/ui/card.tsx` - shadcn Card
- ✅ `components/ui/input.tsx` - shadcn Input
- ✅ `lib/utils.ts` - Utility functions (cn())
- ✅ `tsconfig.json` - TypeScript configuration
- ✅ `next.config.ts` - Next.js configuration
- ✅ `tailwind.config.ts` - Tailwind CSS setup
- ✅ `package.json` - All dependencies
- ✅ `.gitignore` - Git ignore rules
- ✅ `README.md` - Project documentation

**The repository is COMPLETE and ready to clone and run!**

> 📝 **Note:** v0's API only returns your custom files. We automatically add all the missing base files (shadcn components, configs, etc.) so the exported code works out of the box!

---

## 💡 Advantages Over v0 Direct Deployment

### Via Git Export:
- ✅ **Works for initial deployments** (no need to deploy from v0.dev first)
- ✅ **Full source code control** (you own the repo)
- ✅ **Easy collaboration** (invite team members)
- ✅ **Version history** (all commits tracked)
- ✅ **Deploy anywhere** (not just Vercel)
- ✅ **Customize freely** (edit code after export)
- ✅ **CI/CD integration** (GitHub Actions, etc.)

### Via v0 API Deployment:
- ⚠️ Requires initial deployment from v0.dev
- ⚠️ No source code ownership
- ⚠️ Limited to Vercel only
- ⚠️ Can't customize after deployment

---

## 🔄 Typical Workflow

```
Generate page in v0 clone
        ↓
Export to GitHub/Bitbucket ✅
        ↓
Clone repository locally (optional)
        ↓
Deploy from Git → Vercel
        ↓
Done! Full control of your code 🎉
```

---

## 🔒 Security Notes

### GitHub Token:
- ✅ Grants full repo access (needed to create repos)
- ✅ Store securely in `.env.local` (not committed to git)
- ✅ Rotate regularly
- ✅ Delete if compromised

### Bitbucket App Password:
- ✅ Limited to specific permissions
- ✅ Can be revoked anytime
- ✅ More secure than account password

**Never commit tokens to version control!**

---

## 🐛 Troubleshooting

### "Repository already exists"
**Solution:** Choose a different repository name or delete the existing repo.

### "GitHub token not configured"
**Solution:** Make sure `GITHUB_TOKEN` is in your `.env.local` file and restart your dev server.

### "Failed to create repository"
**Solution:** 
- Check your token has correct permissions
- Verify token hasn't expired
- Try regenerating the token

### "Bitbucket workspace not found"
**Solution:** Use your actual Bitbucket workspace name (usually your username or team name).

---

## 🎯 Example `.env.local`

```bash
# Authentication
AUTH_SECRET=your_secret_here

# Database
POSTGRES_URL=postgresql://...

# v0 API
V0_API_KEY=v1:team_xxx:xxx

# GitHub Export (Option A)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# OR Bitbucket Export (Option B)
# BITBUCKET_USERNAME=your-username
# BITBUCKET_APP_PASSWORD=xxxxxxxxxxxxxxxxxxxxx

# Vercel Token (for direct API deployment)
VERCEL_TOKEN=your_vercel_token
```

---

## 📚 Next Steps

After exporting to Git:

1. **Clone locally:**
   ```bash
   git clone https://github.com/your-username/repo-name.git
   cd repo-name
   npm install
   npm run dev
   ```

2. **Make changes:**
   - Edit code as needed
   - Commit changes
   - Push to repository

3. **Deploy updates:**
   - Vercel auto-deploys on push
   - Or manually deploy from Vercel dashboard

---

## 🚀 You're Ready!

Now you can:
- ✅ Generate pages with v0 clone
- ✅ Export to your own Git repositories
- ✅ Deploy anywhere you want
- ✅ Own and control your code

**No more limitations on initial deployments!** 🎉

---

## 🆘 Need Help?

- Check token permissions
- Verify `.env.local` configuration
- Restart dev server after adding tokens
- Check console logs for detailed errors

Happy exporting! 🚀

