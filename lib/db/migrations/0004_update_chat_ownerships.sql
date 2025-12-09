-- Drop the foreign key constraint if it exists
ALTER TABLE "chat_ownerships" DROP CONSTRAINT IF EXISTS "chat_ownerships_project_id_projects_id_fk";

-- Rename project_id to client_id (if it exists)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'chat_ownerships' AND column_name = 'project_id'
  ) THEN
    ALTER TABLE "chat_ownerships" RENAME COLUMN "project_id" TO "client_id";
  END IF;
END $$;

-- Add client_id column if it doesn't exist (in case project_id didn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'chat_ownerships' AND column_name = 'client_id'
  ) THEN
    ALTER TABLE "chat_ownerships" ADD COLUMN "client_id" uuid;
  END IF;
END $$;

-- Add website_name column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'chat_ownerships' AND column_name = 'website_name'
  ) THEN
    ALTER TABLE "chat_ownerships" ADD COLUMN "website_name" varchar(255);
  END IF;
END $$;

-- Add foreign key constraint for client_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chat_ownerships_client_id_clients_id_fk'
  ) THEN
    ALTER TABLE "chat_ownerships" 
    ADD CONSTRAINT "chat_ownerships_client_id_clients_id_fk" 
    FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") 
    ON DELETE no action ON UPDATE no action;
  END IF;
END $$;

-- Drop projects table if it exists (optional - only if you want to clean up)
DROP TABLE IF EXISTS "projects";

