import { auth, currentUser } from '@clerk/nextjs/server'

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

