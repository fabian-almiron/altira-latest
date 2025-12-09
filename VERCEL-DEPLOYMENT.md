# 🚀 Deploy to Vercel

Complete guide to deploying your v0 clone to Vercel.

---

## 📋 **Prerequisites**

Before deploying, you'll need:

1. ✅ **Vercel Account** - https://vercel.com/signup
2. ✅ **PostgreSQL Database** - From Neon, Supabase, or Railway
3. ✅ **V0 API Key** - From https://v0.dev/settings/api-keys
4. ✅ **GitHub Repository** - Your code pushed to GitHub (already done!)

---

## 🎯 **Quick Deploy (5 Minutes)**

### **Step 1: Import to Vercel**

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select `fabian-almiron/altira-latest`
4. Click **"Import"**

### **Step 2: Configure Environment Variables**

Click **"Environment Variables"** and add these **3 required** variables:

#### **Required Variables:**

```env
# 1. AUTH_SECRET
# Generate with: openssl rand -base64 32
AUTH_SECRET=your-generated-secret-here

# 2. POSTGRES_URL
# Get from your database provider
POSTGRES_URL=postgresql://user:password@host:5432/database

# 3. V0_API_KEY
# Get from https://v0.dev/settings/api-keys
V0_API_KEY=v0_xxx_your_api_key_here
```

### **Step 3: Deploy!**

Click **"Deploy"** and wait 2-3 minutes.

---

## 🗄️ **Database Setup**

Choose one of these providers:

### **Option 1: Neon (Recommended)**

1. Go to https://neon.tech
2. Create a new project
3. Copy the connection string
4. Paste as `POSTGRES_URL` in Vercel

**Example:**
```
postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### **Option 2: Supabase**

1. Go to https://supabase.com
2. Create a new project
3. Go to **Settings → Database**
4. Copy **"Connection pooling" → "Connection string"**
5. Replace `[YOUR-PASSWORD]` with your actual password
6. Paste as `POSTGRES_URL` in Vercel

### **Option 3: Railway**

1. Go to https://railway.app
2. Create a new PostgreSQL database
3. Copy the connection string
4. Paste as `POSTGRES_URL` in Vercel

---

## 🔐 **Generate AUTH_SECRET**

### **Method 1: Terminal (Mac/Linux)**
```bash
openssl rand -base64 32
```

### **Method 2: Online**
Go to https://generate-secret.vercel.app/32

### **Method 3: Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and use as your `AUTH_SECRET`.

---

## 🔑 **Get V0 API Key**

1. Go to https://v0.dev/settings/api-keys
2. Click **"Create new API key"**
3. Give it a name (e.g., "Vercel Production")
4. Copy the key (starts with `v0_`)
5. Paste as `V0_API_KEY` in Vercel

---

## 🎨 **Optional Features**

### **Enable GitHub Export**

To allow exporting generated code to GitHub:

```env
GITHUB_TOKEN=ghp_your_github_personal_access_token
```

**Get Token:**
1. Go to https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Select scope: **`repo`** (Full control of private repositories)
4. Generate and copy the token

### **Enable Bitbucket Export**

```env
BITBUCKET_USERNAME=your_username
BITBUCKET_APP_PASSWORD=your_app_password
```

**Get App Password:**
1. Go to https://bitbucket.org/account/settings/app-passwords/
2. Create new app password
3. Select permission: **Repositories (Write)**

### **Enable Vercel Deployment Feature**

```env
VERCEL_TOKEN=your_vercel_token
```

**Get Token:**
1. Go to https://vercel.com/account/tokens
2. Create new token
3. Copy and paste

---

## 📦 **Build Settings**

Vercel will automatically detect your settings from `vercel.json`, but you can verify:

### **Framework Preset:** Next.js
### **Build Command:**
```bash
pnpm db:migrate && pnpm build
```

### **Install Command:**
```bash
pnpm install
```

### **Output Directory:** `.next` (default)

---

## ✅ **Post-Deployment Checklist**

After your first deployment:

- [ ] Visit your deployed URL (e.g., `https://your-app.vercel.app`)
- [ ] Test user registration
- [ ] Test generating code with v0
- [ ] Check database connection (users should be created)
- [ ] Test Git export (if enabled)
- [ ] Set up custom domain (optional)

---

## 🔧 **Troubleshooting**

### **Build Fails: "pnpm: command not found"**

**Solution:** Vercel auto-detects pnpm from `package.json`. Make sure:
- `package.json` has `"packageManager": "pnpm@9.15.0"` (already included)
- Or add install command in Vercel settings: `npm install -g pnpm@9 && pnpm install`

### **Database Connection Error**

**Check:**
1. Is `POSTGRES_URL` correct?
2. Does it include `?sslmode=require` for Neon/Supabase?
3. Is the password URL-encoded?
4. Can you connect from your local machine?

**Test locally:**
```bash
psql "postgresql://user:password@host:5432/database"
```

### **NextAuth Error: "Invalid AUTH_SECRET"**

**Solution:** Make sure:
1. `AUTH_SECRET` is set in Vercel
2. It's at least 32 characters
3. No extra spaces or quotes

**Regenerate:**
```bash
openssl rand -base64 32
```

### **V0 API Error: "Invalid API Key"**

**Check:**
1. Key starts with `v0_`
2. No extra spaces
3. Key is valid at https://v0.dev/settings/api-keys
4. You have v0 credits remaining

### **Migrations Not Running**

**Solution:** Migrations run automatically during build.

**Manual migration:**
1. Go to Vercel dashboard → Your project
2. Settings → Functions
3. Add a new function or run via Vercel CLI:

```bash
vercel env pull .env.local
pnpm db:migrate
```

---

## 🌐 **Custom Domain**

### **Add Your Domain:**

1. Vercel Dashboard → Your Project
2. Settings → Domains
3. Add your domain (e.g., `v0-clone.yourdomain.com`)
4. Follow DNS instructions

---

## 📊 **Monitoring**

### **Check Logs:**
Vercel Dashboard → Your Project → Deployments → Click deployment → **"Runtime Logs"**

### **Database Monitoring:**
- **Neon:** https://console.neon.tech
- **Supabase:** https://supabase.com/dashboard
- **Railway:** https://railway.app

---

## 🔄 **Continuous Deployment**

Your app is now connected to GitHub! Every push to `main` will:
1. ✅ Trigger a new build
2. ✅ Run database migrations
3. ✅ Deploy automatically

**Disable auto-deploy:**
Vercel Dashboard → Settings → Git → **"Deployment Branch"**

---

## 🎯 **Production Checklist**

Before going live:

- [ ] Set production `AUTH_SECRET` (don't use dev secret)
- [ ] Use production database (not dev database)
- [ ] Rotate all API keys
- [ ] Set up error monitoring (Sentry)
- [ ] Configure analytics
- [ ] Test all features
- [ ] Set up backups for database
- [ ] Add custom domain
- [ ] Update `NEXTAUTH_URL` if using custom domain

---

## 💡 **Tips**

### **Speed Up Builds:**
- Use Vercel's build cache (automatic)
- Database should be in same region as Vercel deployment (iad1 = US East)

### **Save Money:**
- Use Neon's free tier (0.5GB, great for testing)
- Vercel free tier: Unlimited deployments, 100GB bandwidth

### **Security:**
- Rotate tokens every 90 days
- Use environment-specific secrets
- Enable Vercel's security features

---

## 🆘 **Need Help?**

### **Vercel Support:**
- Docs: https://vercel.com/docs
- Discord: https://vercel.com/discord
- Email: support@vercel.com

### **Database Support:**
- Neon: https://neon.tech/docs
- Supabase: https://supabase.com/docs
- Railway: https://docs.railway.app

---

## ✅ **Success!**

Your v0 clone is now live! 🎉

**Next steps:**
1. Share the URL with your team
2. Start generating code
3. Export to Git repositories
4. Deploy directly to Vercel

**Your deployment URL:**
```
https://your-project.vercel.app
```

---

## 📚 **Additional Resources**

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [PostgreSQL Connection Pooling](https://neon.tech/docs/connect/connection-pooling)
- [NextAuth.js Deployment](https://next-auth.js.org/deployment)

---

**Happy Deploying!** 🚀

