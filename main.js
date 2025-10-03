const { InstanceBase, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const ApiClient = require('./api')
const getConfigFields = require('./config')
const getActions = require('./actions')
const getFeedbacks = require('./feedbacks')
const getVariables = require('./variables')

class FacebookApiVideoInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
		
		// Initialize API client
		this.api = new ApiClient((level, message) => this.log(level, message))
		
		// Initialize state
		this.feedbackState = 'idle' // idle, in_progress, ok, fail
		this.lastError = ''
		this.lastFacebookVideoId = ''
		this.lastYoutubeVideoId = ''
		this.lastLiveStreamId = ''
		this.lastRtmpUrl = ''
		this.lastStreamKey = ''
	}

	async init(config) {
		this.config = config
		this.log('info', 'Initializing Facebook & Youtube api.video restream module')

		// Validate configuration
		if (!this.validateConfig(config)) {
			this.updateStatus(InstanceStatus.BadConfig, 'Missing required configuration')
			return
		}

		// Initialize actions, feedbacks, and variables
		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableDefinitions()
		this.updateVariableValues()

		this.updateStatus(InstanceStatus.Ok)
		this.log('info', 'Module initialized successfully')
	}

	async destroy() {
		this.log('debug', 'Module destroyed')
	}

	async configUpdated(config) {
		this.config = config
		this.log('info', 'Configuration updated')

		// Validate new configuration
		if (!this.validateConfig(config)) {
			this.updateStatus(InstanceStatus.BadConfig, 'Missing required configuration')
			return
		}

		// Update actions and feedbacks with new config
		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableValues()

		this.updateStatus(InstanceStatus.Ok)
	}

	/**
	 * Validate that all required configuration fields are present
	 */
	validateConfig(config) {
		// api.video API key is always required
		if (!config.apivideo_api_key || config.apivideo_api_key.trim() === '') {
			this.log('warn', 'Missing required configuration field: apivideo_api_key')
			return false
		}

		return true
	}

	/**
	 * Validate configuration for restream operations
	 * This is called when preparing live stream, not for basic config saving
	 */
	validateRestreamConfig(config) {
		// Check if at least one restream destination is enabled
		const fbEnabled = config.enable_facebook_restream
		const ytEnabled = config.enable_youtube_restream

		if (!fbEnabled && !ytEnabled) {
			// No restream destinations enabled - this is OK, just create stream without restreams
			return { valid: true, restreams: [] }
		}

		const restreams = []

		// Validate Facebook configuration if enabled
		if (fbEnabled) {
			const fbRequired = ['fb_page_id', 'fb_user_token']
			for (const field of fbRequired) {
				if (!config[field] || config[field].trim() === '') {
					this.log('warn', `Missing required Facebook configuration field: ${field}`)
					return { valid: false, error: `Missing required Facebook configuration: ${field}` }
				}
			}
			restreams.push('facebook')
		}

		// Validate Youtube configuration if enabled
		if (ytEnabled) {
			const ytRequired = ['yt_rtmp_url', 'yt_stream_key']
			for (const field of ytRequired) {
				if (!config[field] || config[field].trim() === '') {
					this.log('warn', `Missing required Youtube configuration field: ${field}`)
					return { valid: false, error: `Missing required Youtube configuration: ${field}` }
				}
			}
			restreams.push('youtube')
		}

		return { valid: true, restreams }
	}

	/**
	 * Get configuration fields
	 */
	getConfigFields() {
		return getConfigFields(this)
	}

	/**
	 * Update actions
	 */
	updateActions() {
		this.setActionDefinitions(getActions(this))
	}

	/**
	 * Update feedbacks
	 */
	updateFeedbacks() {
		this.setFeedbackDefinitions(getFeedbacks(this))
	}

	/**
	 * Update variable definitions
	 */
	updateVariableDefinitions() {
		this.setVariableDefinitions(getVariables(this))
	}

	/**
	 * Set feedback state and trigger feedback updates
	 */
	setFeedbackState(state, error = '') {
		this.feedbackState = state
		this.lastError = error
		
		// Update all variables
		this.updateVariableValues()

		// Trigger feedback updates
		this.checkFeedbacks()
		
		this.log('debug', `Feedback state changed to: ${state}`)
	}

	/**
	 * Update all variable values
	 */
	updateVariableValues() {
		const isReady = this.validateConfig(this.config)

		this.setVariableValues({
			status: this.feedbackState,
			last_error: this.lastError,
			facebook_video_id: this.lastFacebookVideoId,
			youtube_video_id: this.lastYoutubeVideoId,
			livestream_id: this.lastLiveStreamId,
			rtmp_url: this.lastRtmpUrl,
			stream_key: this.lastStreamKey,
			module_ready: isReady ? 'true' : 'false',
		})
	}

	/**
	 * Execute the prepare live action
	 */
	async executePrepareLife(title = 'Live Stream', description = 'Automated live stream setup') {
		this.log('info', 'Starting live stream preparation...')
		this.setFeedbackState('in_progress')

		try {
			// Validate restream configuration
			const restreamValidation = this.validateRestreamConfig(this.config)
			if (!restreamValidation.valid) {
				throw new Error(restreamValidation.error)
			}

			const restreams = []

			// Step 1: Prepare Facebook restream if enabled
			if (this.config.enable_facebook_restream) {
				this.log('info', 'Creating Facebook Live Video with automatic token management...')
				const fbLiveVideo = await this.api.createFacebookLiveVideo(
					this.config.fb_user_token,
					this.config.fb_page_id,
					title,
					description,
					this.config.fb_app_id,
					this.config.fb_app_secret
				)

				this.lastFacebookVideoId = fbLiveVideo.id
				this.log('info', `Facebook Live Video created: ${fbLiveVideo.id}`)

				restreams.push({
					name: 'Facebook Live',
					serverUrl: fbLiveVideo.serverUrl,
					streamKey: fbLiveVideo.streamKey,
				})
			}

			// Step 2: Prepare Youtube restream if enabled
			if (this.config.enable_youtube_restream) {
				this.log('info', 'Adding Youtube restream destination...')
				
				restreams.push({
					name: 'Youtube Live',
					serverUrl: this.config.yt_rtmp_url,
					streamKey: this.config.yt_stream_key,
				})

				this.log('info', 'Youtube restream destination added')
			}

			// Step 3: Create new api.video live stream with restreams (if any)
			const streamName = this.api.generateStreamName()
			this.log('info', `Creating new api.video live stream: ${streamName}`)
			
			const liveStream = await this.api.createApiVideoLiveStream(
				this.config.apivideo_api_key,
				streamName,
				restreams
			)

			this.lastLiveStreamId = liveStream.id
			this.lastRtmpUrl = liveStream.rtmpUrl
			this.lastStreamKey = liveStream.streamKey
			this.log('info', `Live stream created successfully: ${liveStream.id}`)
			this.log('info', `RTMP URL: ${liveStream.rtmpUrl}`)
			this.log('info', `Stream Key: ${liveStream.streamKey}`)

			if (restreams.length > 0) {
				const destNames = restreams.map(r => r.name).join(', ')
				this.log('info', `Live stream created with restream destinations: ${destNames}`)
			} else {
				this.log('info', 'Live stream created without restream destinations')
			}

			this.setFeedbackState('ok')

		} catch (error) {
			this.log('error', `Live stream preparation failed: ${error.message}`)
			this.setFeedbackState('fail', error.message)
		}
	}
}

runEntrypoint(FacebookApiVideoInstance, [])
