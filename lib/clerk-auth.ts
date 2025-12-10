import { auth, currentUser } from '@clerk/nextjs/server'
import db from './db/connection'
import { users } from './db/schema'
import { eq } from 'drizzle-orm'

export interface ClerkSession {
  userId: string
  user: {
    id: string
    email: string
    fullName: string | null
  }
}

export async function getClerkAuth(): Promise<ClerkSession | null> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return null
    }

    const user = await currentUser()
    
    if (!user) {
      return null
    }

    // Ensure user exists in database (auto-create if needed)
    await ensureUserExists(userId, user.emailAddresses[0]?.emailAddress || '')

    return {
      userId,
      user: {
        id: userId,
        email: user.emailAddresses[0]?.emailAddress || '',
        fullName: user.fullName,
      },
    }
  } catch (error) {
    console.error('Clerk auth error:', error)
    return null
  }
}

/**
 * Ensures a user record exists in the database for the given Clerk user ID
 * Creates the record if it doesn't exist (upsert)
 */
async function ensureUserExists(clerkUserId: string, email: string): Promise<void> {
  try {
    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, clerkUserId))
      .limit(1)

    if (existingUser.length === 0) {
      // Create user record
      await db.insert(users).values({
        id: clerkUserId,
        email: email,
        password: null, // No password for Clerk users
      })
      console.log(`✅ Created database user record for Clerk ID: ${clerkUserId}`)
    }
  } catch (error) {
    console.error('Error ensuring user exists:', error)
    // Don't throw - allow the request to continue even if user creation fails
  }
}

