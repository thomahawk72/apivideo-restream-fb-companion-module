#!/usr/bin/env node

/**
 * Test script for the UPDATED Facebook Graph API implementation
 * This tests that our code changes work correctly
 */

const ApiClient = require('./api')

// Load test configuration
let testConfig
try {
    testConfig = require('./test-config.js')
} catch (error) {
    console.log('❌ Could not load test-config.js. Make sure it exists and has valid configuration.')
    process.exit(1)
}

async function testUpdatedImplementation() {
    console.log('🧪 Testing UPDATED Facebook Implementation')
    console.log('=========================================')
    
    // Create API client with logger
    const api = new ApiClient((level, message) => console.log(`[${level.toUpperCase()}] ${message}`))
    
    try {
        // Test the updated createFacebookLiveVideo function
        console.log('\n🔍 Testing updated createFacebookLiveVideo (with Page Access Token)...')
        
        const result = await api.createFacebookLiveVideo(
            testConfig.userToken,
            testConfig.pageId,
            'TEST - Updated Implementation',
            'Testing the updated implementation with Page Access Token'
        )
        
        console.log('✅ Updated implementation SUCCESS!')
        console.log(`   Video ID: ${result.id}`)
        console.log(`   Stream URL: ${result.streamUrl ? 'Present' : 'Missing'}`)
        console.log(`   Server URL: ${result.serverUrl}`)
        console.log(`   Stream Key: ${result.streamKey ? result.streamKey.substring(0, 20) + '...' : 'Missing'}`)
        
        // Clean up - delete the test video using Page Access Token
        const got = require('got')
        try {
            // Get Page Access Token for cleanup
            const pageToken = await api.getPageAccessToken(testConfig.userToken, testConfig.pageId)
            await got.delete(`https://graph.facebook.com/v18.0/${result.id}?access_token=${pageToken}`)
            console.log('   🧹 Cleaned up test video')
        } catch (cleanupError) {
            console.log('   ⚠️  Could not clean up test video:', cleanupError.message)
        }
        
        return true
        
    } catch (error) {
        console.log('❌ Updated implementation FAILED:', error.message)
        return false
    }
}

async function testTokenExtension() {
    console.log('\n🔍 Testing token extension...')
    
    if (!testConfig.appId || !testConfig.appSecret || 
        testConfig.appId === 'your_app_id_here' || 
        testConfig.appSecret === 'your_app_secret_here') {
        console.log('⚠️  Skipping token extension test - App ID/Secret not configured')
        return
    }
    
    const api = new ApiClient((level, message) => console.log(`[${level.toUpperCase()}] ${message}`))
    
    try {
        const extendedToken = await api.extendUserAccessToken(
            testConfig.userToken,
            testConfig.appId,
            testConfig.appSecret
        )
        
        console.log('✅ Token extension SUCCESS!')
        console.log(`   Extended token: ${extendedToken.substring(0, 30)}...`)
        
    } catch (error) {
        console.log('❌ Token extension FAILED:', error.message)
    }
}

async function runTests() {
    const implementationWorks = await testUpdatedImplementation()
    await testTokenExtension()
    
    console.log('\n📊 Summary:')
    console.log('===========')
    if (implementationWorks) {
        console.log('🎉 SUCCESS: Updated implementation works!')
        console.log('✅ The code now follows Facebook best practices:')
        console.log('   - Uses Page Access Token instead of User Token directly')
        console.log('   - Implements /accounts endpoint call')
        console.log('   - Includes token extension capability')
        console.log('')
        console.log('🔧 Changes made:')
        console.log('   1. Added getPageAccessToken() method')
        console.log('   2. Updated createFacebookLiveVideo() to use Page Token')
        console.log('   3. Added extendUserAccessToken() method')
        console.log('   4. Added App ID/Secret configuration fields')
        console.log('   5. Integrated token extension in main flow')
    } else {
        console.log('❌ Implementation still has issues that need to be resolved.')
    }
}

// Run the tests
if (require.main === module) {
    runTests().catch(console.error)
}

module.exports = { testUpdatedImplementation, testTokenExtension }
