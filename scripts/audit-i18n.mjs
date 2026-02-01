#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// Load translation files
const esPath = path.join(rootDir, 'locales', 'es.json')
const enPath = path.join(rootDir, 'locales', 'en.json')

const esTranslations = JSON.parse(fs.readFileSync(esPath, 'utf-8'))
const enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf-8'))

// Flatten nested objects to dot notation
function flattenObject(obj, prefix = '') {
  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey))
    } else {
      result[newKey] = value
    }
  }
  return result
}

const esFlat = flattenObject(esTranslations)
const enFlat = flattenObject(enTranslations)

const esKeys = new Set(Object.keys(esFlat))
const enKeys = new Set(Object.keys(enFlat))

console.log(chalk.blue.bold('\n🌍 i18n Audit Report\n'))
console.log(chalk.gray('═'.repeat(60)))

// Check for missing keys
const missingInEn = [...esKeys].filter(key => !enKeys.has(key))
const missingInEs = [...enKeys].filter(key => !esKeys.has(key))

let hasErrors = false

if (missingInEn.length > 0) {
  hasErrors = true
  console.log(chalk.red.bold('\n❌ Missing in EN:'))
  missingInEn.forEach(key => {
    console.log(chalk.red(`  - ${key}`))
  })
}

if (missingInEs.length > 0) {
  hasErrors = true
  console.log(chalk.red.bold('\n❌ Missing in ES:'))
  missingInEs.forEach(key => {
    console.log(chalk.red(`  - ${key}`))
  })
}

if (!hasErrors) {
  console.log(chalk.green.bold('\n✅ Translation keys are synchronized!'))
  console.log(chalk.gray(`   Total keys: ${esKeys.size}`))
}

// Scan for hardcoded strings
console.log(chalk.blue.bold('\n📝 Scanning for hardcoded strings...\n'))

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

const suspiciousStrings = []

filesToScan.forEach(dir => {
  const dirPath = path.join(rootDir, dir)
  if (!fs.existsSync(dirPath)) return

  const files = getAllFiles(dirPath)
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8')
    const lines = content.split('\n')
    
    lines.forEach((line, index) => {
      // Skip imports, comments, and t() calls
      if (
        line.trim().startsWith('//') ||
        line.trim().startsWith('/*') ||
        line.trim().startsWith('*') ||
        line.includes('import ') ||
        line.includes('t("') ||
        line.includes("t('")
      ) {
        return
      }

      // Look for JSX text content with Spanish/English words (heuristic)
      const jsxTextMatch = line.match(/>\s*([A-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ\s]{3,})\s*</g)
      if (jsxTextMatch) {
        jsxTextMatch.forEach(match => {
          const text = match.replace(/[><]/g, '').trim()
          // Ignore common HTML/component names
          if (text.length > 3 && !text.match(/^[A-Z][a-z]+$/)) {
            suspiciousStrings.push({
              file: path.relative(rootDir, file),
              line: index + 1,
              text: text.substring(0, 50)
            })
          }
        })
      }

      // Look for quoted strings in JSX attributes (excluding className, aria, etc.)
      const quotedInJsx = line.match(/(?<!className|aria-|data-|id|name|type|placeholder|href|src|alt|title|key|value|onChange|onClick|onSubmit)=["']([^"']{10,})["']/g)
      if (quotedInJsx) {
        quotedInJsx.forEach(match => {
          const text = match.split('=')[1]?.replace(/["']/g, '').trim()
          if (text && text.match(/[a-záéíóúñA-ZÁÉÍÓÚÑ]/)) {
            suspiciousStrings.push({
              file: path.relative(rootDir, file),
              line: index + 1,
              text: text.substring(0, 50)
            })
          }
        })
      }
    })
  })
})

// Filter out duplicates and common false positives
const uniqueSuspicious = suspiciousStrings.filter((item, index, self) => 
  index === self.findIndex(t => t.file === item.file && t.line === item.line)
)

if (uniqueSuspicious.length > 0) {
  console.log(chalk.yellow.bold(`⚠️  Found ${uniqueSuspicious.length} potential hardcoded strings:\n`))
  
  uniqueSuspicious.slice(0, 20).forEach(({ file, line, text }) => {
    console.log(chalk.yellow(`  ${file}:${line}`))
    console.log(chalk.gray(`    "${text}${text.length === 50 ? '...' : ''}"`))
  })

  if (uniqueSuspicious.length > 20) {
    console.log(chalk.gray(`\n  ... and ${uniqueSuspicious.length - 20} more`))
  }

  console.log(chalk.gray('\n  Note: This is a heuristic check. Review manually.'))
} else {
  console.log(chalk.green.bold('✅ No obvious hardcoded strings found!'))
}

console.log(chalk.gray('\n' + '═'.repeat(60)))

// Summary
console.log(chalk.blue.bold('\n📊 Summary:\n'))
console.log(chalk.gray(`  Total translation keys: ${chalk.white(esKeys.size)}`))
console.log(chalk.gray(`  ES keys: ${chalk.white(esKeys.size)}`))
console.log(chalk.gray(`  EN keys: ${chalk.white(enKeys.size)}`))
console.log(chalk.gray(`  Missing keys: ${missingInEn.length + missingInEs.length > 0 ? chalk.red(missingInEn.length + missingInEs.length) : chalk.green('0')}`))
console.log(chalk.gray(`  Suspicious strings: ${uniqueSuspicious.length > 0 ? chalk.yellow(uniqueSuspicious.length) : chalk.green('0')}`))

console.log('\n')

// Exit with error if there are missing keys
if (hasErrors) {
  process.exit(1)
}
