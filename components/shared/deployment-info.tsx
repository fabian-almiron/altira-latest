'use client'

import { useState } from 'react'
import { ExternalLink, Copy, Check, Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface DeploymentInfoProps {
  githubRepoUrl?: string
  vercelProjectUrl?: string
  vercelDeploymentUrl?: string
  className?: string
}

export function DeploymentInfo({
  githubRepoUrl,
  vercelProjectUrl,
  vercelDeploymentUrl,
  className = '',
}: DeploymentInfoProps) {
  const [copied, setCopied] = useState(false)

  // Don't render if no deployment info
  if (!githubRepoUrl && !vercelProjectUrl && !vercelDeploymentUrl) {
    return null
  }

  const handleCopyGithubUrl = async () => {
    if (!githubRepoUrl) return
    
    try {
      await navigator.clipboard.writeText(githubRepoUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <TooltipProvider>
        {/* GitHub Repo with Copy */}
        {githubRepoUrl && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyGithubUrl}
                className="flex items-center gap-1.5 h-8 px-2.5 text-xs"
              >
                <Github className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">GitHub</span>
                {copied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Copy GitHub repository URL</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* View on Vercel (Dashboard) */}
        {vercelProjectUrl && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(vercelProjectUrl, '_blank')}
                className="flex items-center gap-1.5 h-8 px-2.5 text-xs"
              >
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 76 65"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                </svg>
                <span className="hidden sm:inline">Dashboard</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">View project on Vercel</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* View Live URL */}
        {vercelDeploymentUrl && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                onClick={() => window.open(vercelDeploymentUrl, '_blank')}
                className="flex items-center gap-1.5 h-8 px-2.5 text-xs bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>View Live</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Open live deployment</p>
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  )
}

