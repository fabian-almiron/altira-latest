# Export Path Nesting Fix

## Problem

UI components were being incorrectly nested in `components/ui/ui/` instead of `components/ui/` during GitHub and Bitbucket exports.

This occurred when the shadcn registry returned paths in certain formats that caused double nesting when processed by the export system.

## Solution

Added comprehensive path validation and normalization at multiple levels:

### 1. Path Normalization in `lib/shadcn-registry.ts`

Added `normalizeComponentPath()` function that:
- Removes leading slashes
- Fixes double nesting: `components/ui/ui/` → `components/ui/`
- Ensures proper prefix for UI components
- Handles various path formats from shadcn registry

```typescript
export function normalizeComponentPath(filePath: string): string {
  // Remove leading slashes
  let normalized = filePath.replace(/^\/+/, '')
  
  // Fix double nesting: components/ui/ui/ -> components/ui/
  normalized = normalized.replace(/components\/ui\/ui\//g, 'components/ui/')
  
  // Fix if path is just ui/component.tsx -> components/ui/component.tsx
  if (normalized.startsWith('ui/') && !normalized.startsWith('components/')) {
    normalized = `components/${normalized}`
  }
  
  // Ensure components/ui/ prefix for UI components
  if (!normalized.startsWith('components/') && (normalized.endsWith('.tsx') || normalized.endsWith('.ts'))) {
    if (!normalized.includes('/')) {
      normalized = `components/ui/${normalized}`
    }
  }
  
  return normalized
}
```

### 2. Export Validation in `app/api/export/github/route.ts`

Added `validateAndFixFilePaths()` function that:
- Checks all files before export
- Fixes any double nesting issues
- Removes consecutive duplicate directory names
- Logs all path corrections for debugging

```typescript
function validateAndFixFilePaths(tree: Array<{ path: string; ... }>) {
  return tree.map(item => {
    let fixedPath = item.path
    
    // Fix double nesting
    if (fixedPath.includes('components/ui/ui/')) {
      fixedPath = fixedPath.replace(/components\/ui\/ui\//g, 'components/ui/')
    }
    
    // Remove any consecutive duplicate directories
    // e.g., components/components/ui/ -> components/ui/
    
    return { ...item, path: finalPath }
  })
}
```

### 3. Bitbucket Export Validation in `app/api/export/bitbucket/route.ts`

Added `validateAndFixFilePath()` function for individual file path validation:
- Applied to both v0 files and template files
- Ensures consistent path structure across all files
- Provides same level of protection as GitHub export

## How It Works

1. **During shadcn component fetching**: `normalizeComponentPath()` is called in `convertShadcnComponentToFiles()` to fix paths as they're converted from the registry format

2. **Before GitHub export**: `validateAndFixFilePaths()` checks the entire file tree and fixes any remaining issues

3. **Before Bitbucket export**: `validateAndFixFilePath()` validates each file path individually during the commit process

## Benefits

✅ **Prevents double nesting** - `components/ui/ui/` → `components/ui/`  
✅ **Handles multiple path formats** - Works with various shadcn registry response formats  
✅ **Multiple safety layers** - Validation at component conversion AND export time  
✅ **Clear debugging** - All path fixes are logged to console  
✅ **Future-proof** - Catches any unexpected path patterns  

## Testing

To verify the fix is working:

1. Export a chat that uses UI components (Button, Card, etc.)
2. Check the console logs for path normalization messages
3. Verify in the created repository that all UI components are in `components/ui/`
4. Look for messages like: `🔧 Fixed nested path: components/ui/ui/button.tsx → components/ui/button.tsx`

## Files Modified

- `lib/shadcn-registry.ts` - Added `normalizeComponentPath()` function
- `app/api/export/github/route.ts` - Added `validateAndFixFilePaths()` function
- `app/api/export/bitbucket/route.ts` - Added `validateAndFixFilePath()` function

