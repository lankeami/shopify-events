# Privacy Policy for Shopify Events Viewer

**Last Updated:** January 22, 2026

## Overview

Shopify Events Viewer is a Chrome extension that displays admin events from Shopify store pages. This privacy policy explains how the extension handles data.

## Data Access

The extension accesses the following:

- **Shopify Admin Events**: The extension fetches event data from the `/events.json` endpoint on Shopify admin pages you visit. This data includes information about orders, products, customers, and other store activity.

- **Browser Session**: The extension uses your existing Shopify session credentials (cookies) to authenticate requests. No separate login is required.

## Data Collection

**We do not collect, store, or transmit any data.** Specifically:

- No personal information is collected
- No analytics or tracking is implemented
- No data is sent to external servers
- No data is stored locally beyond your browser session
- No cookies are created by this extension

## Data Usage

All event data is:
- Fetched directly from Shopify's servers using your authenticated session
- Displayed only within your browser
- Never transmitted to any third party
- Never stored persistently

## Permissions

The extension requires these permissions:

- **Host Permission (`admin.shopify.com`)**: Required to access Shopify admin pages and fetch the events endpoint
- **Active Tab**: Required to interact with the current tab
- **Scripting**: Required to inject the content script that displays the events panel

## Security

- All communication with Shopify uses HTTPS
- The extension only operates on `admin.shopify.com` domains
- User-facing data is sanitized to prevent XSS attacks
- No external scripts or resources are loaded

## Third Parties

This extension does not share any data with third parties. It communicates only with Shopify's servers using your existing authenticated session.

## Changes to This Policy

If we make changes to this privacy policy, we will update the "Last Updated" date above.

## Contact

If you have questions about this privacy policy, please open an issue on the extension's GitHub repository or contact the developer.

---

*This extension is not affiliated with or endorsed by Shopify Inc.*
