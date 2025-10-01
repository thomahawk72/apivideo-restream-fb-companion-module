// Example configuration for testing
// Copy this file to test-config.js and fill in your actual values

module.exports = {
    // api.video Configuration
    apivideo_api_key: 'your_apivideo_api_key_here',
    
    // Facebook Configuration (if testing Facebook restream)
    fb_user_token: 'your_facebook_user_token_here',
    fb_page_id: 'your_facebook_page_id_here',
    fb_app_id: 'your_facebook_app_id_here',        // Optional, for token extension
    fb_app_secret: 'your_facebook_app_secret_here', // Optional, for token extension
    
    // Youtube Configuration (if testing Youtube restream)
    yt_rtmp_url: 'rtmp://a.rtmp.youtube.com/live2',
    yt_stream_key: 'your_youtube_stream_key_here',
    
    // Enabled destinations
    enable_facebook_restream: true,
    enable_youtube_restream: false
}
