# Bitfocus Companion: Facebook & api.video Integration

This module for Bitfocus Companion automates the process of setting up a Facebook Live restream for a selected api.video live stream. With a single button press, it creates a new Facebook Live Video, retrieves the unique streaming URL, and adds it as a restream destination to your chosen api.video live stream.

This allows you to go live on Facebook automatically when you start your stream to api.video, without needing to manually configure the destination in Facebook's Live Producer for every broadcast.

## Configuration

To use this module, you need to configure the following settings:

1.  **Facebook Page ID**: The numeric ID of the Facebook Page you want to stream to. You can find this in your Page's "About" section or settings.
2.  **Facebook User Access Token**: A User Access Token with the `publish_video` permission for your Facebook Page. You can generate this using Facebook's [Graph API Explorer](https://developers.facebook.com/tools/explorer/). Ensure you select your Page and grant the necessary permission.
3.  **api.video API Key**: Your API key from your api.video account. You can find this in your api.video dashboard under the "API Keys" section.
4.  **api.video Live Stream**: After entering a valid api.video API key and saving the configuration, this dropdown will populate with all the live streams in your account. Select the one you want to use for Facebook restreaming.

## Actions

This module provides the following actions:

-   **Prepare Facebook Restream**: This is the main action. When triggered, it performs the following steps:
    1.  Calls the Facebook Live API to create a new live video, generating a unique RTMP URL.
    2.  Calls the api.video API to update your selected live stream, adding the new Facebook RTMP URL as a restream destination.
    -   *Options*:
        -   **Facebook Live Title**: Set a custom title for the Facebook Live video.
        -   **Facebook Live Description**: Set a custom description for the Facebook Live video.

-   **Refresh Live Streams**: Manually triggers a refresh of the list of available live streams from your api.video account.

-   **Reset Status**: Resets the module's status feedback to 'Idle'.

## Feedbacks

Feedbacks allow you to get visual confirmation on your Stream Deck buttons.

-   **Restream Preparation Status**: Change the button's style based on the status of the `Prepare Facebook Restream` action.
    -   **Idle**: The action has not been run yet.
    -   **In Progress**: The API calls are currently being made.
    -   **Success (OK)**: The restream was successfully set up.
    -   **Failed**: An error occurred during the process.

-   **Has Error**: The button will change style if the last operation resulted in an error.

-   **Ready for Operation**: The button will change style if the module is fully configured and ready to perform the action.

-   **Operation in Progress**: The button will change style while the `Prepare Facebook Restream` action is running.

-   **Live Stream Selected**: The button will change style if a valid api.video live stream is selected in the configuration.

## Variables

This module exposes the following variables for use in other parts of Companion:

-   `$(internal:variable:status)`: The current status of the restream preparation (`idle`, `in_progress`, `ok`, `fail`).
-   `$(internal:variable:last_error)`: The error message from the last failed operation.
-   `$(internal:variable:facebook_video_id)`: The ID of the last created Facebook Live Video.
-   `$(internal:variable:selected_livestream)`: The name of the currently selected api.video live stream.
-   `$(internal:variable:livestreams_count)`: The number of available api.video live streams.
-   `$(internal:variable:module_ready)`: Whether the module is properly configured and ready (`true`/`false`).

