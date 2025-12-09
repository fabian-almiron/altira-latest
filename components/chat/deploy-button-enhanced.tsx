'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Rocket, Loader2, ExternalLink, CheckCircle2, Zap, GitBranch, Github } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DeployButtonEnhancedProps {
  chatId: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

type DeployMethod = 'github-vercel' | 'v0' | 'vercel-direct'

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
  const [deployMethod, setDeployMethod] = useState<DeployMethod>('github-vercel')
  const [deploymentUrl, setDeploymentUrl] = useState<string | null>(null)
  const [githubRepoUrl, setGithubRepoUrl] = useState<string | null>(null)
  const [vercelDashboard, setVercelDashboard] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDeploy = async () => {
    setIsDeploying(true)
    setError(null)

    try {
      let endpoint = '/api/deploy'
      let requestBody: any = { chatId }

      // Determine endpoint and body based on deploy method
      if (deployMethod === 'github-vercel') {
        endpoint = '/api/deploy/github-vercel'
        if (!repoName) {
          setError('Repository name is required for GitHub + Vercel deployment')
          setIsDeploying(false)
          return
        }
        requestBody = {
          chatId,
          repoName: repoName || `v0-${chatId.slice(0, 8)}`,
          projectName: projectName || undefined,
          isPrivate: true,
        }
      } else if (deployMethod === 'vercel-direct') {
        endpoint = '/api/deploy/vercel-direct'
        requestBody.projectName = projectName || undefined
      } else {
        requestBody.projectName = projectName || undefined
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
        if (deployMethod === 'github-vercel') {
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
        } else if (deployMethod === 'vercel-direct') {
          if (data.error === 'Vercel token not configured') {
            setError(
              'Vercel token not found. Add VERCEL_TOKEN to your .env.local file.',
            )
          } else {
            setError(data.details || data.error || 'Deployment failed')
          }
        } else {
          if (data.needsFirstDeployment) {
            setError(data.details || data.error)
            if (data.v0Url) {
              console.log('First deployment needed. Visit:', data.v0Url)
            }
          } else if (
            data.error === 'Vercel integration not configured' ||
            data.error === 'Vercel account not linked'
          ) {
            setError(
              data.details || 'Please connect your Vercel account on v0.dev first.',
            )
          } else {
            setError(data.details || data.error || 'Deployment failed')
          }
        }
        return
      }

      // Success! Handle different response formats
      if (deployMethod === 'github-vercel' && data.success) {
        // GitHub + Vercel deployment
        setGithubRepoUrl(data.repository?.url || null)
        setVercelDashboard(data.vercelProject?.dashboardUrl || null)
        setDeploymentUrl(data.deployment?.deploymentUrl || null)
      } else {
        // Other deployment methods
        setDeploymentUrl(
          data.deployment?.vercelUrl ||
            data.deployment?.url ||
            `https://v0.dev/chat/${chatId}`,
        )
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
                : 'Choose your deployment method and deploy your app.'}
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
                    {deployMethod === 'github-vercel' 
                      ? 'Your code is on GitHub and deploying to Vercel!'
                      : 'Your app is being deployed to Vercel.'}
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
                {deployMethod !== 'github-vercel' && (
                  <Button
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <a
                      href={`https://v0.dev/chat/${chatId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on v0.dev
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
                <Label htmlFor="deploy-method">Deployment Method</Label>
                <Select
                  value={deployMethod}
                  onValueChange={(value: DeployMethod) =>
                    setDeployMethod(value)
                  }
                >
                  <SelectTrigger id="deploy-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="github-vercel">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4" />
                        <div>
                          <div className="font-medium">GitHub + Vercel ✨</div>
                          <div className="text-xs text-muted-foreground">
                            Full code on GitHub, auto-deploy to Vercel
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="v0">
                      <div className="flex items-center gap-2">
                        <Rocket className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Via v0 (Full Deployment)</div>
                          <div className="text-xs text-muted-foreground">
                            Deploys actual source code files
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="vercel-direct">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Direct API (Redirect Only)</div>
                          <div className="text-xs text-muted-foreground">
                            Creates redirect to v0 preview
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {deployMethod === 'github-vercel' && (
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
              )}

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

              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  {deployMethod === 'github-vercel' ? (
                    <>
                      <strong>✨ GitHub + Vercel (Recommended):</strong> Full production setup!
                      Code on GitHub with version control + automatic Vercel deployment.
                      Requires GITHUB_TOKEN and VERCEL_TOKEN in .env.local
                    </>
                  ) : deployMethod === 'v0' ? (
                    <>
                      <strong>✅ Via v0:</strong> Full source code deployment.
                      Requires Vercel connected on v0.dev. Deploys actual React/Next.js files.
                    </>
                  ) : (
                    <>
                      <strong>⚠️ Direct API (Beta):</strong> Creates redirect to v0's hosted version.
                      Not a full code deployment. For production, use "GitHub + Vercel" method.
                    </>
                  )}
                </p>
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

