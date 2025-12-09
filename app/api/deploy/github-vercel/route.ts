import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'v0-sdk'
import { getClerkAuth } from '@/lib/clerk-auth'
import { getChatOwnership, updateChatDeployment } from '@/lib/db/queries'
import { getTemplateFilesForExport, detectAndNormalizeFonts } from '@/lib/export-templates'

const v0 = createClient(
  process.env.V0_API_URL ? { baseUrl: process.env.V0_API_URL } : {},
)

/**
 * Integrated GitHub + Vercel Deployment
 * 1. Exports code to GitHub repository
 * 2. Creates Vercel project from that GitHub repo
 * 3. Triggers automatic deployment
 */
export async function POST(request: NextRequest) {
  let chatId: string = ''
  let githubRepoUrl: string = ''
  let repoFullName: string = ''

  try {
    const session = await getClerkAuth()
    const body = await request.json()
    chatId = body.chatId
    const repoName = body.repoName
    const projectName = body.projectName || repoName // Vercel project name (optional, defaults to repo name)
    const isPrivate = body.isPrivate !== false // Default to private repo

    // Validate required fields
    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 },
      )
    }

    if (!repoName) {
      return NextResponse.json(
        { error: 'Repository name is required' },
        { status: 400 },
      )
    }

    // Check tokens
    const githubToken = process.env.GITHUB_TOKEN
    const vercelToken = process.env.VERCEL_TOKEN

    if (!githubToken) {
      return NextResponse.json(
        {
          error: 'GitHub token not configured',
          details: 'Please add GITHUB_TOKEN to .env.local',
        },
        { status: 500 },
      )
    }

    if (!vercelToken) {
      return NextResponse.json(
        {
          error: 'Vercel token not configured',
          details: 'Please add VERCEL_TOKEN to .env.local',
        },
        { status: 500 },
      )
    }

    // Verify chat exists (shared data mode - any authenticated user can deploy)
    if (session?.userId) {
      const ownership = await getChatOwnership({ v0ChatId: chatId })

      if (!ownership) {
        return NextResponse.json(
          { error: 'Chat not found' },
          { status: 404 },
        )
      }
    }

    console.log('🚀 Starting integrated GitHub + Vercel deployment for:', chatId)

    // ========================================
    // STEP 1: EXPORT TO GITHUB
    // ========================================
    console.log('📦 Step 1: Exporting to GitHub...')

    // Get chat details and files from v0
    const chatDetails = await v0.chats.getById({ chatId })

    if (!chatDetails.files || chatDetails.files.length === 0) {
      return NextResponse.json(
        { error: 'No files found in this chat' },
        { status: 400 },
      )
    }

    console.log(`Found ${chatDetails.files.length} files to export`)

    // Create GitHub repository
    const createRepoResponse = await fetch(
      'https://api.github.com/user/repos',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({
          name: repoName,
          description: `Generated from v0 chat: ${chatDetails.title || chatId}`,
          private: isPrivate,
          auto_init: true,
        }),
      },
    )

    if (!createRepoResponse.ok) {
      const errorData = await createRepoResponse.json()
      console.error('GitHub repo creation failed:', errorData)

      if (createRepoResponse.status === 422) {
        return NextResponse.json(
          {
            error: 'Repository already exists',
            details: 'A repository with this name already exists. Please choose a different name.',
          },
          { status: 400 },
        )
      }

      return NextResponse.json(
        {
          error: 'Failed to create GitHub repository',
          details: errorData.message || 'Unknown error',
        },
        { status: 500 },
      )
    }

    const repoData = await createRepoResponse.json()
    githubRepoUrl = repoData.html_url
    repoFullName = repoData.full_name
    console.log('✅ GitHub repo created:', githubRepoUrl)

    // Get default branch and commit SHA
    const defaultBranch = repoData.default_branch || 'main'
    const refResponse = await fetch(
      `https://api.github.com/repos/${repoFullName}/git/refs/heads/${defaultBranch}`,
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      },
    )

    const refData = await refResponse.json()
    const latestCommitSha = refData.object.sha

    // Get the base tree
    const baseTreeResponse = await fetch(
      `https://api.github.com/repos/${repoFullName}/git/commits/${latestCommitSha}`,
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      },
    )

    const baseTreeData = await baseTreeResponse.json()
    const baseTreeSha = baseTreeData.tree.sha

    // Prepare v0 files with font normalization
    const v0Files = chatDetails.files.map((file) => {
      const filePath: string =
        (file.meta?.file as string) || `file-${Date.now()}.${file.lang}`

      let content = file.source

      // Normalize fonts in layout files
      if (filePath === 'app/layout.tsx' || filePath.endsWith('/layout.tsx')) {
        console.log(`🔤 Processing font imports in ${filePath}`)
        content = detectAndNormalizeFonts(content)
      }

      return {
        path: filePath,
        mode: '100644' as const,
        type: 'blob' as const,
        content: content,
      }
    })

    // Get template files
    const v0FilePaths = v0Files.map((f) => f.path as string)
    const templateFiles = await getTemplateFilesForExport(
      v0FilePaths,
      chatDetails.files,
    )

    const templateTree = Object.entries(templateFiles).map(([path, content]) => ({
      path,
      mode: '100644' as const,
      type: 'blob' as const,
      content,
    }))

    // Combine and validate paths
    const tree = [...v0Files, ...templateTree].map((item) => {
      let fixedPath = item.path

      // Fix double nesting
      if (fixedPath.includes('components/ui/ui/')) {
        fixedPath = fixedPath.replace(/components\/ui\/ui\//g, 'components/ui/')
        console.log(`🔧 Fixed nested path: ${item.path} → ${fixedPath}`)
      }

      return { ...item, path: fixedPath }
    })

    console.log(`📂 Committing ${tree.length} files to GitHub...`)

    // Create tree with all files
    const treeResponse = await fetch(
      `https://api.github.com/repos/${repoFullName}/git/trees`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({
          base_tree: baseTreeSha,
          tree,
        }),
      },
    )

    const treeData = await treeResponse.json()

    // Create commit
    const commitResponse = await fetch(
      `https://api.github.com/repos/${repoFullName}/git/commits`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({
          message: `Add v0 generated files from chat ${chatId}`,
          tree: treeData.sha,
          parents: [latestCommitSha],
        }),
      },
    )

    const commitData = await commitResponse.json()

    // Update reference
    await fetch(
      `https://api.github.com/repos/${repoFullName}/git/refs/heads/${defaultBranch}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({
          sha: commitData.sha,
        }),
      },
    )

    console.log(`✅ Successfully committed ${tree.length} files to GitHub`)

    // ========================================
    // STEP 2: CREATE VERCEL PROJECT FROM GITHUB REPO
    // ========================================
    console.log('🔷 Step 2: Creating Vercel project from GitHub repo...')

    // Get GitHub username for the repo link
    const githubUsername = repoData.owner.login

    // Create Vercel project linked to GitHub repo
    const vercelProjectResponse = await fetch(
      'https://api.vercel.com/v9/projects',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${vercelToken}`,
        },
        body: JSON.stringify({
          name: projectName || repoName,
          gitRepository: {
            type: 'github',
            repo: `${githubUsername}/${repoName}`,
          },
          framework: 'nextjs',
          buildCommand: 'npm run build',
          devCommand: 'npm run dev',
          installCommand: 'npm install',
          outputDirectory: '.next',
          publicSource: !isPrivate,
        }),
      },
    )

    if (!vercelProjectResponse.ok) {
      const vercelError = await vercelProjectResponse.json()
      console.error('Vercel project creation failed:', vercelError)

      // GitHub repo was created successfully, so include that info
      return NextResponse.json(
        {
          error: 'GitHub export succeeded, but Vercel project creation failed',
          githubSuccess: true,
          repository: {
            name: repoName,
            url: githubRepoUrl,
            cloneUrl: repoData.clone_url,
          },
          vercelError: vercelError.error?.message || 'Unknown error',
          details: 'Your code is on GitHub. You can manually create the Vercel project from there.',
        },
        { status: 500 },
      )
    }

    const vercelProject = await vercelProjectResponse.json()
    console.log('✅ Vercel project created:', vercelProject.name)

    // ========================================
    // STEP 3: WAIT FOR PROJECT INITIALIZATION
    // ========================================
    console.log('⏳ Step 3: Waiting for Vercel project to initialize (20 seconds)...')
    console.log('   This allows Vercel to fully link the GitHub repo and configure webhooks.')
    
    // Wait 20 seconds for Vercel to fully set up the project connection
    await new Promise(resolve => setTimeout(resolve, 20000))
    
    console.log('✅ Wait complete, fetching updated project info...')

    // Fetch the project again to get the linked repo info
    let projectWithRepo = vercelProject
    try {
      const updatedProjectResponse = await fetch(
        `https://api.vercel.com/v9/projects/${vercelProject.id}`,
        {
          headers: {
            Authorization: `Bearer ${vercelToken}`,
          },
        },
      )
      
      if (updatedProjectResponse.ok) {
        projectWithRepo = await updatedProjectResponse.json()
        console.log('📋 Updated project info:', {
          hasLink: !!projectWithRepo.link,
          linkType: projectWithRepo.link?.type,
          repoId: projectWithRepo.link?.repoId,
        })
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch updated project info:', error)
    }

    // ========================================
    // STEP 4: TRIGGER DEPLOYMENT
    // ========================================
    console.log('🚀 Step 4: Triggering Vercel deployment...')

    // Try multiple deployment methods for reliability
    let deployment = null
    let deploymentError = null

    // Method 1: Trigger deployment with git source (using repoId if available)
    try {
      const gitSource: any = {
        type: 'github',
        repo: `${githubUsername}/${repoName}`,
        ref: defaultBranch,
      }
      
      // Add repoId if we have it from the linked project
      if (projectWithRepo.link?.repoId) {
        gitSource.repoId = projectWithRepo.link.repoId
        console.log('📌 Using repoId from project:', gitSource.repoId)
      }

      const deploymentResponse = await fetch(
        'https://api.vercel.com/v13/deployments',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${vercelToken}`,
          },
          body: JSON.stringify({
            name: vercelProject.name,
            project: vercelProject.id,
            gitSource: gitSource,
            target: 'production',
          }),
        },
      )

      if (deploymentResponse.ok) {
        deployment = await deploymentResponse.json()
        console.log('✅ Deployment triggered via git source:', deployment.url)
      } else {
        const error = await deploymentResponse.json()
        console.warn('⚠️ Git source deployment failed:', error)
        deploymentError = error

        // Method 2: Create a hook deployment (simpler approach)
        console.log('🔄 Attempting hook-based deployment...')
        
        const hookResponse = await fetch(
          `https://api.vercel.com/v1/integrations/deploy/${vercelProject.id}/${defaultBranch}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${vercelToken}`,
            },
          },
        )

        if (hookResponse.ok) {
          deployment = await hookResponse.json()
          console.log('✅ Deployment triggered via hook:', deployment)
        } else {
          const hookError = await hookResponse.json().catch(() => ({ error: 'Unknown error' }))
          console.warn('⚠️ Hook deployment also failed:', hookError)
          
          // Method 3: Try the redeploy endpoint as last resort
          console.log('🔄 Attempting redeploy endpoint...')
          
          const redeployResponse = await fetch(
            `https://api.vercel.com/v9/projects/${vercelProject.id}/redeploy`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${vercelToken}`,
              },
              body: JSON.stringify({
                target: 'production',
              }),
            },
          )

          if (redeployResponse.ok) {
            deployment = await redeployResponse.json()
            console.log('✅ Deployment triggered via redeploy:', deployment)
          } else {
            const redeployError = await redeployResponse.json()
            console.warn('⚠️ Redeploy also failed:', redeployError)
            deploymentError = redeployError
          }
        }
      }
    } catch (error) {
      console.error('❌ Deployment trigger error:', error)
      deploymentError = error
    }

    // If deployment failed, return partial success
    if (!deployment) {
      console.log('⚠️ Deployment trigger failed, but project is set up')
      
      const vercelDashboardUrl = `https://vercel.com/${vercelProject.accountId}/${vercelProject.name}`
      
      // Save partial deployment info to database
      try {
        await updateChatDeployment({
          v0ChatId: chatId,
          githubRepoName: repoName,
          githubRepoUrl: githubRepoUrl,
          vercelProjectId: vercelProject.id,
          vercelProjectUrl: vercelDashboardUrl,
          deploymentStatus: 'pending',
        })
        console.log('✅ Partial deployment info saved to database')
      } catch (dbError) {
        console.error('⚠️ Failed to save deployment info to database:', dbError)
      }
      
      return NextResponse.json(
        {
          partialSuccess: true,
          githubSuccess: true,
          vercelProjectSuccess: true,
          deploymentSuccess: false,
          repository: {
            name: repoName,
            url: githubRepoUrl,
            cloneUrl: repoData.clone_url,
          },
          vercelProject: {
            id: vercelProject.id,
            name: vercelProject.name,
            dashboardUrl: vercelDashboardUrl,
          },
          deploymentError: deploymentError?.error?.message || deploymentError?.message || 'Could not auto-trigger deployment',
          details: 'GitHub repo and Vercel project created successfully! Go to Vercel dashboard and click "Deploy" to start your first deployment.',
          instructions: [
            '1. Go to Vercel dashboard',
            '2. Click on your project',
            '3. Click "Deploy" button',
            '4. Your site will be live in ~2 minutes!',
          ],
        },
        { status: 200 },
      )
    }

    console.log('✅ Deployment successful!')

    // ========================================
    // STEP 5: SAVE DEPLOYMENT INFO TO DATABASE
    // ========================================
    console.log('💾 Step 5: Saving deployment info to database...')
    
    // Extract deployment URL (handle different response formats)
    const deployUrl = deployment.url || deployment.alias?.[0] || null
    const deploymentUrl = deployUrl ? `https://${deployUrl}` : null
    const vercelDashboardUrl = `https://vercel.com/${vercelProject.accountId}/${vercelProject.name}`
    
    // Save deployment information to database
    try {
      await updateChatDeployment({
        v0ChatId: chatId,
        githubRepoName: repoName,
        githubRepoUrl: githubRepoUrl,
        vercelProjectId: vercelProject.id,
        vercelProjectUrl: vercelDashboardUrl,
        vercelDeploymentUrl: deploymentUrl || vercelDashboardUrl,
        deploymentStatus: 'deployed',
      })
      console.log('✅ Deployment info saved to database')
    } catch (dbError) {
      console.error('⚠️ Failed to save deployment info to database:', dbError)
      // Don't fail the whole deployment if database save fails
    }

    // ========================================
    // SUCCESS - RETURN COMPLETE INFO
    // ========================================
    
    return NextResponse.json({
      success: true,
      message: 'Successfully exported to GitHub and deployed to Vercel!',
      repository: {
        name: repoName,
        url: githubRepoUrl,
        cloneUrl: repoData.clone_url,
        branch: defaultBranch,
        fullName: repoFullName,
      },
      vercelProject: {
        id: vercelProject.id,
        name: vercelProject.name,
        framework: 'nextjs',
        dashboardUrl: `https://vercel.com/${vercelProject.accountId}/${vercelProject.name}`,
      },
      deployment: {
        id: deployment.id || deployment.uid,
        url: deployUrl,
        readyState: deployment.readyState || deployment.state || 'BUILDING',
        deploymentUrl: deploymentUrl,
        inspectorUrl: deployment.inspectorUrl || `https://vercel.com/${vercelProject.accountId}/${vercelProject.name}`,
      },
      filesCreated: tree.length,
      steps: {
        github: '✅ Code exported to GitHub',
        vercel: '✅ Vercel project created',
        deployment: '✅ Deployment triggered',
      },
      note: 'Deployment is building. Visit the Vercel dashboard to monitor progress.',
    })
  } catch (error) {
    console.error('Integrated deployment error:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Failed to complete deployment',
          details: error.message,
          githubRepo: githubRepoUrl || undefined,
          message: githubRepoUrl
            ? 'GitHub export may have succeeded, check the repository URL above'
            : 'Deployment failed before GitHub export',
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to complete deployment' },
      { status: 500 },
    )
  }
}

