import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'v0-sdk'
import { getClerkAuth } from '@/lib/clerk-auth'
import { getChatOwnership } from '@/lib/db/queries'
import { getTemplateFilesForExport, detectAndNormalizeFonts } from '@/lib/export-templates'

const v0 = createClient(
  process.env.V0_API_URL ? { baseUrl: process.env.V0_API_URL } : {},
)

/**
 * Validates and fixes incorrectly nested file paths
 * Prevents components/ui/ui/ nesting issues
 */
function validateAndFixFilePaths(
  tree: Array<{ path: string; mode: '100644'; type: 'blob'; content: string }>
): Array<{ path: string; mode: '100644'; type: 'blob'; content: string }> {
  return tree.map((item): { path: string; mode: '100644'; type: 'blob'; content: string } => {
    let fixedPath = item.path
    
    // Fix double nesting: components/ui/ui/ -> components/ui/
    if (fixedPath.includes('components/ui/ui/')) {
      const originalPath = fixedPath
      fixedPath = fixedPath.replace(/components\/ui\/ui\//g, 'components/ui/')
      console.log(`🔧 Fixed nested path: ${originalPath} → ${fixedPath}`)
    }
    
    // Fix any other duplicate directory patterns
    const pathParts = fixedPath.split('/')
    const seen = new Set<string>()
    const fixedParts: string[] = []
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i]
      // Check for consecutive duplicate directory names
      if (i > 0 && part === pathParts[i - 1]) {
        console.log(`🔧 Removed duplicate directory: ${part} in ${fixedPath}`)
        continue // Skip duplicate
      }
      fixedParts.push(part)
    }
    // Always add the filename (last part)
    fixedParts.push(pathParts[pathParts.length - 1])
    
    const finalPath = fixedParts.join('/')
    
    if (finalPath !== item.path) {
      console.log(`🔧 Final path fix: ${item.path} → ${finalPath}`)
    }
    
    return {
      path: finalPath,
      mode: item.mode,
      type: item.type,
      content: item.content
    }
  })
}

export async function POST(request: NextRequest) {
  let chatId: string = ''

  try {
    const session = await getClerkAuth()
    const body = await request.json()
    chatId = body.chatId
    const repoName = body.repoName
    const isPrivate = body.isPrivate !== false // Default to private

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

    // Check GitHub token
    const githubToken = process.env.GITHUB_TOKEN

    if (!githubToken) {
      return NextResponse.json(
        {
          error: 'GitHub token not configured',
          details: 'Please add GITHUB_TOKEN to .env.local',
        },
        { status: 500 },
      )
    }

    // Check ownership if user is authenticated
    if (session?.userId) {
      const ownership = await getChatOwnership({ v0ChatId: chatId })

      if (!ownership || ownership.user_id !== session.user.id) {
        return NextResponse.json(
          { error: 'You do not have permission to export this chat' },
          { status: 403 },
        )
      }
    }

    console.log('Exporting chat to GitHub:', chatId)

    // 1. Get chat details and files from v0
    const chatDetails = await v0.chats.getById({ chatId })

    if (!chatDetails.files || chatDetails.files.length === 0) {
      return NextResponse.json(
        { error: 'No files found in this chat' },
        { status: 400 },
      )
    }

    console.log(`Found ${chatDetails.files.length} files to export`)

    // 2. Create GitHub repository
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
          auto_init: true, // Initialize with README
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
            details:
              'A repository with this name already exists. Please choose a different name.',
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
    console.log('GitHub repo created:', repoData.html_url)

    // Get default branch
    const defaultBranch = repoData.default_branch || 'main'

    // Get the latest commit SHA
    const refResponse = await fetch(
      `https://api.github.com/repos/${repoData.full_name}/git/refs/heads/${defaultBranch}`,
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
      `https://api.github.com/repos/${repoData.full_name}/git/commits/${latestCommitSha}`,
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

    // 3. Create tree with all files (v0 files + template files)
    
    // Get v0 files and normalize fonts in layout files
    const v0Files = chatDetails.files.map((file) => {
      const filePath: string =
        (file.meta?.file as string) || `file-${Date.now()}.${file.lang}`

      let content = file.source
      
      // If this is a layout file, detect and normalize fonts
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

    // Get template files that v0 didn't provide
    // Pass both file paths AND full file data for dynamic shadcn component fetching
    const v0FilePaths = v0Files.map((f): string => f.path as string)
    const templateFiles = await getTemplateFilesForExport(v0FilePaths, chatDetails.files)
    
    const templateTree = Object.entries(templateFiles).map(([path, content]) => ({
      path,
      mode: '100644' as const,
      type: 'blob' as const,
      content,
    }))

    // Combine both
    const combinedTree: Array<{ path: string; mode: '100644'; type: 'blob'; content: string }> = [...v0Files, ...templateTree]
    
    console.log(`Exporting ${v0Files.length} v0 files + ${templateTree.length} template files`)
    console.log(`📂 Template files being exported:`, templateTree.map(f => f.path))
    console.log(`📂 UI component files (before validation):`, templateTree.filter(f => f.path.startsWith('components/ui/')).map(f => f.path))
    
    // Validate and fix any nested paths
    const tree = validateAndFixFilePaths(combinedTree)
    
    console.log(`📂 UI component files (after validation):`, tree.filter(f => f.path.startsWith('components/ui/')).map(f => f.path))

    const treeResponse = await fetch(
      `https://api.github.com/repos/${repoData.full_name}/git/trees`,
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

    // 4. Create commit
    const commitResponse = await fetch(
      `https://api.github.com/repos/${repoData.full_name}/git/commits`,
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

    // 5. Update reference
    await fetch(
      `https://api.github.com/repos/${repoData.full_name}/git/refs/heads/${defaultBranch}`,
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

    console.log(`Successfully committed ${tree.length} files to GitHub repo`)

    return NextResponse.json({
      success: true,
      repository: {
        name: repoName,
        url: repoData.html_url,
        cloneUrl: repoData.clone_url,
        branch: defaultBranch,
      },
      filesCreated: tree.length,
      files: tree.map((t) => t.path),
      message: 'Code exported to GitHub successfully',
    })
  } catch (error) {
    console.error('GitHub export error:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Failed to export to GitHub',
          details: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to export to GitHub' },
      { status: 500 },
    )
  }
}

