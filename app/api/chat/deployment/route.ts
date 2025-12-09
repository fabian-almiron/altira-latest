import { NextRequest, NextResponse } from 'next/server'
import { getClerkAuth } from '@/lib/clerk-auth'
import { getChatOwnership } from '@/lib/db/queries'

/**
 * GET /api/chat/deployment?chatId=xxx
 * Get deployment information for a specific chat
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getClerkAuth()
    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get('chatId')

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 },
      )
    }

    // Get chat ownership which includes deployment info
    const ownership = await getChatOwnership({ v0ChatId: chatId })

    if (!ownership) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 },
      )
    }

    // Allow all authenticated users to view deployment info (shared data mode)

    // Return deployment info
    return NextResponse.json({
      chatId: ownership.v0_chat_id,
      githubRepoName: ownership.github_repo_name,
      githubRepoUrl: ownership.github_repo_url,
      vercelProjectId: ownership.vercel_project_id,
      vercelProjectUrl: ownership.vercel_project_url,
      vercelDeploymentUrl: ownership.vercel_deployment_url,
      deploymentStatus: ownership.deployment_status,
      deployedAt: ownership.deployed_at,
    })
  } catch (error) {
    console.error('Failed to get deployment info:', error)
    return NextResponse.json(
      { error: 'Failed to get deployment info' },
      { status: 500 },
    )
  }
}

