/**
 * Shadcn UI Component Registry Integration
 * Fetches components directly from shadcn's official registry
 */

// Correct registry API endpoint
const SHADCN_REGISTRY_URL = 'https://ui.shadcn.com/r'

// Map of component names to their registry entries
const COMPONENT_REGISTRY_MAP: Record<string, string> = {
  'button': 'button',
  'card': 'card',
  'input': 'input',
  'badge': 'badge',
  'avatar': 'avatar',
  'dialog': 'dialog',
  'dropdown-menu': 'dropdown-menu',
  'select': 'select',
  'textarea': 'textarea',
  'checkbox': 'checkbox',
  'radio-group': 'radio-group',
  'switch': 'switch',
  'label': 'label',
  'toast': 'toast',
  'tooltip': 'tooltip',
  'popover': 'popover',
  'command': 'command',
  'accordion': 'accordion',
  'alert': 'alert',
  'alert-dialog': 'alert-dialog',
  'aspect-ratio': 'aspect-ratio',
  'calendar': 'calendar',
  'collapsible': 'collapsible',
  'context-menu': 'context-menu',
  'form': 'form',
  'hover-card': 'hover-card',
  'menubar': 'menubar',
  'navigation-menu': 'navigation-menu',
  'pagination': 'pagination',
  'progress': 'progress',
  'scroll-area': 'scroll-area',
  'separator': 'separator',
  'sheet': 'sheet',
  'skeleton': 'skeleton',
  'slider': 'slider',
  'sonner': 'sonner',
  'tabs': 'tabs',
  'table': 'table',
  'toggle': 'toggle',
  'toggle-group': 'toggle-group',
}

interface ShadcnRegistryFile {
  name?: string
  path?: string
  content?: string
  source?: string
  type?: string
}

interface ShadcnRegistryComponent {
  name: string
  type?: string
  files?: ShadcnRegistryFile[]
  dependencies?: string[]
  devDependencies?: string[]
  registryDependencies?: string[]
}

/**
 * Fetches a component from shadcn's registry
 */
export async function fetchShadcnComponent(componentName: string): Promise<ShadcnRegistryComponent | null> {
  try {
    const registryName = COMPONENT_REGISTRY_MAP[componentName]
    if (!registryName) {
      console.warn(`⚠️  Component not found in registry map: ${componentName}`)
      return null
    }

    // Try multiple URL patterns
    const urlPatterns = [
      `${SHADCN_REGISTRY_URL}/styles/default/${registryName}.json`,
      `https://ui.shadcn.com/r/styles/default/${registryName}.json`,
      `https://ui.shadcn.com/registry/styles/default/${registryName}.json`,
    ]

    for (const url of urlPatterns) {
      try {
        console.log(`📡 Trying: ${url}`)
        const response = await fetch(url)
        
        if (response.ok) {
          const data: ShadcnRegistryComponent = await response.json()
          console.log(`✅ Fetched ${componentName} from shadcn registry`)
          console.log(`📋 Component has ${data.files?.length || 0} files`)
          console.log(`🔍 Registry response structure:`, JSON.stringify(data, null, 2))
          return data
        }
      } catch (err) {
        // Try next URL
        continue
      }
    }

    console.error(`❌ Failed to fetch ${componentName} from all registry URLs`)
    return null
  } catch (error) {
    console.error(`❌ Error fetching ${componentName}:`, error)
    return null
  }
}

/**
 * Fetches multiple components from shadcn's registry
 */
export async function fetchShadcnComponents(componentNames: string[]): Promise<Record<string, ShadcnRegistryComponent>> {
  const components: Record<string, ShadcnRegistryComponent> = {}

  console.log(`📦 Fetching ${componentNames.length} components from shadcn registry...`)

  // Fetch all components in parallel
  const fetchPromises = componentNames.map(async (name) => {
    const component = await fetchShadcnComponent(name)
    if (component) {
      components[name] = component
    }
  })

  await Promise.all(fetchPromises)

  console.log(`✅ Successfully fetched ${Object.keys(components).length} components`)

  return components
}

/**
 * Converts shadcn registry format to our export format
 */
export function convertShadcnComponentToFiles(component: ShadcnRegistryComponent): Record<string, string> {
  const files: Record<string, string> = {}

  console.log(`🔄 Converting component: ${component.name}`)
  console.log(`📦 Component data:`, JSON.stringify(component, null, 2))

  if (!component.files || component.files.length === 0) {
    console.warn('⚠️  No files in component:', component.name)
    return files
  }

  for (const file of component.files) {
    console.log(`📄 Processing file:`, JSON.stringify(file, null, 2))
    
    // Handle different response formats
    const fileName = file.name || file.path || ''
    const fileContent = file.content || file.source || ''

    console.log(`  → fileName: ${fileName}`)
    console.log(`  → content length: ${fileContent.length}`)

    if (!fileName || !fileContent) {
      console.warn('⚠️  Invalid file entry:', file)
      continue
    }

    // Convert registry path to our format
    // e.g., "components/ui/button.tsx" stays the same
    const filePath = fileName.startsWith('components/') 
      ? fileName 
      : `components/ui/${fileName}`

    console.log(`  → final path: ${filePath}`)
    files[filePath] = fileContent
  }

  console.log(`✅ Converted ${Object.keys(files).length} files for ${component.name}`)
  console.log(`📂 File paths:`, Object.keys(files))

  return files
}

/**
 * Gets dependencies for a component from shadcn registry
 */
export function getShadcnComponentDependencies(component: ShadcnRegistryComponent): string[] {
  const deps = new Set<string>()

  // Add npm dependencies
  if (component.dependencies) {
    component.dependencies.forEach(dep => deps.add(dep))
  }

  return Array.from(deps)
}

/**
 * Analyzes v0 files to detect which UI components are imported
 */
export function detectRequiredUIComponents(v0Files: Array<{ source: string; meta?: { file?: string } }>): string[] {
  const requiredComponents = new Set<string>()

  // Regex patterns to detect imports from @/components/ui/
  const importPatterns = [
    /from\s+['"]@\/components\/ui\/(\w+)['"]/g,
    /from\s+['"]@\/components\/ui\/([\w-]+)['"]/g,  // Support kebab-case
    /import\s+.*\s+from\s+['"]@\/components\/ui\/(\w+)['"]/g,
    /import\s+.*\s+from\s+['"]@\/components\/ui\/([\w-]+)['"]/g,
  ]

  for (const file of v0Files) {
    const source = file.source

    // Check each import pattern
    for (const pattern of importPatterns) {
      let match
      while ((match = pattern.exec(source)) !== null) {
        const componentName = match[1] // e.g., 'button', 'dropdown-menu'
        requiredComponents.add(componentName)
      }
    }
  }

  return Array.from(requiredComponents)
}

/**
 * Gets UI components dynamically from shadcn registry based on detected imports
 * Falls back to local components if registry fails
 */
export async function getDynamicShadcnComponents(v0Files: Array<{ source: string; meta?: { file?: string } }>): Promise<Record<string, string>> {
  const requiredComponentNames = detectRequiredUIComponents(v0Files)
  
  if (requiredComponentNames.length === 0) {
    console.log('📦 No UI components detected')
    return {}
  }

  console.log('🔍 Detected required UI components:', requiredComponentNames)

  // Fetch components from shadcn registry
  const shadcnComponents = await fetchShadcnComponents(requiredComponentNames)

  // Convert to file format
  const allFiles: Record<string, string> = {}

  // Import fallback components
  const { getFallbackComponent } = await import('./fallback-components')

  for (const componentName of requiredComponentNames) {
    if (shadcnComponents[componentName]) {
      // Use shadcn registry version
      const files = convertShadcnComponentToFiles(shadcnComponents[componentName])
      
      if (Object.keys(files).length > 0) {
        Object.assign(allFiles, files)
        console.log(`✅ Including shadcn component: ${componentName} (${Object.keys(files).length} files)`)
      } else {
        // Registry returned empty, use fallback
        const fallback = getFallbackComponent(componentName)
        if (fallback) {
          allFiles[`components/ui/${componentName}.tsx`] = fallback
          console.log(`⚠️  Using fallback for: ${componentName} (registry returned no files)`)
        } else {
          console.warn(`❌ No fallback available for: ${componentName}`)
        }
      }
    } else {
      // Use fallback version
      const fallback = getFallbackComponent(componentName)
      if (fallback) {
        allFiles[`components/ui/${componentName}.tsx`] = fallback
        console.log(`⚠️  Using fallback for: ${componentName} (registry unavailable)`)
      } else {
        console.warn(`❌ No fallback available for: ${componentName}`)
      }
    }
  }

  return allFiles
}

/**
 * Gets all dependencies needed for detected components
 */
export async function getDynamicShadcnDependencies(v0Files: Array<{ source: string; meta?: { file?: string } }>): Promise<string[]> {
  const requiredComponentNames = detectRequiredUIComponents(v0Files)
  
  if (requiredComponentNames.length === 0) {
    return []
  }

  // Fetch components to get their dependencies
  const shadcnComponents = await fetchShadcnComponents(requiredComponentNames)

  const allDependencies = new Set<string>()

  for (const component of Object.values(shadcnComponents)) {
    const deps = getShadcnComponentDependencies(component)
    deps.forEach(dep => allDependencies.add(dep))
  }

  return Array.from(allDependencies)
}

