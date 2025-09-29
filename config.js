const { Regex } = require('@companion-module/base')

module.exports = function (self) {
	return [
		{
			type: 'static-text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'This module integrates Facebook Live with api.video for automated restreaming setup.',
		},
		{
			type: 'textinput',
			id: 'fb_page_id',
			label: 'Facebook Page ID',
			width: 6,
			regex: Regex.NUMBER,
			required: true,
			tooltip: 'The numeric ID of your Facebook Page (found in Page settings)',
		},
		{
			type: 'textinput',
			id: 'fb_user_token',
			label: 'Facebook User Access Token',
			width: 12,
			required: true,
			tooltip: 'User Access Token with publish_video permission for your Facebook Page',
		},
		{
			type: 'textinput',
			id: 'apivideo_api_key',
			label: 'api.video API Key',
			width: 12,
			required: true,
			tooltip: 'Your api.video API key (found in your api.video dashboard)',
		},
		{
			type: 'dropdown',
			id: 'apivideo_livestream_id',
			label: 'api.video Live Stream',
			width: 12,
			choices: self.liveStreams || [{ id: '', label: 'No live streams available - check API key' }],
			default: '',
			tooltip: 'Select the api.video live stream to add Facebook restream to',
		},
		{
			type: 'static-text',
			id: 'help',
			width: 12,
			label: 'Setup Instructions',
			value: `
1. Get your Facebook Page ID from your Page settings
2. Generate a User Access Token with 'publish_video' permission using Facebook's Graph API Explorer
3. Get your api.video API key from your api.video dashboard
4. Save configuration to load available live streams
5. Select the live stream you want to add Facebook restreaming to
			`.trim(),
		},
	]
}
