# Facebook, Youtube & api.video Integration

This module automates the process of setting up live restreams to Facebook and/or Youtube using api.video. It creates a new live stream with each execution.

## Configuration

### Required
- **api.video API Key**: Your api.video API key.

### Restream Destinations
- **Enable Facebook Restream**: Enable restreaming to Facebook Live.
- **Enable Youtube Restream**: Enable restreaming to Youtube Live.

### Facebook (required if enabled)
- **Facebook Page ID**: Your Facebook Page's numeric ID.
- **Facebook User Access Token**: A User Access Token with `publish_video` permission.
- **Facebook App ID/Secret** (optional): For automatic token extension.

### Youtube (required if enabled)
- **Youtube RTMP URL**: Your Youtube Live RTMP server URL.
- **Youtube Stream Key**: Your Youtube Live stream key.

## Actions

- **Prepare Live Stream**: Creates a new api.video live stream (named "Live - dd.mmmm.yy") and optionally adds Facebook/Youtube restream destinations based on enabled options. Provides RTMP URL and Stream Key via variables.
- **Reset Status**: Resets the module's status.

## Getting Stream Details

After creating a stream, get your details using:
- **RTMP URL**: `$(internal:variable:rtmp_url)`
- **Stream Key**: `$(internal:variable:stream_key)`

Use these in your streaming software (OBS, etc.) to start broadcasting.

## Feedbacks

- **Restream Preparation Status**: Changes button style based on the status of the prepare action (Idle, In Progress, Success, Failed).
- **Has Error**: Indicates if the last operation failed.
- **Ready for Operation**: Indicates if the module is configured and ready.
- **Operation in Progress**: Indicates if the prepare action is currently running.

For more detailed information, please see the [README.md](https://github.com/bitfocus/companion-module-facebook-apivideo/blob/main/README.md) file.
