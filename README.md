# CleanBlock

A lightweight Manifest V3 ad blocker that just blocks ads. 

No corporate deals, no "acceptable ads" whitelists, no telemetry pings, and no 75 megabytes of random junk running in your background. It turns on, blocks ads, and stays out of your way.

## Features

- Native declarativeNetRequest: Runs on the browser's built-in filtering engine with almost zero memory overhead.
- EasyList + EasyPrivacy: Blocks over 99,000 ad and tracking network requests.
- YouTube Support: Strips ad placement metadata before the video player starts, so videos play without ad interruptions or ad-block detection popups.
- Minimal UI: Just a single smooth switch to toggle blocking on or off.
- Zero Data Collection: No analytics, no pings, no user IDs, no logging.

## How to Install

Works on Chrome, Brave, Edge, and any Chromium browser:

1. Open `chrome://extensions` in your browser.
2. Enable "Developer mode" in the top-right corner.
3. Click "Load unpacked" in the top-left.
4. Select the `clean-adblock` folder.

## How It Works

1. Network Blocking: Uses Chrome's `declarativeNetRequest` API with compiled EasyList and EasyPrivacy rulesets. The browser drops matching ad requests at the engine level without executing background code.
2. Cosmetic Hiding: Injects clean CSS rules to collapse empty ad placeholders and sponsored banners.
3. YouTube Defuser: Runs at document start in the main page context to sanitize player responses and remove ad slots before playback begins.

## License

MIT
