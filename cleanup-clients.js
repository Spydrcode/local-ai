// Quick script to cleanup all unnamed clients via API
// Run with: node cleanup-clients.js

const baseUrl = 'http://localhost:3000'

async function cleanupUnnamedClients() {
  console.log('Cleaning up unnamed clients...')

  try {
    const response = await fetch(`${baseUrl}/api/demos?cleanup=unnamed`, {
      method: 'DELETE'
    })

    const result = await response.json()

    if (response.ok) {
      console.log(`✅ Success! Deleted ${result.count} unnamed clients`)
    } else {
      console.error('❌ Error:', result.error)
    }
  } catch (error) {
    console.error('❌ Failed:', error.message)
  }
}

cleanupUnnamedClients()
