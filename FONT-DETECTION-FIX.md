# 🔤 Font Detection & Normalization System

## Problem

When v0 generates code, it uses various Google Fonts (Geist, Inter, Roboto, etc.) in the `app/layout.tsx` file. However, when exporting this code:

- ❌ Different fonts might not import correctly
- ❌ Font variables might be misconfigured
- ❌ Fonts might not apply to the layout properly
- ❌ Build errors can occur if fonts aren't properly initialized

## Solution Implemented

We've created an **automatic font detection and normalization system** that:
1. ✅ Detects whatever font v0 uses in the layout
2. ✅ Validates the font is properly configured
3. ✅ Ensures correct imports from `next/font/google`
4. ✅ Adds fallback Inter font if no font is detected
5. ✅ Works for both GitHub and Bitbucket exports

---

## How It Works

### 1. Font Detection (`lib/export-templates.ts`)

The `detectAndNormalizeFonts()` function analyzes layout files:

```typescript
export function detectAndNormalizeFonts(layoutContent: string): string {
  // Detects fonts like:
  // import { Geist, Geist_Mono } from "next/font/google"
  // import { Inter } from "next/font/google"
  // import { Roboto } from "next/font/google"
  
  const fontImportRegex = /import\s+{\s*([^}]+)\s*}\s+from\s+['"]next\/font\/google['"]/g
  const fontMatches = [...layoutContent.matchAll(fontImportRegex)]
  
  // If fonts found, validate they're properly configured
  // If no fonts found, add default Inter font
}
```

### 2. Automatic Integration

The font detection runs automatically during export:

**GitHub Export** (`app/api/export/github/route.ts`):
```typescript
const v0Files = chatDetails.files.map((file) => {
  let content = file.source
  
  // Detect and normalize fonts in layout files
  if (filePath === 'app/layout.tsx' || filePath.endsWith('/layout.tsx')) {
    content = detectAndNormalizeFonts(content)
  }
  
  return { path: filePath, content }
})
```

**Bitbucket Export** (`app/api/export/bitbucket/route.ts`):
```typescript
// Same logic applied to Bitbucket exports
```

---

## What Fonts Are Supported?

✅ **All Google Fonts** from `next/font/google`:
- Geist, Geist_Mono
- Inter
- Roboto, Roboto_Mono
- Open_Sans
- Lato
- Montserrat
- Any other Google Font v0 chooses

The system preserves whatever font v0 selected and ensures it's properly configured!

---

## Console Logs to Watch For

During export, you'll see logs like:

```
🔤 Processing font imports in app/layout.tsx
✅ Detected fonts: Geist, Geist_Mono
```

Or if no font is found:

```
🔤 Processing font imports in app/layout.tsx
⚠️  No Google Font imports detected, adding default Inter font
📝 Adding default Inter font import
```

---

## Features

### 1. **Preserves v0's Font Choice**
- If v0 uses Geist → Export uses Geist
- If v0 uses Roboto → Export uses Roboto
- Respects the original design choice

### 2. **Validates Configuration**
- Checks that fonts are properly initialized
- Ensures font variables are created
- Warns if className is missing on `<html>` tag

### 3. **Fallback Protection**
- If no font detected → Adds Inter automatically
- Ensures fonts are always properly configured
- Prevents font-related build errors

### 4. **Works with Multiple Fonts**
- Handles primary + monospace font pairs (e.g., Geist + Geist_Mono)
- Supports complex font setups
- Maintains all font variables

---

## Example Transformations

### Example 1: Geist Font (Preserved)

**v0 Generated:**
```tsx
import { Geist } from "next/font/google"

const geist = Geist({ subsets: ["latin"] })
```

**After Detection:**
```tsx
// ✅ Preserved as-is - properly configured
import { Geist } from "next/font/google"

const geist = Geist({ subsets: ["latin"] })
```

### Example 2: No Font Detected (Fixed)

**v0 Generated:**
```tsx
import type { Metadata } from "next"
import "./globals.css"
// No font import!
```

**After Detection:**
```tsx
import type { Metadata } from "next"
import "./globals.css"
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});
```

### Example 3: Multiple Fonts (Preserved)

**v0 Generated:**
```tsx
import { Roboto, Roboto_Mono } from "next/font/google"

const roboto = Roboto({ weight: "400", subsets: ["latin"] })
const robotoMono = Roboto_Mono({ subsets: ["latin"] })
```

**After Detection:**
```tsx
// ✅ Both fonts preserved - properly configured
import { Roboto, Roboto_Mono } from "next/font/google"

const roboto = Roboto({ weight: "400", subsets: ["latin"] })
const robotoMono = Roboto_Mono({ subsets: ["latin"] })
```

---

## Benefits

✅ **No More Font Import Errors** - All Google Fonts work correctly  
✅ **Preserves Design Intent** - Keeps v0's font choices  
✅ **Automatic Fallback** - Adds Inter if no font detected  
✅ **Works Everywhere** - GitHub and Bitbucket exports  
✅ **Zero Configuration** - Runs automatically on every export  
✅ **Build-Safe** - Ensures exported projects build successfully  

---

## Testing

To verify the font detection is working:

1. **Generate code with different fonts** in v0 (try Geist, Inter, Roboto)
2. **Export to GitHub** and check the console logs
3. **Clone the exported repo** and run `npm install` then `npm run build`
4. **Verify the font loads correctly** in the browser

You should see:
- ✅ Font properly imported in `app/layout.tsx`
- ✅ Font variables correctly configured
- ✅ Build completes without font-related errors
- ✅ Font displays correctly in the browser

---

## Files Modified

- ✅ `lib/export-templates.ts` - Added `detectAndNormalizeFonts()` and `addDefaultInterFont()`
- ✅ `app/api/export/github/route.ts` - Integrated font detection for GitHub exports
- ✅ `app/api/export/bitbucket/route.ts` - Integrated font detection for Bitbucket exports

---

## Future Enhancements

Possible improvements:
- 🔮 Support for custom font files (not just Google Fonts)
- 🔮 Font optimization suggestions
- 🔮 Automatic font preloading configuration
- 🔮 Font fallback stack recommendations

