import { NextResponse } from 'next/server'
import { getClerkAuth } from '@/lib/clerk-auth'
import {
  createClient,
  getAllClients,
  updateClient,
  deleteClient,
  getChatsByClientId,
  getClientById,
} from '@/lib/db/queries'

export async function GET() {
  try {
    const session = await getClerkAuth()

    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      )
    }

    // Get ALL clients (shared across all users)
    const clients = await getAllClients()
    
    // Add website count for each client
    const clientsWithCounts = await Promise.all(
      clients.map(async (client) => {
        const chats = await getChatsByClientId({ clientId: client.id })
        return {
          ...client,
          websitesCount: chats.length,
        }
      })
    )

    return NextResponse.json({ clients: clientsWithCounts })
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getClerkAuth()

    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      )
    }

    const { id, name, email, phone, company } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Client name is required' },
        { status: 400 },
      )
    }

    try {
      const client = await createClient({
        id, // Optional - can be chat ID
        name,
        email,
        phone,
        company,
        userId: session.userId,
      })

      if (!client) {
        return NextResponse.json(
          { error: 'Failed to create client' },
          { status: 500 },
        )
      }

      return NextResponse.json({ client })
    } catch (createError: any) {
      // Handle duplicate key error (race condition)
      // If another request already created this client, just return it
      if (createError?.cause?.code === '23505' && id) {
        console.log(`⚠️ Client ${id} already exists (race condition), returning existing client`)
        const existingClient = await getClientById({ clientId: id })
        if (existingClient) {
          return NextResponse.json({ client: existingClient })
        }
      }
      // Re-throw if it's a different error
      throw createError
    }
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getClerkAuth()

    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      )
    }

    const { clientId, name, email, phone, company, status } = await request.json()

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 },
      )
    }

    const [updatedClient] = await updateClient({
      clientId,
      name,
      email,
      phone,
      company,
      status,
    })

    return NextResponse.json({ client: updatedClient })
  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getClerkAuth()

    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      )
    }

    const { clientId } = await request.json()

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 },
      )
    }

    await deleteClient({ clientId })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 },
    )
  }
}

