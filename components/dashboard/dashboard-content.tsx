'use client'

import Link from 'next/link'
import { Plus, Globe, Trash2, ExternalLink } from 'lucide-react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface V0Chat {
  id: string
  object: 'chat'
  name?: string
  messages?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  createdAt: string
  updatedAt: string
}

interface ChatsResponse {
  object: 'list'
  data: V0Chat[]
}

export function DashboardContent() {
  const { data, error, isLoading, mutate } = useSWR<ChatsResponse>('/api/chats')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const chats = data?.data || []

  const getFirstUserMessage = (chat: V0Chat) => {
    const firstUserMessage = chat.messages?.find((msg) => msg.role === 'user')
    return firstUserMessage?.content || 'Untitled Website'
  }

  const handleDelete = async (chatId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm('Are you sure you want to delete this website?')) {
      return
    }

    setDeletingId(chatId)
    try {
      const response = await fetch(`/api/chat/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete chat')
      }

      // Refresh the chat list
      mutate()
    } catch (error) {
      console.error('Error deleting chat:', error)
      alert('Failed to delete website. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <Link href="/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Website
            </Button>
          </Link>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your AI-generated websites
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Websites
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {chats.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Clients
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                0
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Resources
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                12
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Websites */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Websites
          </h2>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-300">
              Loading websites...
            </span>
          </div>
        )}

        {error && (
          <div className="p-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error loading websites
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {error.message || 'Failed to load websites'}
              </p>
            </div>
          </div>
        )}

        {!isLoading && !error && chats.length === 0 && (
          <div className="text-center py-12">
            <Globe className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No websites yet
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating your first AI-generated website.
            </p>
            <div className="mt-6">
              <Link href="/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Website
                </Button>
              </Link>
            </div>
          </div>
        )}

        {!isLoading && !error && chats.length > 0 && (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {chats.slice(0, 10).map((chat) => (
              <Link
                key={chat.id}
                href={`/chats/${chat.id}`}
                className="block hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <Globe className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {chat.name || getFirstUserMessage(chat)}
                          </p>
                          <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <span>
                              {chat.messages?.length || 0} messages
                            </span>
                            <span className="mx-2">•</span>
                            <span>
                              Updated{' '}
                              {new Date(chat.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center ml-4 space-x-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          window.open(`/chats/${chat.id}`, '_blank')
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Open in new tab"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(chat.id, e)}
                        disabled={deletingId === chat.id}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Delete website"
                      >
                        {deletingId === chat.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && !error && chats.length > 10 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
            <Link
              href="/chats"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all websites →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

// Import missing icons
import { Users, BookOpen } from 'lucide-react'

