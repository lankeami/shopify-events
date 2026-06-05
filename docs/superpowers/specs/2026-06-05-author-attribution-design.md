# Author Attribution for Events (Issue #3)

## Problem

The Shopify events API returns an `author` field (a human-readable string like a staff name or "Shopify" for system events). The current `displayEvents()` code in both `popup.js` and `panel.js` ignores this field entirely. Users must expand the raw JSON payload to see who performed an action.

## Solution

Add a muted "by {author}" line between the event header and the event details in each event card. When `event.author` is missing or empty, the line is omitted entirely.

## Changes

### CSS (both `popup.html` and `panel.html`)

Add an `.event-author` class:

```css
.event-author {
  font-size: 11px;
  color: #94a3b8;
  margin-bottom: 8px;
}
```

### JS (both `popup.js` and `panel.js`)

In `displayEvents()`, extract the author and render it conditionally:

```js
const author = event.author || '';
```

In the template literal, between `.event-header` and `.event-details`:

```html
${author ? `<div class="event-author">by ${escapeHtml(author)}</div>` : ''}
```

### Files touched

- `popup.html` — add `.event-author` CSS
- `panel.html` — add `.event-author` CSS
- `popup.js` — extract and render author in `displayEvents()`
- `panel.js` — extract and render author in `displayEvents()`

## Edge cases

- Missing `author` field: line is omitted (no empty "by" text)
- `author` is `"Shopify"` or other system names: rendered as-is ("by Shopify")
- XSS: `escapeHtml()` applied to author string, same as all other rendered fields
