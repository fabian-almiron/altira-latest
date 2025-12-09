import { Suspense } from 'react'
import { DashboardLayout } from '@/components/shared/dashboard-layout'
import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { EnvSetup } from '@/components/env-setup'
import { hasEnvVars, checkRequiredEnvVars } from '@/lib/env-check'

export default function Home() {
  const isDevelopment = process.env.NODE_ENV === 'development'

  // Only show setup screen in development if environment variables are missing
  if (!hasEnvVars && isDevelopment) {
    const missingVars = checkRequiredEnvVars()
    return <EnvSetup missingVars={missingVars} />
  }

  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <div className="p-6 lg:p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
              </div>
            </div>
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
    </DashboardLayout>
  )
}
