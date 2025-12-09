import 'server-only'

import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  lt,
  type SQL,
} from 'drizzle-orm'

import {
  users,
  chat_ownerships,
  anonymous_chat_logs,
  clients,
  type User,
  type ChatOwnership,
  type AnonymousChatLog,
  type Client,
} from './schema'
import { generateUUID } from '../utils'
import { generateHashedPassword } from './utils'
import db from './connection'

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(users).where(eq(users.email, email))
  } catch (error) {
    console.error('Failed to get user from database')
    throw error
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, id))
    return user || null
  } catch (error) {
    console.error('Failed to get user by ID from database')
    throw error
  }
}

export async function createUser(
  email: string,
  password: string,
): Promise<User[]> {
  try {
    const hashedPassword = generateHashedPassword(password)
    return await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
      })
      .returning()
  } catch (error) {
    console.error('Failed to create user in database')
    throw error
  }
}

// Chat ownership functions
export async function createChatOwnership({
  v0ChatId,
  userId,
  clientId,
  websiteName,
}: {
  v0ChatId: string
  userId: string
  clientId?: string | null
  websiteName?: string | null
}) {
  try {
    return await db
      .insert(chat_ownerships)
      .values({
        v0_chat_id: v0ChatId,
        user_id: userId,
        client_id: clientId || null,
        website_name: websiteName || null,
      })
      .onConflictDoNothing({ target: chat_ownerships.v0_chat_id })
  } catch (error) {
    console.error('Failed to create chat ownership in database')
    throw error
  }
}

export async function getChatOwnership({ v0ChatId }: { v0ChatId: string }) {
  try {
    const [ownership] = await db
      .select()
      .from(chat_ownerships)
      .where(eq(chat_ownerships.v0_chat_id, v0ChatId))
    return ownership
  } catch (error) {
    console.error('Failed to get chat ownership from database')
    throw error
  }
}

export async function getChatIdsByUserId({
  userId,
}: {
  userId: string
}): Promise<string[]> {
  try {
    const ownerships = await db
      .select({ v0ChatId: chat_ownerships.v0_chat_id })
      .from(chat_ownerships)
      .where(eq(chat_ownerships.user_id, userId))
      .orderBy(desc(chat_ownerships.created_at))

    return ownerships.map((o: { v0ChatId: string }) => o.v0ChatId)
  } catch (error) {
    console.error('Failed to get chat IDs by user from database')
    throw error
  }
}

// Get chat ownerships with website names by user ID
export async function getChatOwnershipsWithNamesByUserId({
  userId,
}: {
  userId: string
}): Promise<Array<{ v0ChatId: string; websiteName: string | null }>> {
  try {
    const ownerships = await db
      .select({
        v0ChatId: chat_ownerships.v0_chat_id,
        websiteName: chat_ownerships.website_name,
      })
      .from(chat_ownerships)
      .where(eq(chat_ownerships.user_id, userId))
      .orderBy(desc(chat_ownerships.created_at))

    return ownerships
  } catch (error) {
    console.error('Failed to get chat ownerships with names from database')
    throw error
  }
}

export async function deleteChatOwnership({ v0ChatId }: { v0ChatId: string }) {
  try {
    return await db
      .delete(chat_ownerships)
      .where(eq(chat_ownerships.v0_chat_id, v0ChatId))
  } catch (error) {
    console.error('Failed to delete chat ownership from database')
    throw error
  }
}

// Update deployment information for a chat
export async function updateChatDeployment({
  v0ChatId,
  githubRepoName,
  githubRepoUrl,
  vercelProjectId,
  vercelProjectUrl,
  vercelDeploymentUrl,
  deploymentStatus,
}: {
  v0ChatId: string
  githubRepoName?: string
  githubRepoUrl?: string
  vercelProjectId?: string
  vercelProjectUrl?: string
  vercelDeploymentUrl?: string
  deploymentStatus?: string
}) {
  try {
    return await db
      .update(chat_ownerships)
      .set({
        ...(githubRepoName && { github_repo_name: githubRepoName }),
        ...(githubRepoUrl && { github_repo_url: githubRepoUrl }),
        ...(vercelProjectId && { vercel_project_id: vercelProjectId }),
        ...(vercelProjectUrl && { vercel_project_url: vercelProjectUrl }),
        ...(vercelDeploymentUrl && { vercel_deployment_url: vercelDeploymentUrl }),
        ...(deploymentStatus && { deployment_status: deploymentStatus }),
        deployed_at: new Date(),
      })
      .where(eq(chat_ownerships.v0_chat_id, v0ChatId))
      .returning()
  } catch (error) {
    console.error('Failed to update chat deployment in database')
    throw error
  }
}

// Rate limiting functions
export async function getChatCountByUserId({
  userId,
  differenceInHours,
}: {
  userId: string
  differenceInHours: number
}): Promise<number> {
  try {
    const hoursAgo = new Date(Date.now() - differenceInHours * 60 * 60 * 1000)

    const [stats] = await db
      .select({ count: count(chat_ownerships.id) })
      .from(chat_ownerships)
      .where(
        and(
          eq(chat_ownerships.user_id, userId),
          gte(chat_ownerships.created_at, hoursAgo),
        ),
      )

    return stats?.count || 0
  } catch (error) {
    console.error('Failed to get chat count by user from database')
    throw error
  }
}

export async function getChatCountByIP({
  ipAddress,
  differenceInHours,
}: {
  ipAddress: string
  differenceInHours: number
}): Promise<number> {
  try {
    const hoursAgo = new Date(Date.now() - differenceInHours * 60 * 60 * 1000)

    const [stats] = await db
      .select({ count: count(anonymous_chat_logs.id) })
      .from(anonymous_chat_logs)
      .where(
        and(
          eq(anonymous_chat_logs.ip_address, ipAddress),
          gte(anonymous_chat_logs.created_at, hoursAgo),
        ),
      )

    return stats?.count || 0
  } catch (error) {
    console.error('Failed to get chat count by IP from database')
    throw error
  }
}

export async function createAnonymousChatLog({
  ipAddress,
  v0ChatId,
}: {
  ipAddress: string
  v0ChatId: string
}) {
  try {
    return await db.insert(anonymous_chat_logs).values({
      ip_address: ipAddress,
      v0_chat_id: v0ChatId,
    })
  } catch (error) {
    console.error('Failed to create anonymous chat log in database')
    throw error
  }
}

// Client functions
export async function createClient({
  id,
  name,
  email,
  phone,
  company,
  userId,
}: {
  id?: string
  name: string
  email?: string
  phone?: string
  company?: string
  userId: string
}): Promise<Client | null> {
  try {
    // If ID is provided, check if client already exists
    if (id) {
      const existing = await db
        .select()
        .from(clients)
        .where(eq(clients.id, id))
        .limit(1)
      
      if (existing.length > 0) {
        return existing[0]
      }
    }

    // Insert new client
    const [client] = await db
      .insert(clients)
      .values({
        ...(id && { id }), // Use provided ID if available (chat ID)
        name,
        email,
        phone,
        company,
        user_id: userId,
      })
      .returning()
    
    return client || null
  } catch (error) {
    console.error('Failed to create client in database')
    throw error
  }
}

export async function getClientsByUserId({
  userId,
}: {
  userId: string
}): Promise<Client[]> {
  try {
    return await db
      .select()
      .from(clients)
      .where(eq(clients.user_id, userId))
      .orderBy(desc(clients.created_at))
  } catch (error) {
    console.error('Failed to get clients from database')
    throw error
  }
}

export async function getClientById({
  clientId,
}: {
  clientId: string
}): Promise<Client | null> {
  try {
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, clientId))
    return client || null
  } catch (error) {
    console.error('Failed to get client from database')
    throw error
  }
}

export async function updateClient({
  clientId,
  name,
  email,
  phone,
  company,
  status,
}: {
  clientId: string
  name?: string
  email?: string
  phone?: string
  company?: string
  status?: string
}) {
  try {
    return await db
      .update(clients)
      .set({
        ...(name && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(company !== undefined && { company }),
        ...(status && { status }),
        updated_at: new Date(),
      })
      .where(eq(clients.id, clientId))
      .returning()
  } catch (error) {
    console.error('Failed to update client in database')
    throw error
  }
}

export async function deleteClient({ clientId }: { clientId: string }) {
  try {
    return await db.delete(clients).where(eq(clients.id, clientId))
  } catch (error) {
    console.error('Failed to delete client from database')
    throw error
  }
}

// Get chats by client ID
export async function getChatsByClientId({
  clientId,
}: {
  clientId: string
}): Promise<ChatOwnership[]> {
  try {
    return await db
      .select()
      .from(chat_ownerships)
      .where(eq(chat_ownerships.client_id, clientId))
      .orderBy(desc(chat_ownerships.created_at))
  } catch (error) {
    console.error('Failed to get chats by client from database')
    throw error
  }
}
