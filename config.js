const { Regex } = require('@companion-module/base')

module.exports = function (self) {
	return [
		{
			type: 'static-text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'This module creates a new api.video live stream and adds restream destinations for Facebook and/or Youtube.',
		},
		{
			type: 'static-text',
			id: 'section_apivideo',
			width: 12,
			label: 'api.video Configuration',
			value: '',
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
			type: 'static-text',
			id: 'section_restream',
			width: 12,
			label: 'Restream Destinations',
			value: 'Select which platforms to restream to:',
		},
		{
			type: 'checkbox',
			id: 'enable_facebook_restream',
			label: 'Enable Facebook Restream',
			width: 6,
			default: false,
			tooltip: 'Enable restreaming to Facebook Live',
		},
		{
			type: 'checkbox',
			id: 'enable_youtube_restream',
			label: 'Enable Youtube Restream',
			width: 6,
			default: false,
			tooltip: 'Enable restreaming to Youtube Live',
		},
		{
			type: 'static-text',
			id: 'section_facebook',
			width: 12,
			label: 'Facebook Configuration',
			value: '',
		},
		{
			type: 'textinput',
			id: 'fb_page_id',
			label: 'Facebook Page ID',
			width: 6,
			regex: Regex.NUMBER,
			required: false,
			tooltip: 'The numeric ID of your Facebook Page (required if Facebook restream is enabled)',
		},
		{
			type: 'textinput',
			id: 'fb_user_token',
			label: 'Facebook User Access Token',
			width: 12,
			required: false,
			tooltip: 'User Access Token with publish_video permission (required if Facebook restream is enabled)',
		},
		{
			type: 'textinput',
			id: 'fb_app_id',
			label: 'Facebook App ID',
			width: 6,
			required: false,
			tooltip: 'Your Facebook App ID (optional, for token extension)',
		},
		{
			type: 'textinput',
			id: 'fb_app_secret',
			label: 'Facebook App Secret',
			width: 6,
			required: false,
			tooltip: 'Your Facebook App Secret (optional, for token extension)',
		},
		{
			type: 'static-text',
			id: 'section_youtube',
			width: 12,
			label: 'Youtube Configuration',
			value: '',
		},
		{
			type: 'textinput',
			id: 'yt_rtmp_url',
			label: 'Youtube RTMP URL',
			width: 12,
			required: false,
			tooltip: 'Youtube Live RTMP server URL (e.g., rtmp://a.rtmp.youtube.com/live2) - required if Youtube restream is enabled',
		},
		{
			type: 'textinput',
			id: 'yt_stream_key',
			label: 'Youtube Stream Key',
			width: 12,
			required: false,
			tooltip: 'Your Youtube Live stream key - required if Youtube restream is enabled',
		},
		{
			type: 'static-text',
			id: 'help',
			width: 12,
			label: 'Setup Instructions',
			value: `
1. Get your api.video API key from your api.video dashboard
2. Enable the restream destinations you want to use (Facebook and/or Youtube)
3. For Facebook: Get your Page ID and generate a User Access Token with 'publish_video' permission
4. For Youtube: Get your RTMP URL and Stream Key from Youtube Studio > Go Live > Stream settings
5. Save configuration and use the "Prepare Live Stream" action to create a new stream
			`.trim(),
		},
	]
}
