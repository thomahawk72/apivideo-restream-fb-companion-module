module.exports = function (self) {
	return {
		prepare_live: {
			name: 'Prepare Live Stream',
			description: 'Create a new api.video live stream with restream destinations (Facebook/Youtube)',
			options: [
				{
					type: 'static-text',
					id: 'info',
					width: 12,
					label: 'Action Information',
					value: 'This action will:\n1. Create a new api.video live stream with auto-generated name "Live - dd.mmmm.yy"\n2. Optionally create Facebook/Youtube Live Video(s) if destinations are enabled\n3. Provide RTMP URL and Stream Key via variables for use in streaming software\n\nAt minimum, you only need api.video API key configured. Restream destinations are optional.',
				},
				{
					type: 'textinput',
					id: 'title',
					label: 'Live Stream Title',
					width: 12,
					default: 'Live Stream',
					tooltip: 'Title for the Facebook Live Video (used if Facebook restream is enabled)',
				},
				{
					type: 'textinput',
					id: 'description',
					label: 'Live Stream Description',
					width: 12,
					default: 'Automated live stream setup',
					tooltip: 'Description for the Facebook Live Video (used if Facebook restream is enabled)',
				},
			],
			callback: async (action, context) => {
				// Get title and description from action options, with fallbacks
				const title = action.options.title || 'Live Stream'
				const description = action.options.description || 'Automated live stream setup'
				
				// Parse variables in title and description
				const parsedTitle = await context.parseVariablesInString(title)
				const parsedDescription = await context.parseVariablesInString(description)
				
				// Execute the prepare live action with custom title/description
				await self.executePrepareLife(parsedTitle, parsedDescription)
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
