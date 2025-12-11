// Content script that runs on Shopify admin pages
console.log('Shopify Admin Events Viewer: Content script loaded');

// Store the current page URL
let currentPageUrl = window.location.href;

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageUrl') {
    sendResponse({ url: currentPageUrl });
  } else if (request.action === 'fetchEvents') {
    fetchEventsForCurrentPage()
      .then(events => sendResponse({ success: true, events }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep the message channel open for async response
  } else if (request.action === 'checkEventsAvailability') {
    checkEventsAvailability()
      .then(available => sendResponse({ available }))
      .catch(() => sendResponse({ available: false }));
    return true; // Keep the message channel open for async response
  }
});

// Function to fetch events for the current page
async function fetchEventsForCurrentPage() {
  const currentUrl = window.location.href;
  const url = new URL(currentUrl);
  url.pathname = url.pathname.replace(/\/$/, '') + '/events.json';
  const eventsUrl = url.toString();

  try {
    const response = await fetch(eventsUrl, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.statusCode = response.status;
      throw error;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}

// Check if events are available for the current page (lightweight check)
async function checkEventsAvailability() {
  const currentUrl = window.location.href;
  const url = new URL(currentUrl);
  url.pathname = url.pathname.replace(/\/$/, '') + '/events.json';
  const eventsUrl = url.toString();

  try {
    const response = await fetch(eventsUrl, {
      method: 'HEAD', // Use HEAD to avoid downloading the full response
      credentials: 'include',
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Update badge when events availability changes
async function updateBadge() {
  const available = await checkEventsAvailability();
  chrome.runtime.sendMessage({
    action: 'updateBadge',
    available
  }).catch(() => {
    // Ignore errors if background script isn't ready
  });
}

// Check events availability on page load
updateBadge();

// Update the stored URL when the page changes (for single-page apps)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    currentPageUrl = url;
    // Check events availability when URL changes
    updateBadge();
  }
}).observe(document, { subtree: true, childList: true });
