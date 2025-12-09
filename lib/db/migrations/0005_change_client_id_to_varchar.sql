-- Drop foreign key constraint first
ALTER TABLE "chat_ownerships" DROP CONSTRAINT IF EXISTS "chat_ownerships_client_id_clients_id_fk";

-- Drop and recreate clients table with varchar ID
DROP TABLE IF EXISTS "clients" CASCADE;

CREATE TABLE "clients" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255),
	"phone" varchar(50),
	"company" varchar(255),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "users"("id"),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Update chat_ownerships.client_id to varchar if it exists
DO $$ 
BEGIN
  -- Drop the column if it exists and recreate as varchar
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'chat_ownerships' AND column_name = 'client_id'
  ) THEN
    ALTER TABLE "chat_ownerships" DROP COLUMN "client_id";
  END IF;
  
  -- Add client_id as varchar
  ALTER TABLE "chat_ownerships" ADD COLUMN "client_id" varchar(255);
END $$;

-- Add foreign key constraint
ALTER TABLE "chat_ownerships" 
ADD CONSTRAINT "chat_ownerships_client_id_clients_id_fk" 
FOREIGN KEY ("client_id") REFERENCES "clients"("id") 
ON DELETE no action ON UPDATE no action;

