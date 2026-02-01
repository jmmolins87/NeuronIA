#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

console.log(chalk.blue.bold('\n🎨 Inline Styles Audit Report\n'))
console.log(chalk.gray('═'.repeat(60)))

const filesToScan = [
  'app',
  'components',
  'hooks'
]

const excludePatterns = [
  /node_modules/,
  /\.next/,
  /\.git/,
  /\/scripts\//,
  /\.json$/,
  /\.css$/,
  /\.md$/
]

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath)

  files.forEach(file => {
    const fullPath = path.join(dirPath, file)
    
    if (excludePatterns.some(pattern => pattern.test(fullPath))) {
      return
    }

    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles)
    } else if (fullPath.match(/\.(tsx?|jsx?)$/)) {
      arrayOfFiles.push(fullPath)
    }
  })

  return arrayOfFiles
}

const inlineStylesFound = []

filesToScan.forEach(dir => {
  const dirPath = path.join(rootDir, dir)
  if (!fs.existsSync(dirPath)) return

  const files = getAllFiles(dirPath)
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8')
    const lines = content.split('\n')
    
    lines.forEach((line, index) => {
      // Look for style= attribute
      // Ignore comments and specific allowed cases
      if (
        line.trim().startsWith('//') ||
        line.trim().startsWith('/*') ||
        line.trim().startsWith('*')
      ) {
        return
      }

      // Match style={{ or style=" patterns
      const styleMatch = line.match(/\bstyle=\{?\{?/)
      
      if (styleMatch) {
        // Get context (this line + next 3 lines for multi-line style objects)
        const contextLines = lines.slice(index, index + 4).join(' ')
        
        // Check if it's a legitimate case (dynamic values, animations, etc.)
        const isAllowedException = 
          contextLines.includes('InlineWidget') || 
          contextLines.includes('styles={{') && contextLines.includes('height:') ||
          contextLines.includes('// @allowed-inline-style') ||
          contextLines.includes('width:') && (contextLines.includes('progress') || contextLines.includes('indicatorStyle')) || // Progress bars & nav indicators
          contextLines.includes('left:') && contextLines.includes('indicatorStyle') || // Animated indicators
          contextLines.includes('opacity:') && contextLines.includes('indicatorStyle') || // Animated indicators
          contextLines.includes('transformOrigin') || // Transform origin for animations
          contextLines.includes('animation:') || // SVG animations
          file.includes('sonner.tsx') || // Toaster library
          file.includes('grid-pattern.tsx') || // Grid pattern component
          file.includes('header.tsx') && contextLines.includes('indicatorStyle') // Nav indicator
        
        if (!isAllowedException) {
          const snippet = line.trim().substring(0, 80)
          inlineStylesFound.push({
            file: path.relative(rootDir, file),
            line: index + 1,
            snippet: snippet
          })
        }
      }
    })
  })
})

if (inlineStylesFound.length > 0) {
  console.log(chalk.red.bold(`\n❌ Found ${inlineStylesFound.length} inline style(s):\n`))
  
  inlineStylesFound.forEach(({ file, line, snippet }) => {
    console.log(chalk.red(`  ${file}:${line}`))
    console.log(chalk.gray(`    ${snippet}${snippet.length === 80 ? '...' : ''}`))
  })

  console.log(chalk.yellow.bold('\n⚠️  Recommendation:'))
  console.log(chalk.yellow('  Use Tailwind utility classes instead of inline styles.'))
  console.log(chalk.yellow('  If you need dynamic styles, use the cn() utility with conditional classes.'))
  
} else {
  console.log(chalk.green.bold('\n✅ No inline styles found!'))
  console.log(chalk.gray('   All styling appears to use Tailwind classes.'))
}

console.log(chalk.gray('\n' + '═'.repeat(60)))

// Additional checks
console.log(chalk.blue.bold('\n🔍 Additional Style Checks:\n'))

// Check for hardcoded colors
const hardcodedColors = []

filesToScan.forEach(dir => {
  const dirPath = path.join(rootDir, dir)
  if (!fs.existsSync(dirPath)) return

  const files = getAllFiles(dirPath)
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8')
    const lines = content.split('\n')
    
    lines.forEach((line, index) => {
      // Skip comments and imports
      if (
        line.trim().startsWith('//') ||
        line.trim().startsWith('/*') ||
        line.trim().startsWith('*') ||
        line.includes('import ')
      ) {
        return
      }

      // Look for hex colors or rgb() in className
      const colorMatch = line.match(/className=["'][^"']*(?:#[0-9a-fA-F]{3,6}|rgb\(|rgba\()/g)
      
      if (colorMatch) {
        const snippet = line.trim().substring(0, 80)
        hardcodedColors.push({
          file: path.relative(rootDir, file),
          line: index + 1,
          snippet: snippet
        })
      }
    })
  })
})

if (hardcodedColors.length > 0) {
  console.log(chalk.yellow.bold(`⚠️  Found ${hardcodedColors.length} potential hardcoded color(s):\n`))
  
  hardcodedColors.slice(0, 10).forEach(({ file, line, snippet }) => {
    console.log(chalk.yellow(`  ${file}:${line}`))
    console.log(chalk.gray(`    ${snippet}${snippet.length === 80 ? '...' : ''}`))
  })

  if (hardcodedColors.length > 10) {
    console.log(chalk.gray(`\n  ... and ${hardcodedColors.length - 10} more`))
  }

  console.log(chalk.yellow.bold('\n⚠️  Recommendation:'))
  console.log(chalk.yellow('  Use CSS variables and semantic tokens instead of hardcoded colors.'))
  console.log(chalk.yellow('  Example: bg-primary instead of bg-[#00FF9A]'))
} else {
  console.log(chalk.green.bold('✅ No hardcoded colors in Tailwind classes!'))
}

console.log(chalk.gray('\n' + '═'.repeat(60)))

// Summary
console.log(chalk.blue.bold('\n📊 Summary:\n'))
console.log(chalk.gray(`  Inline styles: ${inlineStylesFound.length > 0 ? chalk.red(inlineStylesFound.length) : chalk.green('0')}`))
console.log(chalk.gray(`  Hardcoded colors: ${hardcodedColors.length > 0 ? chalk.yellow(hardcodedColors.length) : chalk.green('0')}`))

console.log('\n')

// Exit with error if there are inline styles
if (inlineStylesFound.length > 0) {
  process.exit(1)
}
