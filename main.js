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
		this.liveStreams = []
		this.feedbackState = 'idle' // idle, in_progress, ok, fail
		this.lastError = ''
		this.lastFacebookVideoId = ''
	}

	async init(config) {
		this.config = config
		this.log('info', 'Initializing Facebook & api.video module')

		// Validate configuration
		if (!this.validateConfig(config)) {
			this.updateStatus(InstanceStatus.BadConfig, 'Missing required configuration')
			return
		}

		// Load live streams from api.video
		await this.loadLiveStreams()

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

		// Reload live streams if api.video key changed
		await this.loadLiveStreams()

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
		const required = ['fb_page_id', 'fb_user_token', 'apivideo_api_key']
		
		for (const field of required) {
			if (!config[field] || config[field].trim() === '') {
				this.log('warn', `Missing required configuration field: ${field}`)
				return false
			}
		}

		return true
	}

	/**
	 * Load live streams from api.video and update configuration choices
	 */
	async loadLiveStreams() {
		if (!this.config.apivideo_api_key) {
			this.liveStreams = [{ id: '', label: 'No API key configured' }]
			return
		}

		try {
			this.log('info', 'Loading live streams from api.video...')
			const streams = await this.api.getApiVideoLiveStreams(this.config.apivideo_api_key)
			
			if (streams.length === 0) {
				this.liveStreams = [{ id: '', label: 'No live streams found' }]
				this.log('warn', 'No live streams found in api.video account')
			} else {
				this.liveStreams = streams.map(stream => ({
					id: stream.id,
					label: stream.label,
				}))
				this.log('info', `Loaded ${streams.length} live streams from api.video`)
			}
		} catch (error) {
			this.liveStreams = [{ id: '', label: 'Error loading streams - check API key' }]
			this.log('error', `Failed to load live streams: ${error.message}`)
		}

		// Update configuration to refresh dropdown choices
		this.configUpdated(this.config)
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
		const selectedStream = this.liveStreams.find(s => s.id === this.config.apivideo_livestream_id)
		const isReady = this.config && 
			this.config.fb_page_id && 
			this.config.fb_user_token && 
			this.config.apivideo_api_key && 
			this.config.apivideo_livestream_id

		this.setVariableValues({
			status: this.feedbackState,
			last_error: this.lastError,
			facebook_video_id: this.lastFacebookVideoId,
			selected_livestream: selectedStream ? selectedStream.label : 'None',
			livestreams_count: this.liveStreams.length.toString(),
			module_ready: isReady ? 'true' : 'false',
		})
	}

	/**
	 * Execute the prepare live action
	 */
	async executePrepareLife(title = 'Live Stream via api.video', description = 'Automated live stream setup') {
		this.log('info', 'Starting Facebook restream preparation...')
		this.setFeedbackState('in_progress')

		try {
			// Validate that a live stream is selected
			if (!this.config.apivideo_livestream_id) {
				throw new Error('No api.video live stream selected')
			}

			// Step 1: Create Facebook Live Video (with automatic token validation and renewal)
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

			// Step 2: Update api.video restream
			this.log('info', 'Updating api.video restream destination...')
			await this.api.updateApiVideoRestream(
				this.config.apivideo_api_key,
				this.config.apivideo_livestream_id,
				fbLiveVideo.serverUrl,
				fbLiveVideo.streamKey
			)

			this.log('info', 'Facebook restream preparation completed successfully')
			this.setFeedbackState('ok')

		} catch (error) {
			this.log('error', `Facebook restream preparation failed: ${error.message}`)
			this.setFeedbackState('fail', error.message)
		}
	}
}

runEntrypoint(FacebookApiVideoInstance, [])
