# Author Attribution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show who triggered each Shopify event by rendering the `author` field as a muted "by {name}" line below each event header.

**Architecture:** Extract `event.author` in `displayEvents()`, render it conditionally between the event header and details. Add `.event-author` CSS to both HTML files. No new files, no new dependencies.

**Tech Stack:** Vanilla JS, Chrome Extension Manifest V3, inline CSS

---

### Task 1: Create feature branch

- [ ] **Step 1: Create and switch to feature branch**

```bash
git checkout -b feat/author-attribution
```

- [ ] **Step 2: Verify branch**

```bash
git branch --show-current
```

Expected: `feat/author-attribution`

---

### Task 2: Add `.event-author` CSS to popup.html

**Files:**
- Modify: `popup.html:186-191` (after `.event-time` styles, before `.event-details` styles)

- [ ] **Step 1: Add CSS class after `.event-time` block**

Insert after the `.event-time` rule (line ~185):

```css
    .event-author {
      font-size: 11px;
      color: #94a3b8;
      margin-bottom: 8px;
    }
```

- [ ] **Step 2: Verify syntax**

```bash
node -e "require('fs').readFileSync('popup.html','utf8')" && echo "OK"
```

---

### Task 3: Add `.event-author` CSS to panel.html

**Files:**
- Modify: `panel.html:188-193` (after `.event-time` styles, before `.event-details` styles)

- [ ] **Step 1: Add identical CSS class after `.event-time` block**

Insert after the `.event-time` rule (line ~189):

```css
    .event-author {
      font-size: 11px;
      color: #94a3b8;
      margin-bottom: 8px;
    }
```

- [ ] **Step 2: Commit CSS changes**

```bash
git add popup.html panel.html
git commit -m "feat: add .event-author CSS to popup and panel"
```

---

### Task 4: Render author in popup.js displayEvents()

**Files:**
- Modify: `popup.js:129-148` (inside the `events.forEach` callback in `displayEvents()`)

- [ ] **Step 1: Extract author field**

After line 129 (`const description = ...`), add:

```js
    const author = event.author || '';
```

- [ ] **Step 2: Add author line to template literal**

In the `eventItem.innerHTML` template (line ~137), insert the author div between the closing `</div>` of `.event-header` and the opening `<div class="event-details">`:

```js
      ${author ? `<div class="event-author">by ${escapeHtml(author)}</div>` : ''}
```

- [ ] **Step 3: Verify syntax**

```bash
node --check popup.js && echo "OK"
```

---

### Task 5: Render author in panel.js displayEvents()

**Files:**
- Modify: `panel.js:72-92` (inside the `events.forEach` callback in `displayEvents()`)

- [ ] **Step 1: Extract author field**

After line 72 (`const description = ...`), add:

```js
    const author = event.author || '';
```

- [ ] **Step 2: Add author line to template literal**

In the `eventItem.innerHTML` template (line ~80), insert the author div between the closing `</div>` of `.event-header` and the opening `<div class="event-details">`:

```js
      ${author ? `<div class="event-author">by ${escapeHtml(author)}</div>` : ''}
```

- [ ] **Step 3: Verify syntax**

```bash
node --check panel.js && echo "OK"
```

- [ ] **Step 4: Commit JS changes**

```bash
git add popup.js panel.js
git commit -m "feat: render event author attribution in popup and panel"
```

---

### Task 6: Push and open draft PR

- [ ] **Step 1: Push branch**

```bash
git push -u origin feat/author-attribution
```

- [ ] **Step 2: Open draft PR linking to issue #3**

```bash
gh pr create --draft --title "feat: show author attribution on events" --body "$(cat <<'EOF'
## Summary
- Extracts `event.author` from the Shopify events API response
- Renders "by {author}" in muted text below each event header
- Gracefully omits the line when author is missing

Closes #3

## Test plan
- [ ] Load extension in Chrome, navigate to a Shopify admin resource page
- [ ] Verify events with an author show "by {name}" below the header
- [ ] Verify events without an author show no extra line
- [ ] Check both popup (click extension icon) and panel (DevTools panel) views
EOF
)"
```
