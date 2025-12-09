'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Rocket, Loader2, ExternalLink, CheckCircle2, Zap } from 'lucide-react'
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

type DeployMethod = 'v0' | 'vercel-direct'

export function DeployButtonEnhanced({
  chatId,
  variant = 'default',
  size = 'default',
  className = '',
}: DeployButtonEnhancedProps) {
  const [isDeploying, setIsDeploying] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [deployMethod, setDeployMethod] = useState<DeployMethod>('v0')
  const [deploymentUrl, setDeploymentUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDeploy = async () => {
    setIsDeploying(true)
    setError(null)

    try {
      const endpoint =
        deployMethod === 'vercel-direct'
          ? '/api/deploy/vercel-direct'
          : '/api/deploy'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          projectName: projectName || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (deployMethod === 'vercel-direct') {
          if (data.error === 'Vercel token not configured') {
            setError(
              'Vercel token not found. Add VERCEL_TOKEN to your .env.local file.',
            )
          } else {
            setError(data.details || data.error || 'Deployment failed')
          }
        } else {
          if (data.needsFirstDeployment) {
            // Special case: first deployment must be from v0.dev
            setError(data.details || data.error)
            // Optionally, could auto-open v0.dev in a new tab
            if (data.v0Url) {
              console.log('First deployment needed. Visit:', data.v0Url)
            }
          } else if (
            data.error === 'Vercel integration not configured' ||
            data.error === 'Vercel account not linked'
          ) {
            setError(
              data.details || 'Please connect your Vercel account on v0.dev first, then try again.',
            )
          } else {
            setError(data.details || data.error || 'Deployment failed')
          }
        }
        return
      }

      // Success!
      setDeploymentUrl(
        data.deployment?.vercelUrl ||
          data.deployment?.url ||
          `https://v0.dev/chat/${chatId}`,
      )
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
    setProjectName('')
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

          {deploymentUrl ? (
            // Success state
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Deployment Created!
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    Your app is being deployed to Vercel.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <a
                    href={deploymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Deployment
                  </a>
                </Button>
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
                  {deployMethod === 'v0' ? (
                    <>
                      <strong>✅ Via v0 (Recommended):</strong> Full source code deployment.
                      Requires Vercel connected on v0.dev. Deploys actual React/Next.js files.
                    </>
                  ) : (
                    <>
                      <strong>⚠️ Direct API (Beta):</strong> Creates redirect to v0's hosted version.
                      Not a full code deployment. For full deployment, use "Via v0" method.
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

