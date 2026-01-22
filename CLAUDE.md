# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chrome extension (Manifest V3) for viewing Shopify admin events. It detects when you're on a Shopify admin page and fetches events from the `/events.json` endpoint using the browser's session credentials.

## Development Workflow

**No build system** - This is a vanilla JS Chrome extension with no npm, bundler, or build tools.

**Loading the extension:**
1. Generate icons by opening `create-icons.html` in browser and downloading the 3 icon files
2. Go to `chrome://extensions/`
3. Enable Developer mode
4. Click "Load unpacked" and select this directory

**After code changes:**
- Click the refresh icon on the extension card at `chrome://extensions/`
- Test changes manually (no automated tests)

## Architecture

```
popup.js ←→ content.js ←→ background.js
   ↓            ↓
popup.html   Shopify API
```

Three-component Chrome extension architecture:

1. **Content Script (content.js)** - Injected into `admin.shopify.com` pages
   - Fetches `{current_url}/events.json` with session credentials
   - Listens for messages from popup
   - Uses MutationObserver to detect SPA navigation

2. **Background Service Worker (background.js)** - Handles cross-script messaging and badge updates

3. **Popup UI (popup.html + popup.js)** - User interface
   - Auto-fetches events on open
   - Can inject content script if not already loaded
   - Handles multiple event response formats (array, `{events: [...]}`, single object)

## Key Patterns

**Message passing**: Popup sends messages to content script, which responds async. Return `true` in message listeners to keep the channel open for async responses.

**Credential handling**: Uses `credentials: 'include'` in fetch to leverage existing Shopify session.

**XSS prevention**: All user-facing data is HTML-escaped via `escapeHtml()` function.

**Flexible event parsing**: Handles `created_at`, `timestamp`, or `occurred_at` fields for timestamps.

## Host Permissions

Extension only has access to `https://admin.shopify.com/*` - content scripts won't run on other domains.

## Known Limitations

- Admin REST API fallback is implemented but commented out in content.js (needs work)
- No automated testing infrastructure
- Manual icon generation required before first use
