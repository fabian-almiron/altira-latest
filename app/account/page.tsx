'use client'

import { AppHeader } from '@/components/shared/app-header'
import { AccountContent } from '@/components/account/account-content'

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AppHeader />
      <AccountContent />
    </div>
  )
}
