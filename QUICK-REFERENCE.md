# ⚡ Quick Reference Card

## 🚀 Export & Deploy - Cheat Sheet

### Export Your Generated Pages

| Method | Location | Action |
|--------|----------|--------|
| **Preview Button** | Top-right of preview panel | Click "Export Code" → Opens v0.dev |
| **Export Hint** | Blue box below chat | Click "Export Code" button |
| **Chat Menu** | ⋯ next to chat name | Select "View on v0.dev" |
| **Direct URL** | Browser | `https://v0.dev/chat/YOUR_CHAT_ID` |

### Deploy to Vercel

| Method | Location | Action |
|--------|----------|--------|
| **Chat Menu** | ⋯ next to chat name | Select "Deploy to Vercel" |
| **Export Hint** | Blue box below chat | Click "Deploy" button |
| **Direct URL** | Browser | `https://v0.dev/chat/YOUR_CHAT_ID/deploy` |
| **API** | Programmatic | `POST /api/deploy` with `{ chatId }` |

---

## 📋 Prerequisites Checklist

### Before You Start
- [ ] Node.js installed
- [ ] pnpm installed (`npm i -g pnpm`)
- [ ] PostgreSQL database (Railway recommended)
- [ ] v0.dev account
- [ ] V0_API_KEY from https://v0.dev/chat/settings/keys

### Before Deploying
- [ ] Vercel account connected on v0.dev
- [ ] Chat saved on v0.dev
- [ ] Signed in to your account

---

## 🔧 Essential Commands

```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm db:migrate

# Open database studio
pnpm db:studio

# Start development server
npm run dev

# Deploy to Vercel
vercel
```

---

## 🌐 Important URLs

| Service | URL |
|---------|-----|
| **v0.dev** | https://v0.dev |
| **API Keys** | https://v0.dev/chat/settings/keys |
| **Integrations** | https://v0.dev/settings/integrations |
| **Vercel** | https://vercel.com |
| **Railway** | https://railway.app |
| **v0 Docs** | https://v0.dev/docs/api/platform |

---

## 🔑 Environment Variables

```bash
# Required
AUTH_SECRET=your_auth_secret_here
POSTGRES_URL=postgresql://user:pass@host:port/db
V0_API_KEY=your_v0_api_key_here

# Optional
V0_API_URL=http://localhost:3001/v1
```

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| **Hydration errors** | ✅ Fixed automatically |
| **Database errors** | Sign out → Sign in again |
| **Can't export** | Use export buttons in UI |
| **Can't deploy** | Connect Vercel on v0.dev |
| **Port in use** | Check terminals, kill process |
| **Build fails** | Check environment variables |

---

## 📂 Key Files

| File | Purpose |
|------|---------|
| `.env` | Environment variables |
| `package.json` | Dependencies |
| `drizzle.config.ts` | Database config |
| `app/api/deploy/route.ts` | Deployment API |
| `components/chat/export-hint.tsx` | Export notification |

---

## 🎯 Common Tasks

### Create a New Account
1. Click avatar (top right)
2. Select "Create Account"
3. Enter email & password
4. Sign in

### Generate a Page
1. Enter prompt in chat
2. Wait for generation
3. View in preview panel

### Export Code
1. Click "Export Code" button
2. Opens on v0.dev
3. Copy, download, or share

### Deploy to Vercel
1. Ensure Vercel connected
2. Click "Deploy" button
3. Monitor on v0.dev or Vercel

---

## 📚 Documentation Files

| File | Content |
|------|---------|
| `README.md` | Main documentation |
| `EXPORT-GUIDE.md` | Complete export guide |
| `EXPORT-QUICK-START.md` | Export quick start |
| `DEPLOY-TO-VERCEL.md` | Deployment guide |
| `FEATURES-SUMMARY.md` | All features |
| `QUICK-REFERENCE.md` | This file! |

---

## 💡 Pro Tips

1. **Save Time:** Use export hint's "Got it" to dismiss per chat
2. **Deploy Fast:** Connect Vercel once, deploy anytime
3. **Iterate:** Continue conversation to refine designs
4. **Share:** Use v0.dev links to share with team
5. **Organize:** Name your chats for easy finding

---

## 🎉 You're Ready!

Everything you need is at your fingertips. Start building! 🚀

**Questions?** Check the full documentation files listed above.

