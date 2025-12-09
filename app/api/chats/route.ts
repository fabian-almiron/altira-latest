import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'v0-sdk'
import { auth } from '@/app/(auth)/auth'
import { getChatOwnershipsWithNamesByUserId, getUserById } from '@/lib/db/queries'

// Create v0 client with custom baseUrl if V0_API_URL is set
const v0 = createClient(
  process.env.V0_API_URL ? { baseUrl: process.env.V0_API_URL } : {},
)

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    // Anonymous users don't have saved chats
    if (!session?.user?.id) {
      return NextResponse.json({ data: [] })
    }

    console.log('Fetching chats for user:', session.user.id)

    // Check if user exists in database
    const userExists = await getUserById(session.user.id)
    if (!userExists) {
      console.warn('Session user ID does not exist in database:', session.user.id)
      return NextResponse.json({ 
        data: [], 
        warning: 'Invalid session, please sign out and sign in again' 
      })
    }

    // Get user's chat ownerships with website names
    const userChatOwnerships = await getChatOwnershipsWithNamesByUserId({ userId: session.user.id })

    if (userChatOwnerships.length === 0) {
      return NextResponse.json({ data: [] })
    }

    // Create a map of chat IDs to website names
    const chatIdToWebsiteName = new Map(
      userChatOwnerships.map(ownership => [ownership.v0ChatId, ownership.websiteName])
    )

    const userChatIds = userChatOwnerships.map(o => o.v0ChatId)

    // Fetch actual chat data from v0 API
    const allChats = await v0.chats.find()

    // Filter to only include chats owned by this user and override name with website name
    const userChats = (allChats.data?.filter((chat) => userChatIds.includes(chat.id)) || [])
      .map(chat => ({
        ...chat,
        // Override the chat name with the website name (project name) from our database
        name: chatIdToWebsiteName.get(chat.id) || chat.name,
      }))

    console.log('Chats fetched successfully:', userChats.length, 'chats')

    return NextResponse.json({ data: userChats })
  } catch (error) {
    console.error('Chats fetch error:', error)

    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch chats',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
