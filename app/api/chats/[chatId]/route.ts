import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'v0-sdk'
import { getClerkAuth } from '@/lib/clerk-auth'
import { getChatOwnership, deleteChatOwnership } from '@/lib/db/queries'
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
    const session = await getClerkAuth()
    const { chatId } = await params

    console.log('Fetching chat details for ID:', chatId)

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 },
      )
    }

    if (session?.userId) {
      // Authenticated user - allow access to ANY chat (shared data mode)
      const ownership = await getChatOwnership({ v0ChatId: chatId })

      if (!ownership) {
        return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
      }

      console.log('Authenticated user accessing shared chat:', chatId)
    } else {
      // Anonymous user not allowed
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      )
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
    const session = await getClerkAuth()

    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      )
    }

    const { chatId } = await params

    console.log('Deleting chat:', chatId, 'by user:', session.userId)

    // Get chat ownership (but don't check if user owns it - all users can delete in shared mode)
    const ownership = await getChatOwnership({ v0ChatId: chatId })

    if (!ownership) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    console.log('Authenticated user deleting shared chat:', chatId)

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
