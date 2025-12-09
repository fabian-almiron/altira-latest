'use client'

import { useState } from 'react'
import {
  BookOpen,
  Video,
  FileText,
  Code,
  Search,
  ExternalLink,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Resource {
  id: string
  title: string
  description: string
  category: 'documentation' | 'tutorial' | 'template' | 'code'
  url: string
  icon: React.ComponentType<{ className?: string }>
}

const resources: Resource[] = [
  {
    id: '1',
    title: 'Getting Started Guide',
    description: 'Learn the basics of creating AI-generated websites',
    category: 'documentation',
    url: '#',
    icon: BookOpen,
  },
  {
    id: '2',
    title: 'Video Tutorial: Building Your First Site',
    description: 'Step-by-step video walkthrough of the platform',
    category: 'tutorial',
    url: '#',
    icon: Video,
  },
  {
    id: '3',
    title: 'Best Practices Guide',
    description: 'Tips and tricks for creating effective prompts',
    category: 'documentation',
    url: '#',
    icon: FileText,
  },
  {
    id: '4',
    title: 'Component Library',
    description: 'Explore available UI components and patterns',
    category: 'code',
    url: '#',
    icon: Code,
  },
  {
    id: '5',
    title: 'Template Gallery',
    description: 'Pre-built templates to get started quickly',
    category: 'template',
    url: '#',
    icon: FileText,
  },
  {
    id: '6',
    title: 'API Documentation',
    description: 'Complete API reference and integration guides',
    category: 'documentation',
    url: '#',
    icon: Code,
  },
  {
    id: '7',
    title: 'Advanced Customization',
    description: 'Learn how to customize and extend your websites',
    category: 'tutorial',
    url: '#',
    icon: Video,
  },
  {
    id: '8',
    title: 'Deployment Guide',
    description: 'Deploy your websites to production',
    category: 'documentation',
    url: '#',
    icon: BookOpen,
  },
  {
    id: '9',
    title: 'Code Examples',
    description: 'Common code snippets and examples',
    category: 'code',
    url: '#',
    icon: Code,
  },
  {
    id: '10',
    title: 'Design System',
    description: 'Color palettes, typography, and design guidelines',
    category: 'documentation',
    url: '#',
    icon: FileText,
  },
  {
    id: '11',
    title: 'Client Management Tutorial',
    description: 'How to manage clients and projects effectively',
    category: 'tutorial',
    url: '#',
    icon: Video,
  },
  {
    id: '12',
    title: 'Troubleshooting Common Issues',
    description: 'Solutions to frequently encountered problems',
    category: 'documentation',
    url: '#',
    icon: BookOpen,
  },
]

const categories = [
  { id: 'all', label: 'All Resources', icon: BookOpen },
  { id: 'documentation', label: 'Documentation', icon: FileText },
  { id: 'tutorial', label: 'Tutorials', icon: Video },
  { id: 'template', label: 'Templates', icon: FileText },
  { id: 'code', label: 'Code Examples', icon: Code },
]

export function ResourcesContent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === 'all' || resource.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'documentation':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
      case 'tutorial':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
      case 'template':
        return 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
      case 'code':
        return 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Resource Center
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Documentation, tutorials, and resources to help you succeed
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              'inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors',
              selectedCategory === category.id
                ? 'bg-blue-600 text-white dark:bg-blue-500'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800',
            )}
          >
            <category.icon className="mr-2 h-4 w-4" />
            {category.label}
          </button>
        ))}
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => {
          const Icon = resource.icon
          return (
            <a
              key={resource.id}
              href={resource.url}
              className="group block bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={cn(
                    'p-3 rounded-lg',
                    getCategoryColor(resource.category),
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {resource.title}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {resource.description}
              </p>

              <span
                className={cn(
                  'inline-block px-2 py-1 text-xs font-medium rounded',
                  getCategoryColor(resource.category),
                )}
              >
                {resource.category.charAt(0).toUpperCase() +
                  resource.category.slice(1)}
              </span>
            </a>
          )
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No resources found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchQuery
              ? `No resources match "${searchQuery}"`
              : 'Try selecting a different category'}
          </p>
        </div>
      )}
    </div>
  )
}

