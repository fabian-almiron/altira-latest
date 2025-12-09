import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'v0-sdk'
import { auth } from '@/app/(auth)/auth'
import { getChatOwnership } from '@/lib/db/queries'

// Create v0 client
const v0 = createClient(
  process.env.V0_API_URL ? { baseUrl: process.env.V0_API_URL } : {},
)

/**
 * Sanitize project name to meet Vercel requirements:
 * - Lowercase only
 * - Max 100 characters
 * - Only letters, digits, '.', '_', '-'
 * - Cannot contain '---'
 */
function sanitizeProjectName(name: string): string {
  return name
    .toLowerCase() // Convert to lowercase
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9._-]/g, '') // Remove invalid characters
    .replace(/---+/g, '--') // Replace triple+ hyphens with double
    .replace(/^[-._]+|[-._]+$/g, '') // Remove leading/trailing special chars
    .slice(0, 100) // Limit to 100 characters
}

/**
 * Deploy to Vercel using Vercel API directly
 * This bypasses v0's deployment system and gives you full control
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const { chatId, projectName, teamId } = await request.json()

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 },
      )
    }

    // Verify Vercel token exists
    const vercelToken = process.env.VERCEL_TOKEN
    if (!vercelToken) {
      return NextResponse.json(
        {
          error: 'Vercel token not configured',
          details: 'Add VERCEL_TOKEN to your .env.local file',
        },
        { status: 500 },
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

    console.log('Fetching chat details from v0 API:', chatId)

    // Step 1: Get the generated code from v0 API
    const chatDetails = await v0.chats.getById({ chatId })

    if (!chatDetails || !chatDetails.demo) {
      return NextResponse.json(
        { error: 'No generated code found for this chat' },
        { status: 404 },
      )
    }

    // Step 2: Get the actual code/files
    // Note: v0 API returns a demo URL, not the source code
    // For direct deployment, we need to point to where the code is hosted
    const demoUrl = chatDetails.demo

    // Sanitize project name to meet Vercel requirements
    const sanitizedProjectName = sanitizeProjectName(
      projectName || `v0-${chatId.slice(0, 8)}`,
    )

    console.log('Creating Vercel deployment:', {
      originalName: projectName,
      sanitizedName: sanitizedProjectName,
      chatId,
    })

    // Step 3: Create deployment on Vercel
    // Option A: Deploy from URL (if v0 provides a git repo or tarball)
    // Option B: Create project and link to v0's hosted version

    // Add skipAutoDetectionConfirmation=1 to auto-detect framework
    const vercelApiUrl = teamId
      ? `https://api.vercel.com/v13/deployments?teamId=${teamId}&skipAutoDetectionConfirmation=1`
      : 'https://api.vercel.com/v13/deployments?skipAutoDetectionConfirmation=1'

    // Create a deployment that proxies to v0's demo URL
    // Using file-based deployment (simpler than git-based)
    const deployment = {
      name: sanitizedProjectName,
      target: 'production',
      projectSettings: {
        framework: null, // Let Vercel auto-detect
        buildCommand: null,
        devCommand: null,
        installCommand: null,
        outputDirectory: null,
      },
      // Use file-based deployment instead of gitSource
      files: [
        {
          file: 'index.html',
          data: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>v0 Generated App</title>
  <meta http-equiv="refresh" content="0; url=${demoUrl}">
</head>
<body>
  <p>Redirecting to your v0 app...</p>
  <p>If not redirected, <a href="${demoUrl}">click here</a>.</p>
</body>
</html>`,
        },
        {
          file: 'vercel.json',
          data: JSON.stringify({
            redirects: [
              {
                source: '/(.*)',
                destination: demoUrl,
                permanent: false,
              },
            ],
          }),
        },
      ],
    }

    const vercelResponse = await fetch(vercelApiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deployment),
    })

    if (!vercelResponse.ok) {
      const error = await vercelResponse.json()
      console.error('Vercel API error:', error)
      return NextResponse.json(
        {
          error: 'Failed to create Vercel deployment',
          details: error.error?.message || 'Unknown error',
          vercelError: error,
        },
        { status: vercelResponse.status },
      )
    }

    const vercelDeployment = await vercelResponse.json()

    console.log('Vercel deployment created:', vercelDeployment)

    return NextResponse.json({
      success: true,
      deployment: {
        id: vercelDeployment.id,
        url: vercelDeployment.url,
        inspectorUrl: vercelDeployment.inspectorUrl,
        status: vercelDeployment.readyState,
        vercelUrl: `https://${vercelDeployment.url}`,
      },
      message: 'Deployment created successfully on Vercel',
      note: 'This deployment redirects to v0s hosted version. For full code deployment, export from v0.dev first.',
    })
  } catch (error) {
    console.error('Direct Vercel deployment error:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Failed to deploy to Vercel',
          details: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to deploy to Vercel' },
      { status: 500 },
    )
  }
}

