import { NextResponse } from 'next/server'
import { auth } from '@/app/(auth)/auth'
import { getChatOwnership, getClientById } from '@/lib/db/queries'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      )
    }

    const { chatId } = await params
    const ownership = await getChatOwnership({ v0ChatId: chatId })

    if (!ownership) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 },
      )
    }

    // Verify the chat belongs to the user
    if (ownership.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 },
      )
    }

    // Get client info if available
    let client = null
    if (ownership.client_id) {
      client = await getClientById({ clientId: ownership.client_id })
    }

    return NextResponse.json({
      websiteName: ownership.website_name,
      client: client ? {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.company,
      } : null,
    })
  } catch (error) {
    console.error('Error fetching chat info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat info' },
      { status: 500 },
    )
  }
}

