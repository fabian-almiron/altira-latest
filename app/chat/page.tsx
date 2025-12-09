import { Suspense } from 'react'
import { ChatWithClient } from '@/components/chat/chat-with-client'

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatWithClient />
    </Suspense>
  )
}

