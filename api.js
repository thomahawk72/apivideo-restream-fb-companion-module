const got = require('got')

class ApiClient {
	constructor(logger) {
		this.log = logger
	}

	/**
	 * Fetch all live streams from api.video
	 * @param {string} apiKey - api.video API key
	 * @returns {Promise<Array>} Array of live stream objects
	 */
	async getApiVideoLiveStreams(apiKey) {
		try {
			const response = await got('https://ws.api.video/live-streams', {
				headers: {
					'Authorization': `Bearer ${apiKey}`,
					'Content-Type': 'application/json',
				},
				responseType: 'json',
				timeout: 10000,
			})

			if (response.body && response.body.data) {
				return response.body.data.map(stream => ({
					id: stream.liveStreamId,
					label: stream.name || `Live Stream ${stream.liveStreamId}`,
					name: stream.name,
					streamKey: stream.streamKey,
					rtmpUrl: stream.rtmpUrl,
				}))
			}

			return []
		} catch (error) {
			this.log('error', `Failed to fetch api.video live streams: ${error.message}`)
			throw new Error(`api.video API error: ${error.message}`)
		}
	}

	/**
	 * Update api.video live stream with Facebook restream destination
	 * @param {string} apiKey - api.video API key
	 * @param {string} liveStreamId - api.video live stream ID
	 * @param {string} fbServerUrl - Facebook RTMP server URL
	 * @param {string} fbStreamKey - Facebook stream key
	 * @returns {Promise<Object>} Updated live stream object
	 */
	async updateApiVideoRestream(apiKey, liveStreamId, fbServerUrl, fbStreamKey) {
		try {
			// First, get current restreams to avoid overwriting existing ones
			const currentResponse = await got(`https://ws.api.video/live-streams/${liveStreamId}`, {
				headers: {
					'Authorization': `Bearer ${apiKey}`,
					'Content-Type': 'application/json',
				},
				responseType: 'json',
				timeout: 10000,
			})

			const currentRestreams = currentResponse.body.restreams || []
			
			// Add Facebook restream (remove existing Facebook restreams first)
			const filteredRestreams = currentRestreams.filter(r => !r.name?.toLowerCase().includes('facebook'))
			const updatedRestreams = [
				...filteredRestreams,
				{
					name: 'Facebook Live',
					serverUrl: fbServerUrl,
					streamKey: fbStreamKey,
				}
			]

			const response = await got.patch(`https://ws.api.video/live-streams/${liveStreamId}`, {
				headers: {
					'Authorization': `Bearer ${apiKey}`,
					'Content-Type': 'application/json',
				},
				json: {
					restreams: updatedRestreams,
				},
				responseType: 'json',
				timeout: 10000,
			})

			this.log('info', `Successfully updated api.video live stream ${liveStreamId} with Facebook restream`)
			return response.body
		} catch (error) {
			this.log('error', `Failed to update api.video restream: ${error.message}`)
			throw new Error(`api.video restream update error: ${error.message}`)
		}
	}

	/**
	 * Create a new Facebook Live Video and get streaming URL
	 * @param {string} userToken - Facebook User Access Token
	 * @param {string} pageId - Facebook Page ID
	 * @param {string} title - Live video title
	 * @param {string} description - Live video description
	 * @returns {Promise<Object>} Facebook Live Video object with streaming URL
	 */
	async createFacebookLiveVideo(userToken, pageId, title = 'Live Stream', description = 'Live stream via api.video') {
		try {
			const response = await got.post(`https://graph.facebook.com/v18.0/${pageId}/live_videos`, {
				form: {
					title: title,
					description: description,
					access_token: userToken,
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
					const key = rtmpMatch[2]

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
