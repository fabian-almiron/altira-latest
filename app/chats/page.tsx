import { Suspense } from 'react'
import { DashboardLayout } from '@/components/shared/dashboard-layout'
import { ChatsClient } from '@/components/chats/chats-client'

export default function ChatsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <ChatsClient />
      </Suspense>
    </DashboardLayout>
  )
}
