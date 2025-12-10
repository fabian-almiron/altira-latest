import { NextRequest, NextResponse } from 'next/server'
import { getClerkAuth } from '@/lib/clerk-auth'
import db from '@/lib/db/connection'
import { chat_ownerships } from '@/lib/db/schema'
import { sql, isNotNull } from 'drizzle-orm'

/**
 * POST /api/deploy/fix-urls
 * 
 * Fixes deployment URLs for existing projects:
 * 1. Updates vercelDeploymentUrl to use production domain (projectName.vercel.app)
 * 2. Updates vercelProjectUrl to use correct dashboard format
 * 
 * This is a utility endpoint to fix URLs after the deployment system was updated.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getClerkAuth()

    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      )
    }

    console.log('🔧 Starting URL fix for existing deployments...')

    // Get all deployments with vercel_project_id (meaning they were deployed)
    const deployments = await db
      .select()
      .from(chat_ownerships)
      .where(isNotNull(chat_ownerships.vercel_project_id))
      .execute()

    console.log(`📋 Found ${deployments.length} deployments to check`)

    let updatedCount = 0
    const updates: Array<{ chatId: string; oldUrls: any; newUrls: any }> = []

    for (const deployment of deployments) {
      // Skip if no Vercel project name
      if (!deployment.vercel_project_id) continue

      // Extract project name from existing URLs
      let projectName = ''
      
      // Try to extract from project URL first
      if (deployment.vercel_project_url) {
        const projectUrlMatch = deployment.vercel_project_url.match(/https?:\/\/vercel\.com\/[^\/]+\/([^\/\?]+)/)
        if (projectUrlMatch) {
          projectName = projectUrlMatch[1]
        }
      }
      
      // Try to extract project name from deployment URL if not found
      if (!projectName && deployment.vercel_deployment_url) {
        const match = deployment.vercel_deployment_url.match(/https?:\/\/([^.]+)\.vercel\.app/)
        if (match) {
          projectName = match[1]
        }
      }
      
      // If still no project name, try from github repo name
      if (!projectName && deployment.github_repo_name) {
        projectName = deployment.github_repo_name
      }

      // Skip if we couldn't determine project name
      if (!projectName) {
        console.warn(`⚠️ Could not determine project name for chat ${deployment.v0_chat_id}`)
        continue
      }

      // Construct correct URLs with hardcoded team slug
      const newDeploymentUrl = `https://${projectName}.vercel.app`
      const newProjectUrl = `https://vercel.com/dev-strsdevcoms-projects/${projectName}`

      // Check if update is needed
      const needsUpdate = 
        deployment.vercel_deployment_url !== newDeploymentUrl ||
        deployment.vercel_project_url !== newProjectUrl

      if (needsUpdate) {
        const oldUrls = {
          deployment: deployment.vercel_deployment_url,
          project: deployment.vercel_project_url,
        }

        // Update the database
        await db
          .update(chat_ownerships)
          .set({
            vercel_deployment_url: newDeploymentUrl,
            vercel_project_url: newProjectUrl,
          })
          .where(sql`${chat_ownerships.v0_chat_id} = ${deployment.v0_chat_id}`)
          .execute()

        updatedCount++
        updates.push({
          chatId: deployment.v0_chat_id,
          oldUrls,
          newUrls: {
            deployment: newDeploymentUrl,
            project: newProjectUrl,
          },
        })

        console.log(`✅ Updated URLs for chat ${deployment.v0_chat_id}`)
      }
    }

    console.log(`✅ URL fix complete: ${updatedCount} deployments updated`)

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updatedCount} deployment URLs`,
      totalChecked: deployments.length,
      updatedCount,
      updates: updates.slice(0, 10), // Return first 10 for verification
    })
  } catch (error) {
    console.error('URL fix error:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Failed to fix deployment URLs',
          details: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to fix deployment URLs' },
      { status: 500 },
    )
  }
}

