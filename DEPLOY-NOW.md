# ⚡ Deploy Now - Quick Start

Deploy your v0 clone to Vercel in 5 minutes!

---

## 🚀 One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ffabian-almiron%2Faltira-latest&env=V0_API_KEY,AUTH_SECRET,POSTGRES_URL&envDescription=Required%3A+V0+API+key%2C+Auth+secret%2C+and+PostgreSQL+URL&envLink=https%3A%2F%2Fgithub.com%2Ffabian-almiron%2Faltira-latest%2Fblob%2Fmain%2FVERCEL-DEPLOYMENT.md&project-name=v0-clone&repository-name=v0-clone)

---

## ✅ 3 Required Environment Variables

### 1️⃣ **POSTGRES_URL**
Your PostgreSQL database connection string.

**Get it from:**
- **Neon** (Recommended): https://neon.tech → Create project → Copy connection string
- **Supabase**: https://supabase.com → New project → Settings → Database
- **Railway**: https://railway.app → New PostgreSQL → Copy URL

**Example:**
```
postgresql://user:password@host.region.provider.com:5432/database?sslmode=require
```

---

### 2️⃣ **AUTH_SECRET**
Random secret for NextAuth session encryption.

**Generate it:**
```bash
openssl rand -base64 32
```

Or use: https://generate-secret.vercel.app/32

**Example:**
```
abc123XYZ789randomString456DEF/+==
```

---

### 3️⃣ **V0_API_KEY**
Your v0 Platform API key.

**Get it from:**
https://v0.dev/settings/api-keys

**Format:**
```
v0_xxx_your_api_key_here
```

---

## 📋 Step-by-Step

1. **Click the Deploy button** ☝️
2. **Connect GitHub account** (if not already connected)
3. **Name your project** (e.g., `my-v0-clone`)
4. **Add the 3 environment variables** above
5. **Click "Deploy"**
6. **Wait 2-3 minutes** ⏳
7. **Done!** Visit your live app 🎉

---

## 🎯 What Happens Next

Vercel will automatically:
- ✅ Clone your repository
- ✅ Install dependencies
- ✅ Run database migrations
- ✅ Build your app
- ✅ Deploy to production
- ✅ Give you a live URL

**Your URL:** `https://your-project.vercel.app`

---

## 🔧 Optional: Add Git Export Features

Want to enable GitHub/Bitbucket export? Add these **optional** variables:

### **For GitHub Export:**
```env
GITHUB_TOKEN=ghp_your_personal_access_token
```
Get from: https://github.com/settings/tokens (scope: `repo`)

### **For Bitbucket Export:**
```env
BITBUCKET_USERNAME=your_username
BITBUCKET_APP_PASSWORD=your_app_password
```
Get from: https://bitbucket.org/account/settings/app-passwords/

---

## 📖 Need More Help?

**Full deployment guide:** [VERCEL-DEPLOYMENT.md](./VERCEL-DEPLOYMENT.md)

**Common issues:**
- Database connection errors → Check `POSTGRES_URL` format
- Build failures → Check environment variables
- Auth errors → Regenerate `AUTH_SECRET`

---

## ✅ Success Checklist

After deployment:
- [ ] Visit your app URL
- [ ] Register a test user
- [ ] Generate code with v0
- [ ] Check database (users should appear)
- [ ] Celebrate! 🎉

---

**Questions?** Open an issue: https://github.com/fabian-almiron/altira-latest/issues

**Happy coding!** 🚀

