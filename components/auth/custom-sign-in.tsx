'use client'

import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { OTPInput } from './otp-input'

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
      <div className="w-full max-w-xl space-y-8">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <div className="relative">
            <div className="absolute inset-0 blur-2xl bg-blue-500/20 dark:bg-blue-400/20 animate-pulse" />
            <img 
              src="/logo.svg" 
              alt="Altira" 
              className="h-10 w-auto relative z-10"
            />
          </div>
        </div>

        {/* Verification Box with Border */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-2 border-gray-200 dark:border-gray-800 p-10">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                Check your email
              </h1>
              <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
                We sent a verification code to <strong>{email}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-6">
              {error && (
                <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800 p-4">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <Label className="text-lg font-semibold text-gray-700 dark:text-gray-200 block text-center">
                  Verification code
                </Label>
                <OTPInput
                  length={6}
                  value={code}
                  onChange={setCode}
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 shadow-lg shadow-blue-500/30 dark:shadow-blue-400/20 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl"
                disabled={isLoading || !isLoaded}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify code'
                )}
              </Button>

              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setCodeSent(false)
                    setCode('')
                    setError('')
                  }}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  ← Back to sign in
                </button>
              </div>
            </form>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-xl space-y-8">
      {/* Logo */}
      <div className="flex justify-center mb-12">
        <div className="relative">
          <div className="absolute inset-0 blur-2xl bg-blue-500/20 dark:bg-blue-400/20 animate-pulse" />
          <img 
            src="/logo.svg" 
            alt="Altira" 
            className="h-10 w-auto relative z-10"
          />
        </div>
      </div>

      {/* Login Box with Border */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-2 border-gray-200 dark:border-gray-800 p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
              Welcome back
            </h1>
            <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
              Sign in to your Altira account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSendCode} className="space-y-7">
            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800 p-4">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <Label htmlFor="email" className="text-base font-semibold text-gray-700 dark:text-gray-200">
                Email address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-14 text-base px-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                disabled={isLoading}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                We'll send you a verification code to sign in
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 shadow-lg shadow-blue-500/30 dark:shadow-blue-400/20 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl"
              disabled={isLoading || !isLoaded}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending code...
                </>
              ) : (
                'Send verification code'
              )}
            </Button>
          </form>
      </div>
    </div>
  )
}

