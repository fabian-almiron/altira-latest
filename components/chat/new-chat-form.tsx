'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function NewChatForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [websiteName, setWebsiteName] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientCompany, setClientCompany] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!clientName.trim()) {
      alert('Client name is required')
      return
    }

    // Store client info and website name in session storage
    sessionStorage.setItem('newClientInfo', JSON.stringify({
      name: clientName,
      email: clientEmail,
      phone: clientPhone,
      company: clientCompany,
    }))
    
    if (websiteName.trim()) {
      sessionStorage.setItem('newChatName', websiteName.trim())
    }

    // Redirect to chat page to start creating the chat
    router.push('/chat')
  }

  return (
    <div className="max-w-2xl mx-auto p-6 lg:p-8">
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 lg:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Create New Project
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Fill in the project details to get started with AI website generation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Project Name (Optional) */}
          <div>
            <Label htmlFor="websiteName">Project Name</Label>
            <Input
              id="websiteName"
              value={websiteName}
              onChange={(e) => setWebsiteName(e.target.value)}
              placeholder="My Awesome Website (optional)"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
              Optional: Give this website a specific name
            </p>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                Client Information
              </span>
            </div>
          </div>

          {/* Client Name */}
          <div>
            <Label htmlFor="clientName">Client Name *</Label>
            <Input
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          {/* Client Email */}
          <div>
            <Label htmlFor="clientEmail">Email</Label>
            <Input
              id="clientEmail"
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="john@example.com"
            />
          </div>

          {/* Client Phone */}
          <div>
            <Label htmlFor="clientPhone">Phone</Label>
            <Input
              id="clientPhone"
              type="tel"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          {/* Client Company */}
          <div>
            <Label htmlFor="clientCompany">Company</Label>
            <Input
              id="clientCompany"
              value={clientCompany}
              onChange={(e) => setClientCompany(e.target.value)}
              placeholder="Acme Inc."
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Continue to Chat
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

