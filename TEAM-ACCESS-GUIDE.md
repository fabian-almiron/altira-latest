# Team Access Guide - Automatic Repository Permissions

## 🎯 Overview

Your v0-clone now automatically grants team members access to all exported/deployed repositories! When you export or deploy a project, the system adds the repository to specified teams in your TruKraft organization.

---

## 🚀 Quick Setup

### Step 1: Find Your Team Slugs

Run the helper script to see all your organization's teams:

```bash
chmod +x get-github-teams.sh
./get-github-teams.sh YOUR_GITHUB_TOKEN TruKraft
```

**Example Output:**
```
📋 Found 3 team(s) in TruKraft:

────────────────────────────────────────
📦 Team: Developers
   Slug: developers
   Privacy: closed
────────────────────────────────────────
📦 Team: Designers
   Slug: designers
   Privacy: closed
────────────────────────────────────────
📦 Team: Admins
   Slug: admins
   Privacy: secret
────────────────────────────────────────
```

### Step 2: Add Teams to `.env.local`

```bash
# Basic setup - organization only
GITHUB_ORG=TruKraft

# With team access - recommended!
GITHUB_TEAMS=developers,designers
GITHUB_TEAM_PERMISSION=push
```

### Step 3: Export or Deploy!

That's it! Every repo you create will automatically be shared with those teams.

---

## 📋 Permission Levels Explained

### `pull` - Read Access
- ✅ Can view code
- ✅ Can clone repository
- ✅ Can create issues
- ❌ Cannot push changes

**Best for:** Stakeholders, clients, external reviewers

### `push` - Write Access (Recommended)
- ✅ Everything in "pull"
- ✅ Can push changes
- ✅ Can create pull requests
- ✅ Can merge approved PRs
- ❌ Cannot change repo settings

**Best for:** Developers, main team members

### `admin` - Full Access
- ✅ Everything in "push"
- ✅ Can change repo settings
- ✅ Can manage collaborators
- ✅ Can delete repository
- ✅ Can configure webhooks

**Best for:** Tech leads, DevOps team

### `maintain` - Maintainer Access
- ✅ Everything in "push"
- ✅ Can manage issues and PRs
- ✅ Can manage some settings
- ❌ Cannot delete repo or change critical settings

**Best for:** Project managers, team leads

### `triage` - Triage Access
- ✅ Everything in "pull"
- ✅ Can manage issues and PRs
- ❌ Cannot push code

**Best for:** Project managers, QA team

---

## 🔧 Configuration Examples

### Example 1: Single Team, Push Access
```bash
GITHUB_ORG=TruKraft
GITHUB_TEAMS=developers
GITHUB_TEAM_PERMISSION=push
```

All repos added to "developers" team with push access.

### Example 2: Multiple Teams, Same Permission
```bash
GITHUB_ORG=TruKraft
GITHUB_TEAMS=developers,designers,product-team
GITHUB_TEAM_PERMISSION=push
```

All repos added to all three teams with push access.

### Example 3: Read-Only Access
```bash
GITHUB_ORG=TruKraft
GITHUB_TEAMS=clients,stakeholders
GITHUB_TEAM_PERMISSION=pull
```

All repos visible to clients and stakeholders (read-only).

### Example 4: Admin Access for Core Team
```bash
GITHUB_ORG=TruKraft
GITHUB_TEAMS=core-team,devops
GITHUB_TEAM_PERMISSION=admin
```

Core team and DevOps get full admin access to all repos.

---

## 💼 Use Cases

### Startup with Single Dev Team
```bash
GITHUB_TEAMS=developers
GITHUB_TEAM_PERMISSION=push
```
Simple - all devs get push access to everything.

### Agency with Multiple Clients
```bash
# For client projects:
GITHUB_TEAMS=agency-developers,client-stakeholders
GITHUB_TEAM_PERMISSION=push  # Developers get push

# Then manually adjust client team to "pull" in GitHub settings
```

### Enterprise with Role-Based Access
```bash
# Option 1: All teams get same access
GITHUB_TEAMS=frontend-team,backend-team,qa-team
GITHUB_TEAM_PERMISSION=push

# Option 2: Use different configs for different project types
# (switch in .env.local based on project)
```

---

## 🔍 How It Works Behind the Scenes

When you export or deploy:

1. **Repository Created** → `POST /orgs/TruKraft/repos`
2. **Teams Added** → `PUT /orgs/TruKraft/teams/{team}/repos/{repo}`
3. **Permissions Set** → Team permission level applied

**API Call Example:**
```bash
PUT /orgs/TruKraft/teams/developers/repos/TruKraft/my-project
{
  "permission": "push"
}
```

---

## 🎨 Team Member Experience

### Before Automatic Team Access:
1. Admin exports project ✅
2. Admin manually invites each team member 😫
3. Team members accept invitations 😫
4. Finally can access repo 😴

### With Automatic Team Access:
1. Admin exports project ✅
2. Team members instantly see it ⚡
3. Done! 🎉

---

## 📊 Console Output

When exporting/deploying with teams configured:

```bash
🚀 Starting integrated GitHub + Vercel deployment for: abc123
📦 Step 1: Exporting to GitHub...
Creating repository at: org/TruKraft
✅ GitHub repo created: https://github.com/TruKraft/awesome-project

🔐 Adding repo to 2 team(s)...
✅ Added repo to team: developers (push access)
✅ Added repo to team: designers (pull access)

📂 Committing 47 files to GitHub...
✅ Successfully committed 47 files to GitHub
```

---

## ⚠️ Important Notes

### Teams Must Exist First
- You cannot create teams via this system
- Teams must be created in GitHub first: `https://github.com/orgs/TruKraft/teams`
- If a team slug is invalid, the system logs a warning but continues

### Team Slug vs Team Name
- **Team Name**: "Frontend Developers" (visible in UI)
- **Team Slug**: "frontend-developers" (used in API/config)
- Always use the **slug** in `GITHUB_TEAMS`

### Permissions Are Applied to All Teams
- All teams get the same permission level from `GITHUB_TEAM_PERMISSION`
- For different permissions per team, manually adjust in GitHub after creation
- Or create separate configs for different project types

### Organization Members Still Need Base Access
- Teams grant additional access beyond base org permissions
- Configure org base permissions: `https://github.com/organizations/TruKraft/settings/member_privileges`
- Recommended: Set org base to "No permission" and use team-based access

---

## 🆘 Troubleshooting

### "Team not found" Error
**Problem:** Team slug is incorrect or team doesn't exist

**Solution:**
```bash
# List all teams to verify slugs
./get-github-teams.sh YOUR_TOKEN TruKraft
```

### Teams Added But Members Can't See Repo
**Problem:** Team members might not have their membership set to public or the team privacy is wrong

**Solution:**
1. Check team privacy (closed teams are visible to org members)
2. Verify team membership: `https://github.com/orgs/TruKraft/teams/developers/members`
3. Members might need to sync their GitHub app or refresh

### Different Permissions Needed Per Team
**Problem:** You want developers to have push, but stakeholders to have pull

**Solution - Option 1:** Manual adjustment after creation
1. Set `GITHUB_TEAMS=developers`
2. After export, manually add stakeholders team with pull access in GitHub

**Solution - Option 2:** Create separate configs
```bash
# In .env.local for dev projects
GITHUB_TEAMS=developers
GITHUB_TEAM_PERMISSION=push

# In .env.local.client for client projects
GITHUB_TEAMS=developers,client-team
GITHUB_TEAM_PERMISSION=pull
# (Then manually adjust developers to push in GitHub)
```

### Token Doesn't Have Team Permissions
**Problem:** Token can't add teams to repos

**Solution:**
- Your token needs `admin:org` scope
- You already have this! ✅
- If not: Create new token with `admin:org` scope

---

## 🎓 Best Practices

### ✅ DO:
- Use team-based access for scalable permission management
- Keep team names and slugs consistent and descriptive
- Use `push` permission for most development teams
- Document which teams have access to which projects
- Review team access quarterly

### ❌ DON'T:
- Give admin access unless necessary (security risk)
- Add too many teams (makes management complex)
- Mix organization and individual collaborators (choose one approach)
- Forget to remove team access when projects are archived

---

## 🔗 Related Links

- [GitHub Teams Documentation](https://docs.github.com/en/organizations/organizing-members-into-teams)
- [Repository Permission Levels](https://docs.github.com/en/organizations/managing-access-to-your-organizations-repositories/repository-permission-levels-for-an-organization)
- [Creating Teams in Organizations](https://docs.github.com/en/organizations/organizing-members-into-teams/creating-a-team)

---

## 📧 Need Different Access Control?

If team-based access doesn't fit your needs, we can also implement:

1. **Individual Collaborators** - Add specific GitHub users
2. **GitHub Apps** - Fine-grained permissions via apps
3. **CODEOWNERS** - Automatic code review assignments
4. **Branch Protection** - Require reviews from specific teams

Let me know if you need any of these features!

