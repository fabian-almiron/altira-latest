/**
 * Test GitHub + Vercel Deployment
 * 
 * This script tests the integrated deployment system
 * Make sure you have:
 * 1. GITHUB_TOKEN in .env.local
 * 2. VERCEL_TOKEN in .env.local
 * 3. GitHub connected to Vercel
 */

const chatId = process.argv[2] || 'YOUR_CHAT_ID_HERE'
const repoName = process.argv[3] || `test-deploy-${Date.now()}`

console.log('🚀 Testing GitHub + Vercel Deployment\n')
console.log('📋 Parameters:')
console.log(`   Chat ID: ${chatId}`)
console.log(`   Repo Name: ${repoName}\n`)

async function testDeployment() {
  try {
    console.log('📡 Calling deployment API...\n')
    
    const response = await fetch('http://localhost:3000/api/deploy/github-vercel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatId: chatId,
        repoName: repoName,
        isPrivate: true,
      }),
    })

    const result = await response.json()

    if (result.success) {
      console.log('✅ DEPLOYMENT SUCCESSFUL!\n')
      console.log('📦 GitHub Repository:')
      console.log(`   ${result.repository.url}\n`)
      console.log('🔷 Vercel Project:')
      console.log(`   ${result.vercelProject.dashboardUrl}\n`)
      console.log('🚀 Live Deployment:')
      console.log(`   ${result.deployment.deploymentUrl}\n`)
      console.log('📊 Stats:')
      console.log(`   Files Created: ${result.filesCreated}`)
      console.log(`   Deployment State: ${result.deployment.readyState}\n`)
      console.log('🎉 Your app is live! Check the URLs above.')
    } else if (result.partialSuccess) {
      console.log('⚠️  PARTIAL SUCCESS\n')
      console.log('✅ GitHub:', result.githubSuccess ? 'Success' : 'Failed')
      console.log('✅ Vercel Project:', result.vercelProjectSuccess ? 'Success' : 'Failed')
      console.log('⚠️  Deployment:', result.deploymentSuccess ? 'Success' : 'Failed\n')
      
      if (result.repository) {
        console.log('📦 GitHub Repository:')
        console.log(`   ${result.repository.url}\n`)
      }
      
      console.log('💡 Tip: Vercel may auto-deploy in a few minutes. Check your Vercel dashboard.')
    } else {
      console.log('❌ DEPLOYMENT FAILED\n')
      console.log(`Error: ${result.error}`)
      
      if (result.details) {
        console.log(`\nDetails: ${result.details}`)
      }
      
      if (result.githubRepo) {
        console.log(`\n✅ GitHub repo may have been created: ${result.githubRepo}`)
      }
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('\n💡 Make sure:')
    console.error('   1. Your dev server is running (npm run dev)')
    console.error('   2. GITHUB_TOKEN is in .env.local')
    console.error('   3. VERCEL_TOKEN is in .env.local')
    console.error('   4. GitHub is connected to Vercel')
  }
}

// Run the test
testDeployment()

