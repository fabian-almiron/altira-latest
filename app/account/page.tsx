'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { UserProfile } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { AppHeader } from '@/components/shared/app-header'
import { Loader } from '@/components/ai-elements/loader'

export default function AccountPage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  // Show loading while checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader size={32} className="text-blue-600 dark:text-blue-400" />
      </div>
    )
  }

  // Don't render if not authenticated
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AppHeader />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage your account information and security settings
          </p>
        </div>

        {/* Clerk's Built-in User Profile Component */}
        <UserProfile 
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900",
              navbar: "bg-white dark:bg-gray-900",
              navbarButton: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
              navbarButtonActive: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
              pageScrollBox: "bg-white dark:bg-gray-900",
              profileSection: "bg-white dark:bg-gray-900",
              profileSectionPrimaryButton: "bg-blue-600 hover:bg-blue-700 text-white",
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
              formFieldInput: "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white",
              formFieldLabel: "text-gray-700 dark:text-gray-300",
              identityPreview: "bg-gray-50 dark:bg-gray-800",
              badge: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
            }
          }}
          routing="path"
          path="/account"
        />
      </div>
    </div>
  )
}
