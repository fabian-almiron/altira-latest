import type { InferSelectModel } from 'drizzle-orm'
import {
  pgTable,
  varchar,
  timestamp,
  uuid,
  primaryKey,
  unique,
  text,
} from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 64 }),
  created_at: timestamp('created_at').notNull().defaultNow(),
})

export type User = InferSelectModel<typeof users>

// Clients table - stores client information
// NOTE: id is the v0 chat ID (not UUID format)
export const clients = pgTable('clients', {
  id: varchar('id', { length: 255 }).primaryKey().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  company: varchar('company', { length: 255 }),
  status: varchar('status', { length: 20 }).notNull().default('active'), // 'active' | 'inactive'
  user_id: uuid('user_id')
    .notNull()
    .references(() => users.id),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
})

export type Client = InferSelectModel<typeof clients>

// Simple ownership mapping for v0 chats
// The actual chat data lives in v0 API, we just track who owns what
export const chat_ownerships = pgTable(
  'chat_ownerships',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    v0_chat_id: varchar('v0_chat_id', { length: 255 }).notNull(), // v0 API chat ID
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id),
    client_id: varchar('client_id', { length: 255 }).references(() => clients.id), // Link chat to client (v0 chat ID)
    website_name: varchar('website_name', { length: 255 }), // Optional name for the website/chat
    // Deployment information
    github_repo_name: varchar('github_repo_name', { length: 255 }), // GitHub repository name
    github_repo_url: text('github_repo_url'), // GitHub repository URL
    vercel_project_id: varchar('vercel_project_id', { length: 255 }), // Vercel project ID
    vercel_project_url: text('vercel_project_url'), // Vercel project dashboard URL
    vercel_deployment_url: text('vercel_deployment_url'), // Live deployment URL
    deployment_status: varchar('deployment_status', { length: 50 }), // e.g., 'deployed', 'building', 'failed'
    deployed_at: timestamp('deployed_at'), // When the deployment was created
    created_at: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    // Ensure each v0 chat can only be owned by one user
    unique_v0_chat: unique().on(table.v0_chat_id),
  }),
)

export type ChatOwnership = InferSelectModel<typeof chat_ownerships>

// Track anonymous chat creation by IP for rate limiting
export const anonymous_chat_logs = pgTable('anonymous_chat_logs', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  ip_address: varchar('ip_address', { length: 45 }).notNull(), // IPv6 can be up to 45 chars
  v0_chat_id: varchar('v0_chat_id', { length: 255 }).notNull(), // v0 API chat ID
  created_at: timestamp('created_at').notNull().defaultNow(),
})

export type AnonymousChatLog = InferSelectModel<typeof anonymous_chat_logs>
