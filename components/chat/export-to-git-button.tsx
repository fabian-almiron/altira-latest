'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
import { GitBranch, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react'

interface ExportToGitButtonProps {
  chatId: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function ExportToGitButton({
  chatId,
  variant = 'outline',
  size = 'default',
  className,
}: ExportToGitButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportMethod, setExportMethod] = useState<'github' | 'bitbucket'>(
    'github',
  )
  const [repoName, setRepoName] = useState('')
  const [workspace, setWorkspace] = useState('') // For Bitbucket
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    url: string
    cloneUrl: string
    filesCreated: number
  } | null>(null)

  const handleExport = async () => {
    if (!repoName.trim()) {
      setError('Please enter a repository name')
      return
    }

    if (exportMethod === 'bitbucket' && !workspace.trim()) {
      setError('Please enter your Bitbucket workspace')
      return
    }

    setIsExporting(true)
    setError(null)

    try {
      const endpoint =
        exportMethod === 'github'
          ? '/api/export/github'
          : '/api/export/bitbucket'

      const body: any = {
        chatId,
        repoName: repoName.trim(),
      }

      if (exportMethod === 'bitbucket') {
        body.workspace = workspace.trim()
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.details || data.error || 'Export failed')
        return
      }

      // Success!
      setResult({
        url: data.repository.url,
        cloneUrl: data.repository.cloneUrl,
        filesCreated: data.filesCreated,
      })
      console.log('Export successful:', data)
    } catch (err) {
      console.error('Export error:', err)
      setError('Failed to export. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleClose = () => {
    setIsDialogOpen(false)
    setError(null)
    setResult(null)
    setRepoName('')
    setWorkspace('')
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsDialogOpen(true)}
        disabled={!chatId}
      >
        <GitBranch className="h-4 w-4 mr-2" />
        Export to Git
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Export to Git Repository
            </DialogTitle>
            <DialogDescription>
              {result
                ? 'Your code has been exported successfully!'
                : 'Create a new repository and push your generated code.'}
            </DialogDescription>
          </DialogHeader>

          {result ? (
            // Success state
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Repository Created!
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    {result.filesCreated} files exported successfully.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Button variant="default" className="w-full" asChild>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Repository
                  </a>
                </Button>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">
                    Clone URL:
                  </p>
                  <code className="text-xs break-all">{result.cloneUrl}</code>
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  💡 <strong>Next steps:</strong> Clone the repository locally,
                  then deploy to Vercel by importing from{' '}
                  {exportMethod === 'github' ? 'GitHub' : 'Bitbucket'}!
                </p>
              </div>
            </div>
          ) : (
            // Form state
            <div className="space-y-4">
              {error && (
                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="export-method">Git Platform</Label>
                <Select
                  value={exportMethod}
                  onValueChange={(value: 'github' | 'bitbucket') =>
                    setExportMethod(value)
                  }
                  disabled={isExporting}
                >
                  <SelectTrigger id="export-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="github">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4" />
                        <div>
                          <div className="font-medium">GitHub</div>
                          <div className="text-xs text-muted-foreground">
                            Most popular, easy Vercel integration
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="bitbucket">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Bitbucket</div>
                          <div className="text-xs text-muted-foreground">
                            Atlassian ecosystem integration
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="repo-name">Repository Name</Label>
                <Input
                  id="repo-name"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  placeholder="my-v0-project"
                  disabled={isExporting}
                />
              </div>

              {exportMethod === 'bitbucket' && (
                <div className="space-y-2">
                  <Label htmlFor="workspace">Bitbucket Workspace</Label>
                  <Input
                    id="workspace"
                    value={workspace}
                    onChange={(e) => setWorkspace(e.target.value)}
                    placeholder="your-workspace-name"
                    disabled={isExporting}
                  />
                </div>
              )}

              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  📝 <strong>Setup Required:</strong> Add{' '}
                  {exportMethod === 'github'
                    ? 'GITHUB_TOKEN'
                    : 'BITBUCKET_USERNAME and BITBUCKET_APP_PASSWORD'}{' '}
                  to your .env.local file.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            {result ? (
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isExporting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={isExporting || !repoName.trim()}
                >
                  {isExporting ? 'Exporting...' : 'Export Now'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

