# Chrome Web Store Publishing Guide

This document contains all the steps needed to publish the Shopify Events Viewer extension to the Chrome Web Store.

## Pre-requisites

- [ ] Google account
- [ ] $5 for one-time developer registration fee
- [ ] Generated icon files (`icon16.png`, `icon48.png`, `icon128.png`)

## Files Ready for Upload

| File | Purpose |
|------|---------|
| [`shopify-events-extension.zip`](./shopify-events-extension.zip) | ZIP package for Chrome Web Store upload |
| [`PRIVACY_POLICY.md`](./PRIVACY_POLICY.md) | Privacy policy (host this publicly) |

---

## Part 1: Developer Account Setup

### Step 1: Access the Developer Dashboard
1. Go to https://chrome.google.com/webstore/devconsole
2. Sign in with your Google account
3. If first time: Pay the **one-time $5 registration fee**
4. Accept the Developer Agreement

### Step 2: Complete Account Setup
1. Click your account icon → **Account** in the dashboard
2. Fill in required publisher information:
   - Publisher display name (e.g., "Jay Chinthrajah" or your company name)
   - Contact email (publicly visible)
   - Privacy policy URL (see Part 2)
3. Verify your email address if prompted

---

## Part 2: Host Privacy Policy

Before submitting, you need to host the privacy policy at a public URL.

### Option A: GitHub Pages
1. Push this repo to GitHub
2. Go to repo Settings → Pages
3. Enable GitHub Pages from main branch
4. Your privacy policy will be at: `https://YOUR_USERNAME.github.io/shopify-events/PRIVACY_POLICY`

### Option B: GitHub Raw Link
Use the raw file URL: `https://raw.githubusercontent.com/YOUR_USERNAME/shopify-events/main/PRIVACY_POLICY.md`

### Option C: Other Hosting
Convert [`PRIVACY_POLICY.md`](./PRIVACY_POLICY.md) to HTML and host on your website or Notion.

---

## Part 3: Submit to Chrome Web Store

### Step 3: Add New Item
1. In Developer Dashboard, click **"New Item"** button
2. Upload [`shopify-events-extension.zip`](./shopify-events-extension.zip)
3. Wait for initial processing

### Step 4: Fill Store Listing

**Language:** English (United States)

**Extension Name:**
```
Shopify Events Viewer - Admin Activity Monitor
```

**Summary (132 characters max):**
```
View real-time admin events on any Shopify page. See orders, products, and customer activity with detailed timestamps and payloads.
```

**Category:** Developer Tools

**Description:** (copy the full text below)

```
SHOPIFY EVENTS VIEWER - Your Admin Activity Dashboard

Instantly see what's happening in your Shopify store. This extension displays real-time admin events directly in your browser, helping you debug issues, audit changes, and understand store activity at a glance.

KEY FEATURES

Real-Time Event Monitoring
See orders, products, customers, and inventory events as they happen. No more digging through logs or refreshing pages.

Smart Auto-Detection
The extension automatically detects when events are available and shows a convenient sidebar panel right in your Shopify admin.

Detailed Event Information
- Event type and action (Created, Updated, Deleted)
- Precise timestamps
- Human-readable descriptions
- Full JSON payload for technical debugging

Secure & Private
Uses your existing Shopify session - no separate login required. No data is collected or transmitted to third parties.

Lightweight & Fast
Zero impact on page performance. Events load instantly without interrupting your workflow.

PERFECT FOR

- Store Owners tracking order and inventory changes
- Developers debugging webhook issues
- Support Teams investigating customer issues
- Agencies managing multiple stores

HOW TO USE

1. Navigate to any Shopify admin page
2. Click the extension icon or use the auto-appearing sidebar
3. View events sorted by most recent
4. Expand any event to see the full JSON payload

REQUIREMENTS

- Active Shopify store with admin access
- Must be logged into Shopify admin

Questions or feedback? We'd love to hear from you!

Made for the Shopify community
```

---

## Part 4: Configure Settings

### Step 5: Privacy Practices
1. Go to **Privacy** tab
2. Answer the questionnaire:
   - **Single purpose:** "Display Shopify admin events from the current page"
   - **Host permissions justification:** "Required to access Shopify admin pages and fetch events.json endpoint"
   - **Data usage disclosure:** Select "No" for all data collection options

### Step 6: Distribution Settings
1. Go to **Distribution** tab
2. **Visibility:** Public (or Unlisted for testing first)
3. **Regions:** All regions

---

## Part 5: Upload Assets

### Required Images

| Asset | Size | File |
|-------|------|------|
| Store Icon | 128x128 PNG | `icon128.png` |
| Screenshots | 1280x800 or 640x400 | See below |

### Screenshot Guide

Take these 5 screenshots (1280x800 recommended):

1. **Popup with Events List**
   - Navigate to a Shopify orders page with recent activity
   - Click the extension icon to open the popup
   - Capture the popup showing multiple events with timestamps
   - **Caption:** "View all admin events at a glance"

2. **Expanded Event with JSON Payload**
   - Open the popup or panel
   - Expand one event to show the JSON details
   - **Caption:** "Drill into full event details and payloads"

3. **Sidebar Panel in Shopify Admin**
   - Navigate to an orders or products page
   - Show the auto-appearing panel on the right side
   - Capture full browser window showing Shopify + panel
   - **Caption:** "Sidebar panel integrates seamlessly with Shopify"

4. **Badge Indicator Active**
   - Navigate to a page with events
   - Show the extension icon in toolbar with badge visible
   - **Caption:** "Badge shows when events are available"

5. **Order Event Details**
   - Find a page with Order-related events
   - Show specific order events
   - **Caption:** "Track order activity in real-time"

### Screenshot Tips
- Use a clean browser profile (no other extensions visible)
- Use sample/test store data (blur any real customer info)
- Consistent browser window size (1280x800)
- Light theme for better visibility
- Include the purple/blue gradient header in shots

---

## Part 6: Submit for Review

### Step 7: Final Submission
1. Review all sections have green checkmarks
2. Click **"Submit for Review"**
3. Review typically takes 1-3 business days

### Step 8: Post-Submission
- Monitor email for approval or rejection feedback
- If rejected, address issues and resubmit
- Once approved, extension goes live automatically

### Step 9: Post-Launch
1. Copy and share the Chrome Web Store link
2. Add the link to this README and any documentation
3. Monitor reviews and respond to user feedback

---

## Checklist Summary

### Account Setup
- [ ] Pay $5 developer registration fee
- [ ] Complete publisher profile
- [ ] Verify email address

### Assets
- [ ] Verify icon files exist (16, 48, 128px)
- [ ] Host privacy policy at public URL
- [ ] Take 5 screenshots (1280x800)

### Submission
- [ ] Upload `shopify-events-extension.zip`
- [ ] Fill store listing (name, summary, description)
- [ ] Set category to "Developer Tools"
- [ ] Complete privacy questionnaire
- [ ] Upload 128px icon
- [ ] Upload screenshots with captions
- [ ] Set distribution to Public

### Publishing
- [ ] Submit for review
- [ ] Wait for approval (1-3 days)
- [ ] Share published Chrome Web Store link

---

## Updating the Extension

To publish updates after the initial release:

1. Update `version` in `manifest.json` (e.g., "1.0.0" → "1.0.1")
2. Create new ZIP:
   ```bash
   zip -r shopify-events-extension.zip manifest.json popup.html popup.js panel.html panel.js content.js background.js icon16.png icon48.png icon128.png
   ```
3. Go to Developer Dashboard → Your extension
4. Click "Package" → "Upload new package"
5. Upload new ZIP
6. Submit for review

---

## Useful Links

- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Store Listing Requirements](https://developer.chrome.com/docs/webstore/program-policies/)
