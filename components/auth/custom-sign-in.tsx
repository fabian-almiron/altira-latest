'use client'

import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

export function CustomSignIn() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const router = useRouter()

  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return

    setIsLoading(true)
    setError('')

    try {
      await signIn.create({
        identifier: email,
      })

      if (!signIn.supportedFirstFactors) {
        throw new Error('Email code authentication is not available')
      }

      const emailCodeFactor = signIn.supportedFirstFactors.find(
        (factor) => factor.strategy === 'email_code'
      )

      if (!emailCodeFactor || !('emailAddressId' in emailCodeFactor)) {
        throw new Error('Email code authentication is not available')
      }

      await signIn.prepareFirstFactor({
        strategy: 'email_code',
        emailAddressId: emailCodeFactor.emailAddressId,
      })

      setCodeSent(true)
    } catch (err: any) {
      console.error('Send code error:', err)
      setError(
        err.errors?.[0]?.message || 
        'Failed to send verification code. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return

    setIsLoading(true)
    setError('')

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'email_code',
        code,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.push('/')
      } else {
        setError('Sign in failed. Please try again.')
      }
    } catch (err: any) {
      console.error('Verify code error:', err)
      setError(
        err.errors?.[0]?.message || 
        'Invalid verification code. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Email code verification view
  if (codeSent) {
    return (
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Check your email
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            We sent a verification code to <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleVerifyCode} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="code">Verification code</Label>
            <Input
              id="code"
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-digit code"
              className="h-11 text-center text-lg tracking-widest"
              maxLength={6}
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-base"
            disabled={isLoading || !isLoaded}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify code'
            )}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setCodeSent(false)
                setCode('')
                setError('')
              }}
              className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              ← Back to sign in
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Sign in to your Altira account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSendCode} className="mt-8 space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-11"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              We'll send you a verification code to sign in
            </p>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-base"
          disabled={isLoading || !isLoaded}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending code...
            </>
          ) : (
            'Send verification code'
          )}
        </Button>

      </form>
    </div>
  )
}

