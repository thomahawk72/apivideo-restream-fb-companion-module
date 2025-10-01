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

To use this module, you need to configure the following settings:

### Required Settings

1.  **api.video API Key**: Your API key from your api.video account. You can find this in your api.video dashboard under the "API Keys" section.

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

## Actions

This module provides the following actions:

-   **Prepare Live Stream**: This is the main action. When triggered, it performs the following steps:
    1.  Creates Facebook and/or Youtube Live Videos (based on enabled destinations) with unique RTMP URLs.
    2.  Creates a new api.video live stream with an auto-generated name in the format "Live - dd.mmmm.yy" (e.g., "Live - 01.oktober.25").
    3.  Adds all enabled restream destinations to the newly created live stream.
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

