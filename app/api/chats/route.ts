import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'v0-sdk'
import { getClerkAuth } from '@/lib/clerk-auth'
import { getAllChatOwnershipsWithNames } from '@/lib/db/queries'

// Create v0 client with custom baseUrl if V0_API_URL is set
const v0 = createClient(
  process.env.V0_API_URL ? { baseUrl: process.env.V0_API_URL } : {},
)

export async function GET(request: NextRequest) {
  try {
    const session = await getClerkAuth()

    // Anonymous users don't have saved chats
    if (!session?.userId) {
      return NextResponse.json({ data: [] })
    }

    console.log('Fetching ALL chats (shared across all users)')

    // Get ALL chat ownerships (shared across all users)
    const allChatOwnerships = await getAllChatOwnershipsWithNames()

    if (allChatOwnerships.length === 0) {
      return NextResponse.json({ data: [] })
    }

    // Create a map of chat IDs to website names
    const chatIdToWebsiteName = new Map(
      allChatOwnerships.map(ownership => [ownership.v0ChatId, ownership.websiteName])
    )

    const allChatIds = allChatOwnerships.map(o => o.v0ChatId)

    // Fetch actual chat data from v0 API
    const allChats = await v0.chats.find()

    // Show ALL chats to all users and override name with website name
    const sharedChats = (allChats.data?.filter((chat) => allChatIds.includes(chat.id)) || [])
      .map(chat => ({
        ...chat,
        // Override the chat name with the website name (project name) from our database
        name: chatIdToWebsiteName.get(chat.id) || chat.name,
      }))

    console.log('Chats fetched successfully:', sharedChats.length, 'chats (shared across all users)')

    return NextResponse.json({ data: sharedChats })
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
