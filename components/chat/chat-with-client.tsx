'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HomeClient } from '@/components/home/home-client'

export function ChatWithClient() {
  const router = useRouter()
  const [isValidating, setIsValidating] = useState(true)

  useEffect(() => {
    // Check if we have client info in session storage
    const clientInfo = sessionStorage.getItem('newClientInfo')
    
    if (!clientInfo) {
      // No client info, redirect to new project form
      router.push('/new')
      return
    }

    setIsValidating(false)
  }, [router])

  if (isValidating) {
    return null
  }

  return <HomeClient />
}

