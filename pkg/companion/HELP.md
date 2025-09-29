# Facebook & api.video Integration

This module automates the process of setting up a Facebook Live restream for a selected api.video live stream.

## Configuration

- **Facebook Page ID**: Your Facebook Page's numeric ID.
- **Facebook User Access Token**: A User Access Token with `publish_video` permission.
- **api.video API Key**: Your api.video API key.
- **api.video Live Stream**: Select the target live stream from the dropdown.

## Actions

- **Prepare Facebook Restream**: Creates a new Facebook Live video and adds it as a restream destination to the selected api.video live stream.
- **Refresh Live Streams**: Reloads the list of available live streams from api.video.
- **Reset Status**: Resets the module's status.

## Feedbacks

- **Restream Preparation Status**: Changes button style based on the status of the prepare action (Idle, In Progress, Success, Failed).
- **Has Error**: Indicates if the last operation failed.
- **Ready for Operation**: Indicates if the module is configured and ready.
- **Operation in Progress**: Indicates if the prepare action is currently running.
- **Live Stream Selected**: Indicates if a live stream is selected in the configuration.

For more detailed information, please see the [README.md](https://github.com/bitfocus/companion-module-facebook-apivideo/blob/main/README.md) file.
