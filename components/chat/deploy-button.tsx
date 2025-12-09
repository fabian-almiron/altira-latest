'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Rocket, Loader2, ExternalLink, CheckCircle2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface DeployButtonProps {
  chatId: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function DeployButton({
  chatId,
  variant = 'default',
  size = 'default',
  className = '',
}: DeployButtonProps) {
  const [isDeploying, setIsDeploying] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [deploymentUrl, setDeploymentUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDeploy = async () => {
    setIsDeploying(true)
    setError(null)

    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          // projectId and versionId are optional
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Check if it's a Vercel integration error
        if (data.error === 'Vercel integration not configured') {
          setError(
            'Please connect your Vercel account on v0.dev first, then try again.',
          )
        } else {
          setError(data.details || data.error || 'Deployment failed')
        }
        return
      }

      // Success!
      setDeploymentUrl(data.deployment?.url || `https://v0.dev/chat/${chatId}`)
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
                : 'Deploy your generated app to Vercel with one click.'}
            </DialogDescription>
          </DialogHeader>

          {deploymentUrl ? (
            // Success state
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
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
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  View your deployment status on v0.dev:
                </p>
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
                    Open on v0.dev
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
                  {error.includes('Vercel account') && (
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
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Prerequisites:</strong>
                </p>
                <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1 list-disc list-inside">
                  <li>Vercel account connected on v0.dev</li>
                  <li>Project must be saved on v0.dev</li>
                </ul>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  💡 <strong>Tip:</strong> If this is your first deployment, you may
                  need to configure your Vercel integration on v0.dev first.
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

