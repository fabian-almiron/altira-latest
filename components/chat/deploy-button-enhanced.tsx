'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Rocket, Loader2, ExternalLink, CheckCircle2, Github } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface DeployButtonEnhancedProps {
  chatId: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function DeployButtonEnhanced({
  chatId,
  variant = 'default',
  size = 'default',
  className = '',
}: DeployButtonEnhancedProps) {
  const [isDeploying, setIsDeploying] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [repoName, setRepoName] = useState('')
  const deployMethod = 'github-vercel' // Only GitHub + Vercel deployment
  const [deploymentUrl, setDeploymentUrl] = useState<string | null>(null)
  const [githubRepoUrl, setGithubRepoUrl] = useState<string | null>(null)
  const [vercelDashboard, setVercelDashboard] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDeploy = async () => {
    setIsDeploying(true)
    setError(null)

    try {
      // GitHub + Vercel deployment only
        if (!repoName) {
        setError('Repository name is required')
          setIsDeploying(false)
          return
        }

      const endpoint = '/api/deploy/github-vercel'
      const requestBody = {
          chatId,
          repoName: repoName || `v0-${chatId.slice(0, 8)}`,
          projectName: projectName || undefined,
          isPrivate: true,
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle GitHub + Vercel specific errors
          if (data.error?.includes('GitHub token')) {
            setError(
              'GitHub token not configured. Add GITHUB_TOKEN to your .env.local file.',
            )
          } else if (data.error?.includes('Vercel token')) {
            setError(
              'Vercel token not configured. Add VERCEL_TOKEN to your .env.local file.',
            )
          } else if (data.error?.includes('already exists')) {
            setError(
              'Repository already exists on GitHub. Please choose a different name.',
            )
          } else {
            setError(data.details || data.error || 'Deployment failed')
        }
        return
      }

      // Success! GitHub + Vercel deployment
      if (data.success) {
        setGithubRepoUrl(data.repository?.url || null)
        setVercelDashboard(data.vercelProject?.dashboardUrl || null)
        setDeploymentUrl(data.deployment?.deploymentUrl || null)
      }
      
      console.log('Deployment successful:', data)
    } catch (err) {
      console.error('Deployment error:', err)
      setError('Failed to create deployment. Please try again.')
    } finally {
      setIsDeploying(false)
    }
  }

  const handleClose = () => {
    setShowDialog(false)
    setError(null)
    setDeploymentUrl(null)
    setGithubRepoUrl(null)
    setVercelDashboard(null)
    setProjectName('')
    setRepoName('')
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setShowDialog(true)}
        disabled={!chatId}
      >
        <Rocket className="h-4 w-4 mr-2" />
        Deploy to Vercel
      </Button>

      <Dialog open={showDialog} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              Deploy to Vercel
            </DialogTitle>
            <DialogDescription>
              {deploymentUrl
                ? 'Your deployment has been initiated!'
                : 'Deploy your app to GitHub with automatic Vercel deployment.'}
            </DialogDescription>
          </DialogHeader>

          {deploymentUrl || githubRepoUrl ? (
            // Success state
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Deployment Successful!
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    Your code is on GitHub and deploying to Vercel!
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {githubRepoUrl && (
                  <Button variant="outline" className="w-full" asChild>
                    <a
                      href={githubRepoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      View on GitHub
                    </a>
                  </Button>
                )}
                {deploymentUrl && (
                  <Button variant="outline" className="w-full" asChild>
                    <a
                      href={deploymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Live Site
                    </a>
                  </Button>
                )}
                {vercelDashboard && (
                  <Button variant="outline" className="w-full" asChild>
                    <a
                      href={vercelDashboard}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Rocket className="h-4 w-4 mr-2" />
                      Vercel Dashboard
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            // Deploy form
            <div className="space-y-4 py-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {error}
                  </p>
                  {error.includes('v0.dev') && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 mt-2 text-red-600 dark:text-red-400"
                      asChild
                    >
                      <a
                        href="https://v0.dev/settings/integrations"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Connect Vercel on v0.dev →
                      </a>
                    </Button>
                  )}
                  {error.includes('VERCEL_TOKEN') && (
                    <p className="text-xs text-red-700 dark:text-red-300 mt-2">
                      Get your token from{' '}
                      <a
                        href="https://vercel.com/account/tokens"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        vercel.com/account/tokens
                      </a>
                    </p>
                  )}
                </div>
              )}

                <div className="space-y-2">
                  <Label htmlFor="repo-name">
                    Repository Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="repo-name"
                    placeholder={`my-app-${chatId.slice(0, 6)}`}
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Choose a unique name for your GitHub repository
                  </p>
                </div>

              <div className="space-y-2">
                <Label htmlFor="project-name">
                  Project Name <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <Input
                  id="project-name"
                  placeholder={`v0-${chatId.slice(0, 8)}`}
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            {deploymentUrl ? (
              <Button onClick={handleClose}>Close</Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleDeploy} disabled={isDeploying}>
                  {isDeploying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4 mr-2" />
                      Deploy Now
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

