-- Migration: Add deployment information columns to chat_ownerships
-- Created: 2025-12-09

ALTER TABLE "chat_ownerships" 
ADD COLUMN "github_repo_name" varchar(255),
ADD COLUMN "github_repo_url" text,
ADD COLUMN "vercel_project_id" varchar(255),
ADD COLUMN "vercel_project_url" text,
ADD COLUMN "vercel_deployment_url" text,
ADD COLUMN "deployment_status" varchar(50),
ADD COLUMN "deployed_at" timestamp;

