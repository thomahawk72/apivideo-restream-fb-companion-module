const got = require('got')

class ApiClient {
	constructor(logger) {
		this.log = logger
		// Cache for tokens to avoid unnecessary API calls
		this.tokenCache = {
			userToken: null,
			userTokenExpiry: null,
			pageTokens: new Map(), // pageId -> {token, expiry}
		}
	}

	/**
	 * Generate formatted stream name with current date
	 * Format: "Live - dd.mmmm.yy" (e.g., "Live - 01.oktober.25")
	 * @returns {string} Formatted stream name
	 */
	generateStreamName() {
		const now = new Date()
		const day = String(now.getDate()).padStart(2, '0')
		const year = String(now.getFullYear()).slice(-2)
		
		// Norwegian month names
		const monthNames = [
			'januar', 'februar', 'mars', 'april', 'mai', 'juni',
			'juli', 'august', 'september', 'oktober', 'november', 'desember'
		]
		const month = monthNames[now.getMonth()]
		
		return `Live - ${day}.${month}.${year}`
	}

	/**
	 * Create a new api.video live stream
	 * @param {string} apiKey - api.video API key
	 * @param {string} name - Name for the live stream
	 * @param {Array} restreams - Array of restream destinations (optional)
	 * @returns {Promise<Object>} Created live stream object
	 */
	async createApiVideoLiveStream(apiKey, name, restreams = []) {
		try {
			const payload = {
				name: name,
				record: true,
			}

			// Add restreams if provided
			if (restreams.length > 0) {
				payload.restreams = restreams
			}

			this.log('info', `api.video payload: ${JSON.stringify(payload, null, 2)}`)

			const response = await got.post('https://ws.api.video/live-streams', {
				headers: {
					'Authorization': `Bearer ${apiKey}`,
					'Content-Type': 'application/json',
				},
				json: payload,
				responseType: 'json',
				timeout: 10000,
			})

			if (response.body && response.body.liveStreamId) {
				this.log('info', `Successfully created api.video live stream: ${response.body.liveStreamId} (${name})`)
				return {
					id: response.body.liveStreamId,
					name: response.body.name,
					streamKey: response.body.streamKey,
					rtmpUrl: response.body.rtmpUrl,
					restreams: response.body.restreams || [],
				}
			} else {
				throw new Error('api.video API did not return live stream ID')
			}
		} catch (error) {
			this.log('error', `Failed to create api.video live stream: ${error.message}`)
			throw new Error(`api.video live stream creation error: ${error.message}`)
		}
	}


	/**
	 * Validate if a token is still valid by making a test API call
	 * @param {string} token - Token to validate
	 * @param {string} type - Type of token ('user' or 'page')
	 * @returns {Promise<boolean>} True if token is valid
	 */
	async validateToken(token, type = 'user') {
		try {
			const endpoint = type === 'user' ? 'me' : 'me' // Both use same endpoint for validation
			await got(`https://graph.facebook.com/${endpoint}?access_token=${token}`, {
				responseType: 'json',
				timeout: 5000,
			})
			return true
		} catch (error) {
			if (error.response?.body?.error?.code === 190) {
				this.log('debug', `${type} token is invalid or expired`)
				return false
			}
			// Other errors might be temporary, assume token is valid
			this.log('warn', `Could not validate ${type} token: ${error.message}`)
			return true
		}
	}

	/**
	 * Get a valid User Access Token, extending it if necessary
	 * @param {string} userToken - Current User Access Token
	 * @param {string} appId - Facebook App ID (optional)
	 * @param {string} appSecret - Facebook App Secret (optional)
	 * @returns {Promise<string>} Valid User Access Token
	 */
	async getValidUserToken(userToken, appId = null, appSecret = null) {
		// Check if we have a cached valid token
		if (this.tokenCache.userToken && 
			this.tokenCache.userTokenExpiry && 
			Date.now() < this.tokenCache.userTokenExpiry) {
			this.log('debug', 'Using cached extended User Token')
			return this.tokenCache.userToken
		}

		// Validate current token
		const isValid = await this.validateToken(userToken, 'user')
		if (isValid) {
			// Try to extend token if credentials are available
			if (appId && appSecret) {
				try {
					this.log('info', 'Extending User Access Token for long-term reliability...')
					const extendedToken = await this.extendUserAccessToken(userToken, appId, appSecret)
					
					// Cache the extended token (Facebook long-lived tokens last ~60 days)
					this.tokenCache.userToken = extendedToken
					this.tokenCache.userTokenExpiry = Date.now() + (50 * 24 * 60 * 60 * 1000) // 50 days to be safe
					
					return extendedToken
				} catch (error) {
					this.log('warn', `Failed to extend User Token, using original: ${error.message}`)
					return userToken
				}
			} else {
				this.log('debug', 'User Token is valid, but no App credentials for extension')
				return userToken
			}
		} else {
			throw new Error('User Access Token is invalid or expired. Please update the token in configuration.')
		}
	}

	/**
	 * Get a valid Page Access Token, refreshing from User Token if necessary
	 * @param {string} userToken - Valid User Access Token
	 * @param {string} pageId - Facebook Page ID
	 * @returns {Promise<string>} Valid Page Access Token
	 */
	async getValidPageToken(userToken, pageId) {
		// Check if we have a cached valid token for this page
		const cached = this.tokenCache.pageTokens.get(pageId)
		if (cached && cached.expiry && Date.now() < cached.expiry) {
			// Validate cached token
			const isValid = await this.validateToken(cached.token, 'page')
			if (isValid) {
				this.log('debug', `Using cached Page Token for page ${pageId}`)
				return cached.token
			} else {
				this.log('info', `Cached Page Token for page ${pageId} is invalid, refreshing...`)
				this.tokenCache.pageTokens.delete(pageId)
			}
		}

		// Get fresh Page Access Token
		this.log('info', `Retrieving fresh Page Access Token for page ${pageId}...`)
		const pageToken = await this.getPageAccessToken(userToken, pageId)
		
		// Cache the Page Token (Page tokens typically don't expire unless User Token expires)
		this.tokenCache.pageTokens.set(pageId, {
			token: pageToken,
			expiry: Date.now() + (24 * 60 * 60 * 1000) // Cache for 24 hours, then refresh
		})
		
		return pageToken
	}

	/**
	 * Extend User Access Token to long-lived token (as per Facebook best practices)
	 * @param {string} shortLivedToken - Short-lived User Access Token
	 * @param {string} appId - Facebook App ID
	 * @param {string} appSecret - Facebook App Secret
	 * @returns {Promise<string>} Extended long-lived User Access Token
	 */
	async extendUserAccessToken(shortLivedToken, appId, appSecret) {
		try {
			const response = await got(`https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`, {
				responseType: 'json',
				timeout: 10000,
			})

			if (response.body && response.body.access_token) {
				this.log('info', `Successfully extended User Access Token. Expires in: ${response.body.expires_in} seconds`)
				return response.body.access_token
			} else {
				throw new Error('No extended token returned from Facebook API')
			}
		} catch (error) {
			this.log('error', `Failed to extend User Access Token: ${error.message}`)
			throw new Error(`Token extension error: ${error.message}`)
		}
	}

	/**
	 * Get Page Access Token from User Access Token (as per Facebook best practices)
	 * @param {string} userToken - Facebook User Access Token
	 * @param {string} pageId - Facebook Page ID
	 * @returns {Promise<string>} Page Access Token
	 */
	async getPageAccessToken(userToken, pageId) {
		try {
			const response = await got(`https://graph.facebook.com/me/accounts?access_token=${userToken}`, {
				responseType: 'json',
				timeout: 10000,
			})

			if (response.body && response.body.data) {
				const page = response.body.data.find(p => p.id === pageId)
				if (page && page.access_token) {
					this.log('info', `Successfully retrieved Page Access Token for page: ${page.name}`)
					return page.access_token
				} else {
					throw new Error(`Page ${pageId} not found or no access token available. Available pages: ${response.body.data.map(p => `${p.name} (${p.id})`).join(', ')}`)
				}
			} else {
				throw new Error('No page data returned from Facebook API')
			}
		} catch (error) {
			this.log('error', `Failed to retrieve Page Access Token: ${error.message}`)
			throw new Error(`Page Access Token retrieval error: ${error.message}`)
		}
	}

	/**
	 * Create a new Facebook Live Video and get streaming URL (with automatic token renewal)
	 * @param {string} userToken - Facebook User Access Token
	 * @param {string} pageId - Facebook Page ID
	 * @param {string} title - Live video title
	 * @param {string} description - Live video description
	 * @param {string} appId - Facebook App ID (optional, for token extension)
	 * @param {string} appSecret - Facebook App Secret (optional, for token extension)
	 * @returns {Promise<Object>} Facebook Live Video object with streaming URL
	 */
	async createFacebookLiveVideo(userToken, pageId, title = 'Live Stream', description = 'Live stream via api.video', appId = null, appSecret = null) {
		try {
			// Step 1: Get a valid User Token (extends automatically if possible)
			this.log('info', 'Ensuring User Access Token is valid...')
			const validUserToken = await this.getValidUserToken(userToken, appId, appSecret)

			// Step 2: Get a valid Page Access Token (refreshes automatically if needed)
			this.log('info', 'Ensuring Page Access Token is valid...')
			const validPageToken = await this.getValidPageToken(validUserToken, pageId)

			// Step 3: Create Facebook Live Video with valid Page Token
			this.log('info', 'Creating Facebook Live Video with validated tokens...')
			const response = await got.post(`https://graph.facebook.com/v18.0/${pageId}/live_videos`, {
				form: {
					title: title,
					description: description,
					access_token: validPageToken, // Use validated Page Token
				},
				responseType: 'json',
				timeout: 10000,
			})

			if (response.body && response.body.secure_stream_url) {
				const streamUrl = response.body.secure_stream_url
				const streamKey = response.body.stream_url ? response.body.stream_url.split('/').pop() : null

				// Parse RTMP URL to get server and key
				const rtmpMatch = streamUrl.match(/^(rtmps?:\/\/[^\/]+\/)(.+)$/)
				if (rtmpMatch) {
					const serverUrl = rtmpMatch[1]
					const fullKey = rtmpMatch[2]
					
					// Extract clean stream key from Facebook RTMP path (remove rtmp/ prefix and query parameters)
					let key = fullKey
					if (fullKey.startsWith('rtmp/')) {
						// Remove 'rtmp/' prefix and everything after '?' (query parameters)
						key = fullKey.replace('rtmp/', '').split('?')[0]
					}

					this.log('info', `Facebook RTMP parsing: fullKey="${fullKey}" -> clean key="${key}"`)
					this.log('info', `Successfully created Facebook Live Video: ${response.body.id}`)
					return {
						id: response.body.id,
						streamUrl: streamUrl,
						serverUrl: serverUrl,
						streamKey: key,
						title: title,
						description: description,
					}
				} else {
					throw new Error('Could not parse Facebook streaming URL')
				}
			} else {
				throw new Error('Facebook API did not return streaming URL')
			}
		} catch (error) {
			this.log('error', `Failed to create Facebook Live Video: ${error.message}`)
			
			// Provide more specific error messages for common issues
			if (error.response && error.response.body) {
				const fbError = error.response.body.error
				if (fbError) {
					if (fbError.code === 190) {
						throw new Error('Facebook token is invalid or expired')
					} else if (fbError.code === 200) {
						throw new Error('Insufficient permissions - need publish_video permission')
					} else {
						throw new Error(`Facebook API error: ${fbError.message}`)
					}
				}
			}
			
			throw new Error(`Facebook Live Video creation error: ${error.message}`)
		}
	}

	/**
	 * Parse RTMP URL into server URL and stream key components
	 * @param {string} rtmpUrl - Full RTMP URL
	 * @returns {Object} Object with serverUrl and streamKey
	 */
	parseRtmpUrl(rtmpUrl) {
		const match = rtmpUrl.match(/^(rtmps?:\/\/[^\/]+\/)(.+)$/)
		if (match) {
			return {
				serverUrl: match[1],
				streamKey: match[2],
			}
		}
		throw new Error('Invalid RTMP URL format')
	}
}

module.exports = ApiClient
