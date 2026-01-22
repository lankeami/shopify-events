# Shopify Admin Events Viewer

A Chrome extension that allows you to view recent events for any Shopify admin page by fetching data from the `/events.json` endpoint.

## Publishing

Ready to publish to the Chrome Web Store? See the **[Publishing Guide](./PUBLISHING.md)** for complete instructions.

## Features

- Automatically detects when you're on a Shopify admin page (`admin.shopify.com`)
- Fetches events by appending `/events.json` to the current page URL
- Displays events in a clean, formatted popup interface
- Shows event type, timestamp, and full event details
- Refresh button to manually fetch latest events

## Installation

1. **Generate Icons First**:
   - Open `create-icons.html` in your browser
   - Click the three download links to generate `icon16.png`, `icon48.png`, and `icon128.png`
   - Save all three icon files in the extension directory

2. **Load the Extension in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" using the toggle in the top right
   - Click "Load unpacked"
   - Select the extension directory containing these files
   - The extension should now appear in your extensions list

## Usage

1. Navigate to any Shopify admin page (e.g., `https://admin.shopify.com/store/YOUR_STORE/...`)
2. Click the extension icon in your Chrome toolbar
3. The popup will automatically fetch events for the current page
4. Click "Fetch Events" to refresh the event list

## Files Structure

- `manifest.json` - Extension configuration
- `content.js` - Content script that runs on Shopify admin pages
- `background.js` - Background service worker
- `popup.html` - Popup interface HTML
- `popup.js` - Popup interface logic
- `create-icons.html` - Helper to generate extension icons
- `icon16.png`, `icon48.png`, `icon128.png` - Extension icons (generated)

## How It Works

1. The content script (`content.js`) runs on all `admin.shopify.com` pages
2. When you open the popup, it sends a message to the content script
3. The content script fetches `{current_url}/events.json` using the page's credentials
4. Events are returned to the popup and displayed in a formatted list

## Notes

- This extension requires access to Shopify admin pages
- The `/events.json` endpoint must be available on the page you're viewing
- Events are fetched with the same credentials as your current session

## Troubleshooting

- **Extension doesn't appear**: Make sure you've generated the icon files first
- **No events showing**: The current page may not have an `/events.json` endpoint available
- **Permission errors**: Ensure you're logged into Shopify and have access to the store

## Development

To modify the extension:
1. Make your changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes
