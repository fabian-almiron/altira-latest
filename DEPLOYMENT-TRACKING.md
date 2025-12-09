# 🚀 Deployment Tracking System

## Overview

The v0 Clone now automatically tracks and displays deployment information for your websites. When you deploy via the **GitHub + Vercel** method, all deployment details are saved to the database and displayed in the header for easy access.

## Features

### 📊 What Gets Saved

When you deploy a website using the GitHub + Vercel deployment method, the following information is automatically saved to the database:

- **GitHub Repository Name** - The name of your GitHub repo
- **GitHub Repository URL** - Direct link to your GitHub repository
- **Vercel Project ID** - Unique identifier for your Vercel project
- **Vercel Project URL** - Link to your Vercel project dashboard
- **Vercel Deployment URL** - Live URL of your deployed website
- **Deployment Status** - Current status (deployed, building, pending, failed)
- **Deployed At** - Timestamp of when the deployment was created

### 🎯 Where It Appears

Deployment information is displayed in the **header** when viewing a chat/website that has been deployed. You'll see three action buttons:

1. **GitHub Button with Copy Icon** - Click to copy the GitHub repository URL to clipboard
2. **Dashboard Button** - Opens the Vercel project dashboard in a new tab
3. **View Live Button** - Opens your live deployed website in a new tab

## How to Use

### Step 1: Deploy Your Website

1. Navigate to any chat/website
2. Click the **Deploy** button
3. Select **"Deploy to GitHub + Vercel"**
4. Fill in the repository name and project settings
5. Click **Deploy**

### Step 2: Access Deployment Info

Once deployed, you'll see the deployment buttons appear in the header automatically:

```
[Altira Logo] [Chat Selector] ... [GitHub 📋] [Dashboard ▲] [View Live 🔗] [User Menu]
```

### Step 3: Manage Your Deployment

- **Copy GitHub URL**: Click the GitHub button to instantly copy the repo URL
- **View on Vercel**: Click Dashboard to manage your project on Vercel
- **View Live Site**: Click View Live to open your deployed website

## Database Schema

The deployment information is stored in the `chat_ownerships` table:

```sql
ALTER TABLE "chat_ownerships" 
ADD COLUMN "github_repo_name" varchar(255),
ADD COLUMN "github_repo_url" text,
ADD COLUMN "vercel_project_id" varchar(255),
ADD COLUMN "vercel_project_url" text,
ADD COLUMN "vercel_deployment_url" text,
ADD COLUMN "deployment_status" varchar(50),
ADD COLUMN "deployed_at" timestamp;
```

## API Endpoints

### Get Deployment Info

```typescript
GET /api/chat/deployment?chatId={chatId}

Response:
{
  chatId: string
  githubRepoName: string | null
  githubRepoUrl: string | null
  vercelProjectId: string | null
  vercelProjectUrl: string | null
  vercelDeploymentUrl: string | null
  deploymentStatus: string | null
  deployedAt: string | null
}
```

## Technical Details

### Components

- **`components/shared/deployment-info.tsx`** - Main component that displays deployment buttons
- **`components/shared/app-header.tsx`** - Integrates deployment info into header
- **`app/api/chat/deployment/route.ts`** - API endpoint to fetch deployment data

### Database Functions

- **`updateChatDeployment()`** - Updates deployment info for a chat
- **`getChatOwnership()`** - Retrieves chat ownership including deployment data

### Automatic Updates

The deployment information is automatically saved during the GitHub + Vercel deployment process:

1. **After successful deployment** - All URLs and status are saved
2. **After partial success** - GitHub and Vercel project info saved with "pending" status
3. **On failure** - No data is saved (deployment must be retried)

## Migration

To add deployment tracking to an existing database, run the migration:

```bash
# Migration file: lib/db/migrations/0006_add_deployment_info.sql
psql $DATABASE_URL < lib/db/migrations/0006_add_deployment_info.sql
```

Or if using Drizzle:

```bash
npm run db:push
```

## Troubleshooting

### Deployment info not showing?

1. Make sure you deployed using the **GitHub + Vercel** method (not other methods)
2. Check that the deployment completed successfully
3. Refresh the page to reload the deployment data
4. Verify the chat ID in the URL matches your deployed chat

### Copy button not working?

- Ensure your browser supports the Clipboard API
- Check if clipboard permissions are granted
- Try using HTTPS (required for clipboard access)

### Links not opening?

- Verify pop-up blockers aren't preventing new tabs
- Check that the URLs are valid in the database
- Ensure Vercel project still exists and is accessible

## Future Enhancements

Potential improvements for the deployment tracking system:

- [ ] Show deployment status badges (building, deployed, failed)
- [ ] Add deployment history timeline
- [ ] Support multiple deployments per chat
- [ ] Add deployment webhook integration for status updates
- [ ] Show build logs directly in the UI
- [ ] Add deployment analytics and metrics
- [ ] Support for other deployment platforms (Netlify, Railway, etc.)

## Security Notes

- Deployment URLs are stored per-user and require authentication to access
- Only the chat owner can view deployment information
- GitHub and Vercel tokens are never exposed to the client
- All deployment operations require valid session authentication

---

Built with ❤️ for Altira AI Website Generator

