import { NextRequest, NextResponse } from 'next/server'
import { createClient, ChatDetail } from 'v0-sdk'
import { auth } from '@/app/(auth)/auth'
import { createChatOwnership, getChatCountByUserId } from '@/lib/db/queries'
import { entitlementsByUserType } from '@/lib/entitlements'
import { ChatSDKError } from '@/lib/errors'

// Create v0 client with custom baseUrl if V0_API_URL is set
const v0 = createClient(
  process.env.V0_API_URL ? { baseUrl: process.env.V0_API_URL } : {},
)

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    // Require authentication - reject all requests without a valid session
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required', message: 'You must be logged in to use the chat.' },
        { status: 401 },
      )
    }

    const { message, chatId, streaming, attachments, projectId } =
      await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 },
      )
    }

    // Authenticated user rate limiting
    const chatCount = await getChatCountByUserId({
      userId: session.user.id,
      differenceInHours: 24,
    })

    const userType = session.user.type
    if (chatCount >= entitlementsByUserType[userType].maxMessagesPerDay) {
      return new ChatSDKError('rate_limit:chat').toResponse()
    }

    console.log('API request:', {
      message,
      chatId,
      streaming,
      userId: session.user.id,
    })

    console.log('Using baseUrl:', process.env.V0_API_URL || 'default')

    let chat

    if (chatId) {
      // continue existing chat
      if (streaming) {
        // Return streaming response for existing chat
        console.log('Sending streaming message to existing chat:', {
          chatId,
          message,
          responseMode: 'experimental_stream',
        })
        chat = await v0.chats.sendMessage({
          chatId: chatId,
          message,
          responseMode: 'experimental_stream',
          ...(attachments && attachments.length > 0 && { attachments }),
        })
        console.log('Streaming message sent to existing chat successfully')

        // Return the stream directly
        return new Response(chat as ReadableStream<Uint8Array>, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        })
      } else {
        // Non-streaming response for existing chat
        chat = await v0.chats.sendMessage({
          chatId: chatId,
          message,
          ...(attachments && attachments.length > 0 && { attachments }),
        })
      }
    } else {
      // create new chat
      if (streaming) {
        // Return streaming response
        console.log('Creating streaming chat with params:', {
          message,
          responseMode: 'experimental_stream',
        })
        chat = await v0.chats.create({
          message,
          responseMode: 'experimental_stream',
          ...(attachments && attachments.length > 0 && { attachments }),
        })
        console.log('Streaming chat created successfully')

        // Return the stream directly
        return new Response(chat as ReadableStream<Uint8Array>, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        })
      } else {
        // Use sync mode
        console.log('Creating sync chat with params:', {
          message,
          responseMode: 'sync',
        })
        chat = await v0.chats.create({
          message,
          responseMode: 'sync',
          ...(attachments && attachments.length > 0 && { attachments }),
        })
        console.log('Sync chat created successfully')
      }
    }

    // Type guard to ensure we have a ChatDetail and not a stream
    if (chat instanceof ReadableStream) {
      throw new Error('Unexpected streaming response')
    }

    const chatDetail = chat as ChatDetail

    // Create ownership mapping for new chat
    if (!chatId && chatDetail.id) {
      try {
        // Create ownership mapping for authenticated user
        await createChatOwnership({
          v0ChatId: chatDetail.id,
          userId: session.user.id,
        })
        console.log('Chat ownership created:', chatDetail.id)
      } catch (error) {
        console.error('Failed to create chat ownership:', error)
        // Don't fail the request if database save fails
      }
    }

    return NextResponse.json({
      id: chatDetail.id,
      demo: chatDetail.demo,
      messages: chatDetail.messages?.map((msg) => ({
        ...msg,
        experimental_content: (msg as any).experimental_content,
      })),
    })
  } catch (error) {
    console.error('V0 API Error:', error)

    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }

    return NextResponse.json(
      {
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
