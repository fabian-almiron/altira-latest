import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'v0-sdk'
import { auth } from '@/app/(auth)/auth'
import { getChatOwnership } from '@/lib/db/queries'
import { getTemplateFilesForExport, detectAndNormalizeFonts } from '@/lib/export-templates'

const v0 = createClient(
  process.env.V0_API_URL ? { baseUrl: process.env.V0_API_URL } : {},
)

/**
 * Validates and fixes incorrectly nested file paths
 * Prevents components/ui/ui/ nesting issues
 */
function validateAndFixFilePath(filePath: string): string {
  let fixedPath = filePath
  
  // Fix double nesting: components/ui/ui/ -> components/ui/
  if (fixedPath.includes('components/ui/ui/')) {
    const originalPath = fixedPath
    fixedPath = fixedPath.replace(/components\/ui\/ui\//g, 'components/ui/')
    console.log(`🔧 Fixed nested path: ${originalPath} → ${fixedPath}`)
  }
  
  // Fix any other duplicate directory patterns
  const pathParts = fixedPath.split('/')
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
  
  if (finalPath !== filePath) {
    console.log(`🔧 Final path fix: ${filePath} → ${finalPath}`)
  }
  
  return finalPath
}

export async function POST(request: NextRequest) {
  let chatId: string = ''

  try {
    const session = await auth()
    const body = await request.json()
    chatId = body.chatId
    const repoName = body.repoName
    const bitbucketWorkspace = body.workspace // Bitbucket workspace/username

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

    // Check Bitbucket credentials
    const bitbucketUsername = process.env.BITBUCKET_USERNAME
    const bitbucketAppPassword = process.env.BITBUCKET_APP_PASSWORD

    if (!bitbucketUsername || !bitbucketAppPassword || !bitbucketWorkspace) {
      return NextResponse.json(
        {
          error: 'Bitbucket credentials not configured',
          details:
            'Please add BITBUCKET_USERNAME and BITBUCKET_APP_PASSWORD to .env.local',
        },
        { status: 500 },
      )
    }

    // Check ownership if user is authenticated
    if (session?.user?.id) {
      const ownership = await getChatOwnership({ v0ChatId: chatId })

      if (!ownership || ownership.user_id !== session.user.id) {
        return NextResponse.json(
          { error: 'You do not have permission to export this chat' },
          { status: 403 },
        )
      }
    }

    console.log('Exporting chat to Bitbucket:', chatId)

    // 1. Get chat details and files from v0
    const chatDetails = await v0.chats.getById({ chatId })

    if (!chatDetails.files || chatDetails.files.length === 0) {
      return NextResponse.json(
        { error: 'No files found in this chat' },
        { status: 400 },
      )
    }

    console.log(`Found ${chatDetails.files.length} files to export`)

    // 2. Create Bitbucket repository
    const createRepoResponse = await fetch(
      `https://api.bitbucket.org/2.0/repositories/${bitbucketWorkspace}/${repoName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(`${bitbucketUsername}:${bitbucketAppPassword}`).toString('base64')}`,
        },
        body: JSON.stringify({
          scm: 'git',
          is_private: true,
          description: `Generated from v0 chat: ${chatDetails.title || chatId}`,
        }),
      },
    )

    if (!createRepoResponse.ok) {
      const errorData = await createRepoResponse.json()
      console.error('Bitbucket repo creation failed:', errorData)

      // Check if repo already exists
      if (createRepoResponse.status === 400) {
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
          error: 'Failed to create Bitbucket repository',
          details: errorData.error?.message || 'Unknown error',
        },
        { status: 500 },
      )
    }

    const repoData = await createRepoResponse.json()
    console.log('Bitbucket repo created:', repoData.links.html.href)

    // 3. Push files to repository
    // For each file, commit it to the repo
    const filesCreated = []

    // Get template files that v0 didn't provide
    // Pass both file paths AND full file data for dynamic shadcn component fetching
    const v0FilePaths = chatDetails.files.map((f): string => {
      return (f.meta?.file as string) || `file-${Date.now()}.${f.lang}`
    })
    const templateFiles = await getTemplateFilesForExport(v0FilePaths, chatDetails.files)
    
    console.log(`Exporting ${chatDetails.files.length} v0 files + ${Object.keys(templateFiles).length} template files`)

    // Push v0 files
    for (const file of chatDetails.files) {
      let filePath: string = (file.meta?.file as string) || `file-${filesCreated.length}.${file.lang}`
      filePath = validateAndFixFilePath(filePath)

      // Normalize fonts in layout files
      let content = file.source
      if (filePath === 'app/layout.tsx' || filePath.endsWith('/layout.tsx')) {
        console.log(`🔤 Processing font imports in ${filePath}`)
        content = detectAndNormalizeFonts(content)
      }

      try {
        // Commit file to Bitbucket
        const commitResponse = await fetch(
          `https://api.bitbucket.org/2.0/repositories/${bitbucketWorkspace}/${repoName}/src`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${Buffer.from(`${bitbucketUsername}:${bitbucketAppPassword}`).toString('base64')}`,
            },
            body: new URLSearchParams({
              [filePath]: content,
              message: `Add ${filePath}`,
              branch: 'main',
            }),
          },
        )

        if (commitResponse.ok) {
          filesCreated.push(filePath)
          console.log(`Committed: ${filePath}`)
        } else {
          console.warn(
            `Failed to commit ${filePath}:`,
            await commitResponse.text(),
          )
        }
      } catch (error) {
        console.error(`Error committing ${filePath}:`, error)
      }
    }

    // Push template files
    for (const [originalPath, content] of Object.entries(templateFiles)) {
      const filePath = validateAndFixFilePath(originalPath)
      try {
        const commitResponse = await fetch(
          `https://api.bitbucket.org/2.0/repositories/${bitbucketWorkspace}/${repoName}/src`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${Buffer.from(`${bitbucketUsername}:${bitbucketAppPassword}`).toString('base64')}`,
            },
            body: new URLSearchParams({
              [filePath]: content,
              message: `Add ${filePath} (template)`,
              branch: 'main',
            }),
          },
        )

        if (commitResponse.ok) {
          filesCreated.push(filePath)
          console.log(`Committed template: ${filePath}`)
        } else {
          console.warn(
            `Failed to commit template ${filePath}:`,
            await commitResponse.text(),
          )
        }
      } catch (error) {
        console.error(`Error committing template ${filePath}:`, error)
      }
    }

    console.log(
      `Successfully created ${filesCreated.length} files in Bitbucket repo`,
    )

    return NextResponse.json({
      success: true,
      repository: {
        name: repoName,
        url: repoData.links.html.href,
        cloneUrl: repoData.links.clone.find((c: any) => c.name === 'https')
          ?.href,
      },
      filesCreated: filesCreated.length,
      files: filesCreated,
      message: 'Code exported to Bitbucket successfully',
    })
  } catch (error) {
    console.error('Bitbucket export error:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Failed to export to Bitbucket',
          details: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to export to Bitbucket' },
      { status: 500 },
    )
  }
}

