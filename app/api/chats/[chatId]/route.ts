import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'v0-sdk'
import { auth } from '@/app/(auth)/auth'
import { getChatOwnership, getUserById, deleteChatOwnership } from '@/lib/db/queries'
import db from '@/lib/db/connection'
import { clients } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Create v0 client with custom baseUrl if V0_API_URL is set
const v0 = createClient(
  process.env.V0_API_URL ? { baseUrl: process.env.V0_API_URL } : {},
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    const session = await auth()
    const { chatId } = await params

    console.log('Fetching chat details for ID:', chatId)

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 },
      )
    }

    if (session?.user?.id) {
      // Check if user exists in database
      const userExists = await getUserById(session.user.id)
      if (!userExists) {
        console.warn('Session user ID does not exist in database:', session.user.id)
        return NextResponse.json({ 
          error: 'Invalid session, please sign out and sign in again' 
        }, { status: 401 })
      }

      // Authenticated user - check ownership
      const ownership = await getChatOwnership({ v0ChatId: chatId })

      if (!ownership) {
        return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
      }

      if (ownership.user_id !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    } else {
      // Anonymous user - allow access to any chat (they can only access via direct URL)
      console.log('Anonymous access to chat:', chatId)
    }

    // Fetch chat details using v0 SDK
    const chatDetails = await v0.chats.getById({ chatId })

    console.log('Chat details fetched:', chatDetails)

    return NextResponse.json(chatDetails)
  } catch (error) {
    console.error('Error fetching chat details:', error)

    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch chat details',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
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

    console.log('Deleting chat:', chatId, 'for user:', session.user.id)

    // Check ownership
    const ownership = await getChatOwnership({ v0ChatId: chatId })

    if (!ownership) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    if (ownership.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete GitHub repository if it exists
    if (ownership.github_repo_url && process.env.GITHUB_TOKEN) {
      try {
        // Extract owner and repo from URL (e.g., https://github.com/owner/repo)
        const repoMatch = ownership.github_repo_url.match(/github\.com\/([^\/]+)\/([^\/]+)/)
        if (repoMatch) {
          const [, owner, repo] = repoMatch
          console.log(`Deleting GitHub repo: ${owner}/${repo}`)
          
          const githubResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}`,
            {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
              },
            }
          )

          if (githubResponse.ok || githubResponse.status === 404) {
            console.log('✅ GitHub repository deleted successfully')
          } else {
            console.warn('⚠️ Failed to delete GitHub repository:', await githubResponse.text())
          }
        }
      } catch (error) {
        console.error('❌ Error deleting GitHub repository:', error)
        // Continue with deletion even if GitHub delete fails
      }
    }

    // Delete Vercel project if it exists
    if (ownership.vercel_project_id && process.env.VERCEL_TOKEN) {
      try {
        console.log(`Deleting Vercel project: ${ownership.vercel_project_id}`)
        
        const vercelResponse = await fetch(
          `https://api.vercel.com/v9/projects/${ownership.vercel_project_id}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
            },
          }
        )

        if (vercelResponse.ok || vercelResponse.status === 404) {
          console.log('✅ Vercel project deleted successfully')
        } else {
          console.warn('⚠️ Failed to delete Vercel project:', await vercelResponse.text())
        }
      } catch (error) {
        console.error('❌ Error deleting Vercel project:', error)
        // Continue with deletion even if Vercel delete fails
      }
    }

    // Delete the chat ownership
    await deleteChatOwnership({ v0ChatId: chatId })

    // Also delete the client if it was created for this chat (client_id = chat_id)
    if (ownership.client_id === chatId) {
      try {
        await db.delete(clients).where(eq(clients.id, chatId))
        console.log('Deleted client:', chatId)
      } catch (error) {
        console.error('Failed to delete client:', error)
        // Continue even if client deletion fails
      }
    }

    console.log('Chat deleted successfully:', chatId)

    return NextResponse.json({ 
      success: true,
      deletedGithub: !!ownership.github_repo_url,
      deletedVercel: !!ownership.vercel_project_id,
    })
  } catch (error) {
    console.error('Error deleting chat:', error)
    return NextResponse.json(
      { error: 'Failed to delete chat' },
      { status: 500 },
    )
  }
}
