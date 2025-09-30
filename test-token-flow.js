#!/usr/bin/env node

/**
 * Test script for verifying Facebook Graph API token handling
 * This tests the specific issues identified in the dialog comparison
 */

const got = require('got')
const fs = require('fs')
const path = require('path')

// Try to load configuration from file or environment
let TEST_CONFIG = {
    userToken: process.env.FB_USER_TOKEN || 'YOUR_USER_ACCESS_TOKEN_HERE',
    pageId: process.env.FB_PAGE_ID || 'YOUR_PAGE_ID_HERE',
    appId: process.env.FB_APP_ID || 'YOUR_APP_ID_HERE',
    appSecret: process.env.FB_APP_SECRET || 'YOUR_APP_SECRET_HERE'
}

// Try to load from test-config.js file if it exists
try {
    const configPath = path.join(__dirname, 'test-config.js')
    if (fs.existsSync(configPath)) {
        const fileConfig = require('./test-config.js')
        TEST_CONFIG = { ...TEST_CONFIG, ...fileConfig }
        console.log('📁 Loaded configuration from test-config.js')
    }
} catch (error) {
    // Ignore file loading errors, fall back to environment/defaults
}

async function debugTokenInfo() {
    console.log('\n🔧 Debug Token Information...')
    try {
        const response = await got(`https://graph.facebook.com/debug_token?input_token=${TEST_CONFIG.userToken}&access_token=${TEST_CONFIG.userToken}`, {
            responseType: 'json'
        })
        const data = response.body.data
        console.log('📊 Token Details:')
        console.log(`   App ID: ${data.app_id}`)
        console.log(`   Valid: ${data.is_valid}`)
        console.log(`   Expires: ${data.expires_at ? new Date(data.expires_at * 1000) : 'Never'}`)
        console.log(`   Scopes: ${data.scopes ? data.scopes.join(', ') : 'None'}`)
        console.log(`   User ID: ${data.user_id}`)
        return data
    } catch (error) {
        console.log('❌ Could not debug token:', error.message)
        return null
    }
}

async function testUserTokenInfo() {
    console.log('\n🔍 Testing User Token Info...')
    try {
        const response = await got(`https://graph.facebook.com/me?access_token=${TEST_CONFIG.userToken}`, {
            responseType: 'json'
        })
        console.log('✅ User Token is valid')
        console.log(`   User: ${response.body.name} (ID: ${response.body.id})`)
        return true
    } catch (error) {
        console.log('❌ User Token is invalid:', error.message)
        if (error.response?.body?.error) {
            const fbError = error.response.body.error
            console.log(`   Facebook Error: ${fbError.message} (Code: ${fbError.code})`)
            if (fbError.code === 190) {
                console.log('   💡 This usually means the token is expired or invalid')
                console.log('   💡 Generate a new token at: https://developers.facebook.com/tools/explorer/')
            }
        }
        console.log(`   Token used: ${TEST_CONFIG.userToken.substring(0, 20)}...`)
        return false
    }
}

async function testPageAccessTokenRetrieval() {
    console.log('\n🔍 Testing Page Access Token Retrieval (as per dialog)...')
    try {
        const response = await got(`https://graph.facebook.com/me/accounts?access_token=${TEST_CONFIG.userToken}`, {
            responseType: 'json'
        })
        
        console.log('✅ Successfully retrieved page accounts')
        console.log(`   Found ${response.body.data.length} pages`)
        
        const targetPage = response.body.data.find(page => page.id === TEST_CONFIG.pageId)
        if (targetPage) {
            console.log(`✅ Found target page: ${targetPage.name}`)
            console.log(`   Page Access Token: ${targetPage.access_token.substring(0, 20)}...`)
            console.log(`   Permissions: ${targetPage.perms ? targetPage.perms.join(', ') : 'Not shown'}`)
            return targetPage.access_token
        } else {
            console.log(`❌ Target page ${TEST_CONFIG.pageId} not found in accessible pages`)
            console.log('   Available pages:')
            response.body.data.forEach(page => {
                console.log(`     - ${page.name} (ID: ${page.id})`)
            })
            return null
        }
    } catch (error) {
        console.log('❌ Failed to retrieve page access token:', error.message)
        return null
    }
}

async function testCurrentImplementationVsCorrect(pageAccessToken) {
    console.log('\n🔍 Testing Current Implementation vs Correct Implementation...')
    
    // Test 1: Current implementation (using User Token directly)
    console.log('\n   Testing CURRENT implementation (User Token directly):')
    try {
        const response = await got.post(`https://graph.facebook.com/v18.0/${TEST_CONFIG.pageId}/live_videos`, {
            form: {
                title: 'TEST - Current Implementation',
                description: 'Testing current implementation with User Token',
                access_token: TEST_CONFIG.userToken,
                status: 'UNPUBLISHED' // Don't actually go live
            },
            responseType: 'json'
        })
        console.log('   ⚠️  Current implementation worked (may be due to permissions)')
        console.log(`      Video ID: ${response.body.id}`)
        
        // Clean up - delete the test video
        await got.delete(`https://graph.facebook.com/v18.0/${response.body.id}?access_token=${TEST_CONFIG.userToken}`)
        console.log('   🧹 Cleaned up test video')
        
    } catch (error) {
        console.log('   ❌ Current implementation failed:', error.message)
        if (error.response?.body?.error) {
            console.log(`      FB Error: ${error.response.body.error.message} (Code: ${error.response.body.error.code})`)
        }
    }
    
    // Test 2: Correct implementation (using Page Token)
    if (pageAccessToken) {
        console.log('\n   Testing CORRECT implementation (Page Access Token):')
        try {
            const response = await got.post(`https://graph.facebook.com/v18.0/${TEST_CONFIG.pageId}/live_videos`, {
                form: {
                    title: 'TEST - Correct Implementation',
                    description: 'Testing correct implementation with Page Access Token',
                    access_token: pageAccessToken,
                    status: 'UNPUBLISHED' // Don't actually go live
                },
                responseType: 'json'
            })
            console.log('   ✅ Correct implementation worked')
            console.log(`      Video ID: ${response.body.id}`)
            console.log(`      Stream URL: ${response.body.secure_stream_url ? 'Present' : 'Missing'}`)
            
            // Clean up - delete the test video
            await got.delete(`https://graph.facebook.com/v18.0/${response.body.id}?access_token=${pageAccessToken}`)
            console.log('   🧹 Cleaned up test video')
            
        } catch (error) {
            console.log('   ❌ Correct implementation failed:', error.message)
            if (error.response?.body?.error) {
                console.log(`      FB Error: ${error.response.body.error.message} (Code: ${error.response.body.error.code})`)
            }
        }
    }
}

async function testTokenExtension() {
    console.log('\n🔍 Testing Token Extension (as per dialog)...')
    
    if (!TEST_CONFIG.appId || !TEST_CONFIG.appSecret || 
        TEST_CONFIG.appId === 'YOUR_APP_ID_HERE' || 
        TEST_CONFIG.appSecret === 'YOUR_APP_SECRET_HERE') {
        console.log('⚠️  Skipping token extension test - App ID/Secret not configured')
        return
    }
    
    try {
        const response = await got(`https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${TEST_CONFIG.appId}&client_secret=${TEST_CONFIG.appSecret}&fb_exchange_token=${TEST_CONFIG.userToken}`, {
            responseType: 'json'
        })
        
        console.log('✅ Token extension successful')
        console.log(`   Extended token: ${response.body.access_token.substring(0, 20)}...`)
        console.log(`   Expires in: ${response.body.expires_in} seconds`)
        
    } catch (error) {
        console.log('❌ Token extension failed:', error.message)
        if (error.response?.body?.error) {
            console.log(`   FB Error: ${error.response.body.error.message}`)
        }
    }
}

async function runTests() {
    console.log('🧪 Facebook Graph API Token Flow Test')
    console.log('=====================================')
    
    // Check configuration
    if (TEST_CONFIG.userToken === 'YOUR_USER_ACCESS_TOKEN_HERE' || 
        TEST_CONFIG.pageId === 'YOUR_PAGE_ID_HERE') {
        console.log('❌ Please configure TEST_CONFIG with your actual tokens and IDs')
        console.log('   You can also use environment variables:')
        console.log('   FB_USER_TOKEN, FB_PAGE_ID, FB_APP_ID, FB_APP_SECRET')
        return
    }
    
    // Run tests
    const userTokenValid = await testUserTokenInfo()
    if (!userTokenValid) {
        await debugTokenInfo()
        return
    }
    
    const pageAccessToken = await testPageAccessTokenRetrieval()
    await testCurrentImplementationVsCorrect(pageAccessToken)
    await testTokenExtension()
    
    console.log('\n📊 Test Summary:')
    console.log('================')
    console.log('This test verified:')
    console.log('✓ Whether User Token is valid')
    console.log('✓ Whether Page Access Token can be retrieved (/accounts endpoint)')
    console.log('✓ Difference between using User Token vs Page Token for live videos')
    console.log('✓ Whether token extension works (if configured)')
    console.log('\n💡 Key findings from dialog comparison:')
    console.log('- Current code uses User Token directly (may work but not best practice)')
    console.log('- Should use Page Access Token from /accounts endpoint')
    console.log('- Should implement token extension for long-term reliability')
}

// Run the tests
if (require.main === module) {
    runTests().catch(console.error)
}

module.exports = { runTests, testPageAccessTokenRetrieval, testTokenExtension }
