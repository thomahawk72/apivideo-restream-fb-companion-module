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
			name: 'Youtube Video ID',
			variableId: 'youtube_video_id',
			description: 'ID of the last created Youtube Live Video (if applicable)',
		},
		{
			name: 'Live Stream ID',
			variableId: 'livestream_id',
			description: 'ID of the last created api.video live stream',
		},
		{
			name: 'RTMP URL',
			variableId: 'rtmp_url',
			description: 'RTMP URL for the last created live stream (use this in your streaming software)',
		},
		{
			name: 'Stream Key',
			variableId: 'stream_key',
			description: 'Stream key for the last created live stream (use this in your streaming software)',
		},
		{
			name: 'Module Ready',
			variableId: 'module_ready',
			description: 'Whether the module is properly configured and ready (true/false)',
		},
	]
}
