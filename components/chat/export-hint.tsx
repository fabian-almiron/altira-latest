'use client'

import { useState, useEffect } from 'react'
import { X, Download, ExternalLink, Code2, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ExportHintProps {
  chatId: string | null
  show: boolean
}

export function ExportHint({ chatId, show }: ExportHintProps) {
  const [dismissed, setDismissed] = useState(false)

  // Reset dismissed state when chatId changes
  useEffect(() => {
    if (chatId) {
      const dismissedChats = JSON.parse(
        localStorage.getItem('dismissedExportHints') || '[]',
      )
      setDismissed(dismissedChats.includes(chatId))
    }
  }, [chatId])

  const handleDismiss = () => {
    if (chatId) {
      const dismissedChats = JSON.parse(
        localStorage.getItem('dismissedExportHints') || '[]',
      )
      dismissedChats.push(chatId)
      localStorage.setItem('dismissedExportHints', JSON.stringify(dismissedChats))
      setDismissed(true)
    }
  }

  if (!show || !chatId || dismissed) return null

  return (
    <div className="mx-4 my-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg relative">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div className="flex-shrink-0 mt-1">
          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <Code2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="flex-1">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
            Ready to export or deploy?
          </h4>
          <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
            Your generated page is ready! Export the code or deploy directly to Vercel.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
              asChild
            >
              <a
                href={`https://v0.dev/chat/${chatId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Code2 className="h-3.5 w-3.5 mr-1.5" />
                Export Code
                <ExternalLink className="h-3 w-3 ml-1.5" />
              </a>
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950"
              asChild
            >
              <a
                href={`https://v0.dev/chat/${chatId}/deploy`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Rocket className="h-3.5 w-3.5 mr-1.5" />
                Deploy
              </a>
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs text-blue-700 dark:text-blue-300"
              onClick={handleDismiss}
            >
              Got it
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

