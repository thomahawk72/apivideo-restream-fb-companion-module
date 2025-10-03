# companion-module-facebook-apivideo

This module allows [Bitfocus Companion](https://bitfocus.io/companion) to automate the process of setting up live restreams to Facebook and/or Youtube using api.video. 

With a single button press, it creates a new api.video live stream with an auto-generated date-based name (format: "Live - dd.mmmm.yy"), generates Facebook and/or Youtube Live Videos, and adds them as restream destinations.

This allows you to go live on Facebook and Youtube automatically when you start your stream to api.video, without needing to manually configure destinations for every broadcast.

## Module Status

**Module Status:** Stable  
**Module Version:** 1.0.0  
**Author:** Manus AI

## Supported Devices

This module integrates with:
- **Facebook Live** - Requires Facebook Page with publish_video permission
- **Youtube Live** - Requires Youtube channel with live streaming enabled
- **api.video** - Requires api.video account with API key

## Configuration

### Minimum Required Configuration

**Only the api.video API Key is required to use this module:**

1.  **api.video API Key**: Your API key from your api.video account. You can find this in your api.video dashboard under the "API Keys" section.

With just this key, you can:
- Create new live streams
- Get RTMP URL and Stream Key for streaming
- Use the stream without any restream destinations

### Restream Destinations

2.  **Enable Facebook Restream**: Check this box to enable restreaming to Facebook Live.
3.  **Enable Youtube Restream**: Check this box to enable restreaming to Youtube Live.

### Facebook Configuration (required if Facebook restream is enabled)

4.  **Facebook Page ID**: The numeric ID of the Facebook Page you want to stream to. You can find this in your Page's "About" section or settings.
5.  **Facebook User Access Token**: A User Access Token with the `publish_video` permission for your Facebook Page. You can generate this using Facebook's [Graph API Explorer](https://developers.facebook.com/tools/explorer/). Ensure you select your Page and grant the necessary permission.
6.  **Facebook App ID** (optional): Your Facebook App ID for token extension.
7.  **Facebook App Secret** (optional): Your Facebook App Secret for token extension.

### Youtube Configuration (required if Youtube restream is enabled)

8.  **Youtube RTMP URL**: Your Youtube Live RTMP server URL (e.g., `rtmp://a.rtmp.youtube.com/live2`). You can find this in Youtube Studio under "Go Live" > "Stream settings".
9.  **Youtube Stream Key**: Your Youtube Live stream key from the same location.

## Usage Flow

### Basic Usage (Minimum Configuration)

1. **Configure Module**: Enter only your api.video API key
2. **Save Configuration**: Module is now ready to use
3. **Run Action**: Use "Prepare Live Stream" action
4. **Get Stream Details**: Use variables `$(internal:variable:rtmp_url)` and `$(internal:variable:stream_key)`
5. **Stream**: Use the RTMP URL and Stream Key in your streaming software (OBS, etc.)

### Advanced Usage (With Restreaming)

1. **Configure Module**: Enter api.video API key + enable desired restream destinations
2. **Configure Restream Destinations**: Add Facebook/Youtube credentials as needed
3. **Save Configuration**: Module is ready for restreaming
4. **Run Action**: Use "Prepare Live Stream" action
5. **Automatic Restreaming**: Stream will automatically go to enabled destinations
6. **Get Stream Details**: Use variables for RTMP URL and Stream Key

## Getting Your Stream Details

After running the "Prepare Live Stream" action, you can access your stream details in several ways:

### Method 1: Companion Variables (Recommended)
Use these variables in your Companion buttons or other modules:
- **RTMP URL**: `$(internal:variable:rtmp_url)`
- **Stream Key**: `$(internal:variable:stream_key)`

### Method 2: Companion Logs
Check the Companion logs for output like:
```
[INFO] RTMP URL: rtmp://broadcast.api.video/live/xxxxx
[INFO] Stream Key: xxxxx-xxxxx-xxxxx-xxxxx
```

### Method 3: api.video Dashboard
1. Open your [api.video dashboard](https://dashboard.api.video)
2. Navigate to "Live Streams"
3. Find your stream with name "Live - dd.mmmm.yy"
4. Copy the RTMP URL and Stream Key

## Using in Streaming Software

### OBS Studio Setup
1. Open OBS Studio
2. Go to **Settings** → **Stream**
3. Set **Service** to "Custom..."
4. **Server**: Use `$(internal:variable:rtmp_url)` or copy from logs
5. **Stream Key**: Use `$(internal:variable:stream_key)` or copy from logs
6. Click **OK** and start streaming

### Other Streaming Software
Use the same RTMP URL and Stream Key in any RTMP-compatible streaming software like:
- Streamlabs OBS
- Wirecast
- vMix
- FFmpeg
- XSplit

## Stream Naming Convention

Each stream is automatically named using the format:
**"Live - dd.mmmm.yy"**

Where:
- `dd` = Day with leading zero (01-31)
- `mmmm` = Full Norwegian month name (januar, februar, mars, etc.)
- `yy` = Two-digit year (24, 25, etc.)

Examples:
- `Live - 01.oktober.25` (October 1st, 2025)
- `Live - 15.desember.24` (December 15th, 2024)
- `Live - 03.mars.25` (March 3rd, 2025)

## Configuration Flexibility

### Minimal Setup (Stream Only)
- **Required**: api.video API key
- **Result**: Creates stream, provides RTMP details
- **Use Case**: Simple streaming without restream destinations

### Full Setup (Stream + Restreaming)
- **Required**: api.video API key + restream destination credentials
- **Result**: Creates stream + automatic restreaming to enabled platforms
- **Use Case**: Multi-platform broadcasting

### Mixed Setup
- Enable Facebook restream but not Youtube (or vice versa)
- Only enabled destinations will receive the stream
- You still get the main stream details for your primary streaming software

## Actions

This module provides the following actions:

-   **Prepare Live Stream**: This is the main action. When triggered, it performs the following steps:
    1.  Creates a new api.video live stream with an auto-generated name in the format "Live - dd.mmmm.yy" (e.g., "Live - 01.oktober.25").
    2.  Optionally creates Facebook and/or Youtube Live Videos (based on enabled destinations).
    3.  Adds enabled restream destinations to the newly created live stream (if any).
    4.  Provides RTMP URL and Stream Key via variables for use in streaming software.
    -   *Options*:
        -   **Live Stream Title**: Set a custom title for the Facebook Live video (used if Facebook restream is enabled).
        -   **Live Stream Description**: Set a custom description for the Facebook Live video (used if Facebook restream is enabled).

-   **Reset Status**: Resets the module's status feedback to 'Idle'.

## Feedbacks

Feedbacks allow you to get visual confirmation on your Stream Deck buttons.

-   **Restream Preparation Status**: Change the button's style based on the status of the `Prepare Live Stream` action.
    -   **Idle**: The action has not been run yet.
    -   **In Progress**: The API calls are currently being made.
    -   **Success (OK)**: The restream was successfully set up.
    -   **Failed**: An error occurred during the process.

-   **Has Error**: The button will change style if the last operation resulted in an error.

-   **Ready for Operation**: The button will change style if the module is fully configured and ready to perform the action.

-   **Operation in Progress**: The button will change style while the `Prepare Live Stream` action is running.

## Variables

This module exposes the following variables for use in other parts of Companion:

-   `$(internal:variable:status)`: The current status of the restream preparation (`idle`, `in_progress`, `ok`, `fail`).
-   `$(internal:variable:last_error)`: The error message from the last failed operation.
-   `$(internal:variable:facebook_video_id)`: The ID of the last created Facebook Live Video.
-   `$(internal:variable:youtube_video_id)`: The ID of the last created Youtube Live Video (if applicable).
-   `$(internal:variable:livestream_id)`: The ID of the last created api.video live stream.
-   `$(internal:variable:rtmp_url)`: The RTMP URL for streaming to the last created live stream.
-   `$(internal:variable:stream_key)`: The stream key for streaming to the last created live stream.
-   `$(internal:variable:module_ready)`: Whether the module is properly configured and ready (`true`/`false`).

## Development

### Building the Module

To build this module for distribution:

```bash
npm install
npm run build
```

This will create a packaged module in the `pkg/` directory that can be imported into Companion.

### Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Links

- [Bitfocus Companion](https://bitfocus.io/companion)
- [api.video](https://api.video)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api)
- [Youtube Live Streaming API](https://developers.google.com/youtube/v3/live)

## Changelog

### Version 1.0.0
- Initial release
- Support for Facebook Live restreaming
- Support for Youtube Live restreaming  
- Automatic stream naming with Norwegian date format
- Token validation and extension for Facebook
- Configurable restream destinations

