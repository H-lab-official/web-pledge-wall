#!/usr/bin/env node

/**
 * Pre-deploy script to check if APP_MODE is set to 'online'
 * This prevents accidentally deploying with 'offline' mode
 */

const fs = require('fs')
const path = require('path')

const CONFIG_FILE = path.join(__dirname, '../src/config/appConfig.ts')

try {
  const content = fs.readFileSync(CONFIG_FILE, 'utf-8')
  
  // Extract APP_MODE value
  const match = content.match(/export const APP_MODE\s*=\s*['"](\w+)['"]/i)
  
  if (!match) {
    console.error('❌ ERROR: Cannot find APP_MODE in appConfig.ts')
    process.exit(1)
  }
  
  const mode = match[1]
  
  if (mode === 'offline') {
    console.error('')
    console.error('╔════════════════════════════════════════════════════════╗')
    console.error('║  ❌ DEPLOYMENT BLOCKED - WRONG MODE DETECTED           ║')
    console.error('╚════════════════════════════════════════════════════════╝')
    console.error('')
    console.error('  APP_MODE is currently set to: "offline"')
    console.error('')
    console.error('  ⚠️  Offline mode will NOT work on Firebase Hosting!')
    console.error('      It only works on localhost during development.')
    console.error('')
    console.error('  ✅ Please change APP_MODE to "online" in:')
    console.error('     src/config/appConfig.ts')
    console.error('')
    console.error('  Then run the deploy command again.')
    console.error('')
    process.exit(1)
  }
  
  console.log('✅ Mode check passed: APP_MODE = "online"')
  console.log('✅ Safe to deploy to Firebase Hosting')
  process.exit(0)
  
} catch (error) {
  console.error('❌ ERROR reading config file:', error.message)
  process.exit(1)
}

