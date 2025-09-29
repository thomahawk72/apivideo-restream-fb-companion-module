module.exports = function (self) {
	return [
		{
			name: 'Status',
			variableId: 'status',
			description: 'Current status of the restream preparation (idle, in_progress, ok, fail)',
		},
		{
			name: 'Last Error',
			variableId: 'last_error',
			description: 'Error message from the last failed operation (empty if no error)',
		},
		{
			name: 'Facebook Video ID',
			variableId: 'facebook_video_id',
			description: 'ID of the last created Facebook Live Video',
		},
		{
			name: 'Selected Live Stream',
			variableId: 'selected_livestream',
			description: 'Name of the currently selected api.video live stream',
		},
		{
			name: 'Live Streams Count',
			variableId: 'livestreams_count',
			description: 'Number of available api.video live streams',
		},
		{
			name: 'Module Ready',
			variableId: 'module_ready',
			description: 'Whether the module is properly configured and ready (true/false)',
		},
	]
}
