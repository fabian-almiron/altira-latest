import { NextResponse } from 'next/server'
import { auth } from '@/app/(auth)/auth'
import db from '@/lib/db/connection'
import { chat_ownerships, clients } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      )
    }

    // Get all chat ownerships for this user with client information
    const ownershipsWithClients = await db
      .select({
        chatId: chat_ownerships.v0_chat_id,
        websiteName: chat_ownerships.website_name,
        createdAt: chat_ownerships.created_at,
        clientId: chat_ownerships.client_id,
        clientName: clients.name,
        clientEmail: clients.email,
        clientPhone: clients.phone,
        clientCompany: clients.company,
      })
      .from(chat_ownerships)
      .leftJoin(clients, eq(chat_ownerships.client_id, clients.id))
      .where(eq(chat_ownerships.user_id, session.user.id))
      .orderBy(desc(chat_ownerships.created_at))

    // Format the response
    const websites = ownershipsWithClients.map((item: typeof ownershipsWithClients[number]) => ({
      chatId: item.chatId,
      websiteName: item.websiteName || `Website ${item.chatId.slice(0, 8)}`,
      client: {
        id: item.clientId || '',
        name: item.clientName || 'Unknown Client',
        email: item.clientEmail,
        phone: item.clientPhone,
        company: item.clientCompany,
      },
      createdAt: item.createdAt,
      messages: 0, // TODO: Implement message count
    }))

    return NextResponse.json({ websites })
  } catch (error) {
    console.error('Error fetching websites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch websites' },
      { status: 500 },
    )
  }
}

