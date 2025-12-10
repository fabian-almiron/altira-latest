# Quick Team Setup - TL;DR

## 🚀 2-Minute Setup

### 1. Find Your Teams
```bash
chmod +x get-github-teams.sh
./get-github-teams.sh YOUR_GITHUB_TOKEN TruKraft
```

### 2. Add to `.env.local`
```bash
GITHUB_TOKEN=ghp_your_github_token_here
GITHUB_ORG=TruKraft
GITHUB_TEAMS=developers,designers
GITHUB_TEAM_PERMISSION=push
```

### 3. Done! 
Export or deploy - your team automatically gets access.

---

## 📋 Permission Cheat Sheet

| Permission | Use For | Can Do |
|------------|---------|--------|
| `pull` | Clients, stakeholders | View, clone |
| `push` | Developers | View, clone, push, merge PRs |
| `maintain` | Team leads | Everything in push + manage issues |
| `admin` | Tech leads | Everything + change settings |

**Recommended:** `push` for most teams

---

## 💡 Common Configs

### All Developers
```bash
GITHUB_TEAMS=developers
GITHUB_TEAM_PERMISSION=push
```

### Dev Team + Stakeholders
```bash
GITHUB_TEAMS=developers,stakeholders
GITHUB_TEAM_PERMISSION=push
# Note: Manually set stakeholders to "pull" in GitHub after
```

### Multiple Teams Same Access
```bash
GITHUB_TEAMS=frontend,backend,qa,devops
GITHUB_TEAM_PERMISSION=push
```

---

## ⚡ What You Get

✅ Repos created at: `github.com/TruKraft/project-name`  
✅ Team members get instant access  
✅ No manual invitations needed  
✅ Consistent permissions across all projects  
✅ Professional team-based workflow  

---

## 🆘 Quick Troubleshooting

**Team not found?**  
→ Run `./get-github-teams.sh` to verify team slug

**Members can't see repo?**  
→ Check team membership at `github.com/orgs/TruKraft/teams`

**Want different permissions per team?**  
→ Set general permission in config, adjust specific teams manually in GitHub

---

## 📚 Full Documentation

- `TEAM-ACCESS-GUIDE.md` - Complete guide with examples
- `GITHUB-ORG-SETUP.md` - Organization setup instructions
- `get-github-teams.sh` - List all teams and details

---

**That's it!** You're now deploying like a pro. 🎉

