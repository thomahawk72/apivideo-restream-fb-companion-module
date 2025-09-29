module.exports = function (self) {
	return {
		prepare_live: {
			name: 'Prepare Facebook Restream',
			description: 'Create Facebook Live Video and add as restream destination to selected api.video live stream',
			options: [
				{
					type: 'static-text',
					id: 'info',
					width: 12,
					label: 'Action Information',
					value: 'This action will:\n1. Create a new Facebook Live Video\n2. Add the Facebook streaming URL as a restream destination to your selected api.video live stream\n\nMake sure you have selected a live stream in the module configuration.',
				},
				{
					type: 'textinput',
					id: 'title',
					label: 'Facebook Live Title',
					width: 12,
					default: 'Live Stream via api.video',
					tooltip: 'Title for the Facebook Live Video (optional)',
				},
				{
					type: 'textinput',
					id: 'description',
					label: 'Facebook Live Description',
					width: 12,
					default: 'Automated live stream setup',
					tooltip: 'Description for the Facebook Live Video (optional)',
				},
			],
			callback: async (action, context) => {
				// Get title and description from action options, with fallbacks
				const title = action.options.title || 'Live Stream via api.video'
				const description = action.options.description || 'Automated live stream setup'
				
				// Parse variables in title and description
				const parsedTitle = await context.parseVariablesInString(title)
				const parsedDescription = await context.parseVariablesInString(description)
				
				// Execute the prepare live action with custom title/description
				await self.executePrepareLife(parsedTitle, parsedDescription)
			},
		},
		
		refresh_streams: {
			name: 'Refresh Live Streams',
			description: 'Reload the list of available live streams from api.video',
			options: [],
			callback: async (action, context) => {
				self.log('info', 'Refreshing live streams list...')
				await self.loadLiveStreams()
				self.log('info', 'Live streams list refreshed')
			},
		},
		
		reset_status: {
			name: 'Reset Status',
			description: 'Reset the module status back to idle',
			options: [],
			callback: async (action, context) => {
				self.log('info', 'Resetting module status to idle')
				self.setFeedbackState('idle')
			},
		},
	}
}
