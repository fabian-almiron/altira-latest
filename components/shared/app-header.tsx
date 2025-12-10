'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useSearchParams } from 'next/navigation'
import { ChatSelector } from './chat-selector'
import { MobileMenu } from './mobile-menu'
import { DeploymentInfo } from './deployment-info'
import { UserNav } from '@/components/user-nav'
import { Button } from '@/components/ui/button'
import { VercelIcon, GitHubIcon } from '@/components/ui/icons'
import { DEPLOY_URL } from '@/lib/constants'
import { Info } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import useSWR from 'swr'

interface AppHeaderProps {
  className?: string
}

// Component that uses useSearchParams - needs to be wrapped in Suspense
function SearchParamsHandler() {
  const searchParams = useSearchParams()

  // Clean up URL parameters after auth redirect
  useEffect(() => {
    const shouldRefresh = searchParams.get('refresh') === 'session'

    if (shouldRefresh) {
      // Clean up URL without causing navigation
      const url = new URL(window.location.href)
      url.searchParams.delete('refresh')
      window.history.replaceState({}, '', url.pathname)
    }
  }, [searchParams])

  return null
}

export function AppHeader({ className = '' }: AppHeaderProps) {
  const pathname = usePathname()
  const isHomepage = pathname === '/'
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false)

  // Extract chat ID from URL
  const chatId = pathname.includes('/chats/') 
    ? pathname.split('/chats/')[1]?.split('/')[0]
    : null

  // Fetch deployment info for current chat
  const { data: deploymentInfo, mutate: refreshDeploymentInfo } = useSWR(
    chatId ? `/api/chat/deployment?chatId=${chatId}` : null,
    (url: string) => fetch(url).then((res) => res.ok ? res.json() : null),
    { revalidateOnFocus: false }
  )
  
  // Store refresh function globally so other components can trigger it
  useEffect(() => {
    if (chatId && typeof window !== 'undefined') {
      (window as any).__refreshDeploymentInfo = refreshDeploymentInfo
    }
  }, [chatId, refreshDeploymentInfo])

  // Handle logo click - reset UI if on homepage, otherwise navigate to homepage
  const handleLogoClick = (e: React.MouseEvent) => {
    if (isHomepage) {
      e.preventDefault()
      // Add reset parameter to trigger UI reset
      window.location.href = '/?reset=true'
    }
    // If not on homepage, let the Link component handle navigation normally
  }

  return (
    <div
      className={`bg-white dark:bg-gray-900 ${!isHomepage ? 'border-b border-gray-200 dark:border-gray-800' : ''} ${className}`}
    >
      {/* Handle search params with Suspense boundary */}
      <Suspense fallback={null}>
        <SearchParamsHandler />
      </Suspense>

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Selector */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              onClick={handleLogoClick}
              className="flex items-center text-gray-900 dark:text-white hover:opacity-80 transition-opacity"
            >
              <Image
                src="/logo.svg"
                alt="Altira"
                width={99}
                height={23}
                className="h-6 w-auto"
                priority
              />
            </Link>
            {/* Hide ChatSelector on mobile */}
            <div className="hidden lg:block">
              <ChatSelector />
            </div>
          </div>

          {/* Desktop right side - Deployment Info and User */}
          <div className="hidden lg:flex items-center gap-4">
            {deploymentInfo && (
              <DeploymentInfo
                githubRepoUrl={deploymentInfo.githubRepoUrl}
                vercelProjectUrl={deploymentInfo.vercelProjectUrl}
                vercelDeploymentUrl={deploymentInfo.vercelDeploymentUrl}
              />
            )}
            <UserNav />
          </div>

          {/* Mobile right side - Only menu button and user avatar */}
          <div className="flex lg:hidden items-center gap-2">
            <UserNav />
            <MobileMenu onInfoDialogOpen={() => setIsInfoDialogOpen(true)} />
          </div>
        </div>
      </div>

      {/* Info Dialog */}
      <Dialog open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold mb-4">
              v0 Clone Platform
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
            <p>
              This is a <strong>demo</strong> of a{' '}
              <a
                href="https://v0.app"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                v0 clone
              </a>{' '}
              where users can enter text prompts and generate React components
              and applications using AI.
            </p>
            <p>
              It's built with{' '}
              <a
                href="https://nextjs.org"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Next.js
              </a>{' '}
              and the{' '}
              <a
                href="https://v0-sdk.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                v0 SDK
              </a>{' '}
              to provide a full-featured interface with authentication, database
              integration, and real-time streaming responses.
            </p>
            <p>
              Try the demo or{' '}
              <a
                href={DEPLOY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                deploy your own
              </a>
              .
            </p>
          </div>
          <div className="flex justify-end mt-6">
            <Button
              onClick={() => setIsInfoDialogOpen(false)}
              className="bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900"
            >
              Try now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
