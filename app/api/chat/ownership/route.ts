import { NextRequest, NextResponse } from 'next/server'
import { getClerkAuth } from '@/lib/clerk-auth'
import { createChatOwnership, createAnonymousChatLog, getUserById } from '@/lib/db/queries'

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIP) {
    return realIP
  }

  // Fallback to connection remote address or unknown
  return 'unknown'
}

export async function POST(request: NextRequest) {
  try {
    const session = await getClerkAuth()
    const { chatId, clientId, websiteName } = await request.json()

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 },
      )
    }

    if (session?.userId) {
      // Authenticated user - check if user exists first
      const userExists = await getUserById(session.user.id)
      
      if (!userExists) {
        console.warn('Session user ID does not exist in database:', session.user.id)
        // Treat as anonymous user instead of failing
        const clientIP = getClientIP(request)
        await createAnonymousChatLog({
          ipAddress: clientIP,
          v0ChatId: chatId,
        })
        console.log('Anonymous chat logged (invalid session):', chatId, 'IP:', clientIP)
        return NextResponse.json({ 
          success: true, 
          warning: 'Invalid session, please sign out and sign in again' 
        })
      }
      
      // User exists - create ownership mapping with optional client
      await createChatOwnership({
        v0ChatId: chatId,
        userId: session.user.id,
        clientId: clientId || null,
        websiteName: websiteName || null,
      })
      console.log('Chat ownership created via API:', chatId, clientId ? `Client: ${clientId}` : '', websiteName ? `Name: ${websiteName}` : '')
    } else {
      // Anonymous user - log for rate limiting
      const clientIP = getClientIP(request)
      await createAnonymousChatLog({
        ipAddress: clientIP,
        v0ChatId: chatId,
      })
      console.log('Anonymous chat logged via API:', chatId, 'IP:', clientIP)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to create chat ownership/log:', error)
    return NextResponse.json(
      { error: 'Failed to create ownership record' },
      { status: 500 },
    )
  }
}
