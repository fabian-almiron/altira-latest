import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'v0-sdk'
import { getClerkAuth } from '@/lib/clerk-auth'

// Create v0 client
const v0 = createClient(
  process.env.V0_API_URL ? { baseUrl: process.env.V0_API_URL } : {},
)

export async function POST(request: NextRequest) {
  try {
    const session = await getClerkAuth()

    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      )
    }

    const { projectId, name } = await request.json()

    if (!projectId || !name) {
      return NextResponse.json(
        { error: 'Project ID and name are required' },
        { status: 400 },
      )
    }

    console.log('Linking Vercel project:', { projectId, name })

    // Link Vercel project using v0 SDK
    const result = await v0.integrations.vercel.projects.create({
      projectId,
      name,
    })

    console.log('Vercel project linked successfully:', result)

    return NextResponse.json({
      success: true,
      project: result,
      message: 'Vercel project linked successfully',
    })
  } catch (error) {
    console.error('Vercel linking error:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Failed to link Vercel project',
          details: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to link Vercel project' },
      { status: 500 },
    )
  }
}

