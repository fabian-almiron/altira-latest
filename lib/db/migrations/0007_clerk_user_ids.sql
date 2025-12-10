-- Migration: Change user_id columns from UUID to VARCHAR for Clerk compatibility
-- Clerk uses string IDs like "user_xxx" instead of UUIDs

-- Step 1: Drop foreign key constraints
ALTER TABLE "clients" DROP CONSTRAINT IF EXISTS "clients_user_id_users_id_fk";
ALTER TABLE "chat_ownerships" DROP CONSTRAINT IF EXISTS "chat_ownerships_user_id_users_id_fk";

-- Step 2: Change column types from UUID to VARCHAR
ALTER TABLE "users" ALTER COLUMN "id" TYPE VARCHAR(255);
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;

ALTER TABLE "clients" ALTER COLUMN "user_id" TYPE VARCHAR(255);
ALTER TABLE "chat_ownerships" ALTER COLUMN "user_id" TYPE VARCHAR(255);

-- Step 3: Recreate foreign key constraints
ALTER TABLE "clients" 
  ADD CONSTRAINT "clients_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "users"("id");

ALTER TABLE "chat_ownerships" 
  ADD CONSTRAINT "chat_ownerships_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "users"("id");

