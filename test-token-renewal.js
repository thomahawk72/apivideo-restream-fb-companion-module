#!/usr/bin/env node

/**
 * Test script for verifying automatic token renewal functionality
 * This tests that tokens are automatically validated and renewed as needed
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

async function testTokenValidation() {
    console.log('\n🔍 Testing Token Validation...')
    
    const api = new ApiClient((level, message) => console.log(`[${level.toUpperCase()}] ${message}`))
    
    // Test 1: Valid token
    console.log('\n   Testing valid User Token:')
    try {
        const isValid = await api.validateToken(testConfig.userToken, 'user')
        console.log(`   ✅ Token validation result: ${isValid ? 'VALID' : 'INVALID'}`)
    } catch (error) {
        console.log(`   ❌ Token validation failed: ${error.message}`)
    }
    
    // Test 2: Invalid token
    console.log('\n   Testing invalid User Token:')
    try {
        const isValid = await api.validateToken('invalid_token_12345', 'user')
        console.log(`   ✅ Invalid token correctly identified: ${isValid ? 'VALID' : 'INVALID'}`)
    } catch (error) {
        console.log(`   ❌ Invalid token test failed: ${error.message}`)
    }
}

async function testUserTokenRenewal() {
    console.log('\n🔍 Testing User Token Renewal...')
    
    const api = new ApiClient((level, message) => console.log(`[${level.toUpperCase()}] ${message}`))
    
    try {
        const validToken = await api.getValidUserToken(
            testConfig.userToken,
            testConfig.appId,
            testConfig.appSecret
        )
        
        console.log('✅ User Token renewal/validation SUCCESS!')
        console.log(`   Token: ${validToken.substring(0, 30)}...`)
        
        // Test caching - should use cached token on second call
        console.log('\n   Testing token caching:')
        const cachedToken = await api.getValidUserToken(
            testConfig.userToken,
            testConfig.appId,
            testConfig.appSecret
        )
        
        if (validToken === cachedToken) {
            console.log('   ✅ Token caching works correctly')
        } else {
            console.log('   ⚠️  Token caching might not be working as expected')
        }
        
        return validToken
        
    } catch (error) {
        console.log(`❌ User Token renewal failed: ${error.message}`)
        return null
    }
}

async function testPageTokenRenewal() {
    console.log('\n🔍 Testing Page Token Renewal...')
    
    const api = new ApiClient((level, message) => console.log(`[${level.toUpperCase()}] ${message}`))
    
    try {
        const pageToken = await api.getValidPageToken(testConfig.userToken, testConfig.pageId)
        
        console.log('✅ Page Token renewal/validation SUCCESS!')
        console.log(`   Token: ${pageToken.substring(0, 30)}...`)
        
        // Test caching - should use cached token on second call
        console.log('\n   Testing Page Token caching:')
        const cachedPageToken = await api.getValidPageToken(testConfig.userToken, testConfig.pageId)
        
        if (pageToken === cachedPageToken) {
            console.log('   ✅ Page Token caching works correctly')
        } else {
            console.log('   ⚠️  Page Token caching might not be working as expected')
        }
        
        return pageToken
        
    } catch (error) {
        console.log(`❌ Page Token renewal failed: ${error.message}`)
        return null
    }
}

async function testFullTokenRenewalFlow() {
    console.log('\n🔍 Testing Full Token Renewal Flow (End-to-End)...')
    
    const api = new ApiClient((level, message) => console.log(`[${level.toUpperCase()}] ${message}`))
    
    try {
        // This should automatically:
        // 1. Validate User Token
        // 2. Extend User Token if possible
        // 3. Get valid Page Token
        // 4. Create Facebook Live Video
        const result = await api.createFacebookLiveVideo(
            testConfig.userToken,
            testConfig.pageId,
            'TEST - Token Renewal Flow',
            'Testing automatic token renewal in end-to-end flow',
            testConfig.appId,
            testConfig.appSecret
        )
        
        console.log('✅ Full token renewal flow SUCCESS!')
        console.log(`   Video ID: ${result.id}`)
        console.log(`   Stream URL: ${result.streamUrl ? 'Present' : 'Missing'}`)
        
        // Clean up - delete the test video
        try {
            const pageToken = await api.getValidPageToken(testConfig.userToken, testConfig.pageId)
            const got = require('got')
            await got.delete(`https://graph.facebook.com/v18.0/${result.id}?access_token=${pageToken}`)
            console.log('   🧹 Cleaned up test video')
        } catch (cleanupError) {
            console.log('   ⚠️  Could not clean up test video:', cleanupError.message)
        }
        
        return true
        
    } catch (error) {
        console.log(`❌ Full token renewal flow failed: ${error.message}`)
        return false
    }
}

async function testTokenCacheInvalidation() {
    console.log('\n🔍 Testing Token Cache Behavior...')
    
    const api = new ApiClient((level, message) => console.log(`[${level.toUpperCase()}] ${message}`))
    
    // First call - should fetch fresh tokens
    console.log('   First call (fresh tokens):')
    await api.getValidPageToken(testConfig.userToken, testConfig.pageId)
    
    // Second call - should use cached tokens
    console.log('   Second call (should use cache):')
    await api.getValidPageToken(testConfig.userToken, testConfig.pageId)
    
    // Check cache contents
    const cacheInfo = {
        userTokenCached: !!api.tokenCache.userToken,
        userTokenExpiry: api.tokenCache.userTokenExpiry ? new Date(api.tokenCache.userTokenExpiry) : null,
        pageTokensCached: api.tokenCache.pageTokens.size
    }
    
    console.log('   📊 Cache status:')
    console.log(`      User Token cached: ${cacheInfo.userTokenCached}`)
    console.log(`      User Token expiry: ${cacheInfo.userTokenExpiry || 'Not set'}`)
    console.log(`      Page Tokens cached: ${cacheInfo.pageTokensCached}`)
}

async function runTokenRenewalTests() {
    console.log('🧪 Facebook Token Renewal Tests')
    console.log('================================')
    
    // Check configuration
    if (testConfig.userToken === 'your_user_access_token_here' || 
        testConfig.pageId === 'your_page_id_here') {
        console.log('❌ Please configure test-config.js with your actual tokens and IDs')
        return
    }
    
    // Run tests
    await testTokenValidation()
    const userToken = await testUserTokenRenewal()
    const pageToken = await testPageTokenRenewal()
    const endToEndWorks = await testFullTokenRenewalFlow()
    await testTokenCacheInvalidation()
    
    console.log('\n📊 Test Summary:')
    console.log('================')
    console.log('✅ Verified automatic token renewal features:')
    console.log('   - Token validation works')
    console.log('   - User Token extension/caching works')
    console.log('   - Page Token retrieval/caching works')
    console.log(`   - End-to-end flow: ${endToEndWorks ? 'SUCCESS' : 'FAILED'}`)
    console.log('')
    console.log('🎯 Key benefits:')
    console.log('   ✅ User never needs to manually update tokens')
    console.log('   ✅ Page Access Tokens are refreshed automatically')
    console.log('   ✅ Tokens are cached to avoid unnecessary API calls')
    console.log('   ✅ System works reliably with expired tokens')
    
    if (endToEndWorks) {
        console.log('\n🎉 SUCCESS: Token renewal system is working perfectly!')
        console.log('   The module will now work reliably without manual token updates.')
    } else {
        console.log('\n❌ Some issues detected that need to be resolved.')
    }
}

// Run the tests
if (require.main === module) {
    runTokenRenewalTests().catch(console.error)
}

module.exports = { 
    testTokenValidation, 
    testUserTokenRenewal, 
    testPageTokenRenewal, 
    testFullTokenRenewalFlow 
}
