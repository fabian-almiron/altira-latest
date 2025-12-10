'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Mail, Phone, Building2, MoreVertical, Loader2, Globe, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Website {
  chatId: string
  websiteName: string
  client: {
    id: string
    name: string
    email?: string
    phone?: string
    company?: string
  }
  createdAt: string
  messages?: number
}

export function ClientsContent() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [websites, setWebsites] = useState<Website[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [websiteToDelete, setWebsiteToDelete] = useState<Website | null>(null)

  useEffect(() => {
    loadWebsites()
  }, [])

  const loadWebsites = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/clients/websites')
      if (response.ok) {
        const data = await response.json()
        setWebsites(data.websites || [])
      }
    } catch (error) {
      console.error('Error loading websites:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredWebsites = websites.filter(
    (website) =>
      website.websiteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      website.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (website.client.email && website.client.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (website.client.company && website.client.company.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleWebsiteClick = (chatId: string) => {
    router.push(`/chats/${chatId}`)
  }

  const handleDeleteClick = (website: Website, e: React.MouseEvent) => {
    e.stopPropagation()
    setWebsiteToDelete(website)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!websiteToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/chats/${websiteToDelete.chatId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete website')
      }

      // Remove from local state
      setWebsites(websites.filter((w) => w.chatId !== websiteToDelete.chatId))
      setIsDeleteDialogOpen(false)
      setWebsiteToDelete(null)
    } catch (error) {
      console.error('Error deleting website:', error)
      alert('Failed to delete website. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Websites & Clients
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your client websites and projects
            </p>
          </div>
          <Button onClick={() => router.push('/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Website
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search websites or clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Websites List */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600 dark:text-gray-300">
              Loading websites...
            </span>
          </div>
        ) : websites.length === 0 ? (
          <div className="text-center py-12">
            <Globe className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No websites yet
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating your first website.
            </p>
            <div className="mt-6">
              <Button onClick={() => router.push('/new')}>
                <Plus className="mr-2 h-4 w-4" />
                New Website
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Website
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredWebsites.map((website) => (
                    <tr
                      key={website.chatId}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                      onClick={() => handleWebsiteClick(website.chatId)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                            <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {website.websiteName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {website.messages || 0} messages
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {website.client.name}
                            </div>
                            {website.client.company && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {website.client.company}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {website.client.email && (
                            <div className="flex items-center text-xs">
                              <Mail className="h-3 w-3 mr-2 text-gray-400" />
                              {website.client.email}
                            </div>
                          )}
                          {website.client.phone && (
                            <div className="flex items-center text-xs mt-1">
                              <Phone className="h-3 w-3 mr-2 text-gray-400" />
                              {website.client.phone}
                            </div>
                          )}
                          {!website.client.email && !website.client.phone && (
                            <span className="text-xs text-gray-400">No contact info</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(website.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                              <MoreVertical className="h-5 w-5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation()
                              handleWebsiteClick(website.chatId)
                            }}>
                              Open Chat
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={(e) => handleDeleteClick(website, e)}
                            >
                              Delete Website
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredWebsites.length === 0 && searchQuery && (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No websites found matching "{searchQuery}"
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Website</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{websiteToDelete?.websiteName}"?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              This will permanently delete:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>The chat from your v0.dev account</li>
              <li>All chat messages and generated code</li>
              <li>The GitHub repository (if deployed)</li>
              <li>The Vercel project and deployment (if deployed)</li>
              <li>All local records and client data</li>
            </ul>
            <p className="mt-4 font-semibold text-red-600 dark:text-red-400 text-sm">
              ⚠️ This action cannot be undone and will delete from v0.dev!
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setWebsiteToDelete(null)
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDeleting ? 'Deleting...' : 'Delete Website'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

