import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'v0-sdk'
import { auth } from '@/app/(auth)/auth'
import { getChatOwnership } from '@/lib/db/queries'

// Create v0 client
const v0 = createClient(
  process.env.V0_API_URL ? { baseUrl: process.env.V0_API_URL } : {},
)

export async function POST(request: NextRequest) {
  let chatId: string = ''
  
  try {
    const session = await auth()
    const body = await request.json()
    chatId = body.chatId
    const projectId = body.projectId
    const versionId = body.versionId

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 },
      )
    }

    // Check ownership if user is authenticated
    if (session?.user?.id) {
      const ownership = await getChatOwnership({ v0ChatId: chatId })

      if (!ownership || ownership.user_id !== session.user.id) {
        return NextResponse.json(
          { error: 'You do not have permission to deploy this chat' },
          { status: 403 },
        )
      }
    }

    console.log('Creating deployment for chat:', chatId)
    console.log('Deployment params:', { chatId, projectId, versionId })

    // Get chat details to extract projectId and versionId if not provided
    const chatDetails = await v0.chats.getById({ chatId })
    
    const deployProjectId = projectId || chatDetails.projectId
    const deployVersionId = versionId || chatDetails.latestVersion?.id

    if (!deployProjectId || !deployVersionId) {
      return NextResponse.json(
        { error: 'Unable to determine project or version ID from chat' },
        { status: 400 },
      )
    }

    console.log('Attempting deployment with:', {
      chatId,
      projectId: deployProjectId,
      versionId: deployVersionId,
    })

    // Try to create deployment
    // If it fails because there's no Vercel project, we'll catch it and provide instructions
    const deployment = await v0.deployments.create({
      chatId: chatId,
      projectId: deployProjectId,
      versionId: deployVersionId,
    })

    console.log('Deployment created successfully:', deployment)

    return NextResponse.json({
      success: true,
      deployment,
      message: 'Deployment initiated successfully',
    })
  } catch (error) {
    console.error('Deployment error:', error)

    // Handle specific error cases
    if (error instanceof Error) {
      // Check if project has no Vercel project ID (first deployment)
      if (error.message.includes('no Vercel project ID')) {
        return NextResponse.json(
          {
            error: 'First deployment required from v0.dev',
            details: `This project hasn't been deployed yet. Please deploy it once from v0.dev to create the Vercel project link:\n\n1. Go to: https://v0.dev/chat/${chatId}\n2. Click "Deploy" button\n3. Complete the first deployment\n4. Then you can deploy updates from here!`,
            needsFirstDeployment: true,
            v0Url: `https://v0.dev/chat/${chatId}`,
            message: error.message,
          },
          { status: 409 },
        )
      }
      
      // Check if it's a Vercel integration error
      if (
        error.message.includes('Vercel') || 
        error.message.includes('integration') ||
        error.message.includes('projectId') ||
        error.message.includes('unauthorized')
      ) {
        return NextResponse.json(
          {
            error: 'Vercel account not linked',
            details: 'Go to v0.dev/chat/' + chatId + ' → Click "Deploy" → Connect your Vercel account. Then try again from here.',
            message: error.message,
          },
          { status: 400 },
        )
      }

      return NextResponse.json(
        {
          error: 'Failed to create deployment',
          details: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to create deployment' },
      { status: 500 },
    )
  }
}

