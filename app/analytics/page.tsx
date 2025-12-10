import { DashboardLayout } from '@/components/shared/dashboard-layout'
import { BarChart3 } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analytics
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            View your website analytics and performance metrics.
          </p>
          <div className="mt-8 p-12 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Analytics dashboard coming soon...
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

