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
  }
});

// Function to fetch events for the current page
async function fetchEventsForCurrentPage() {
  const currentUrl = window.location.href;
  const eventsUrl = currentUrl + '/events.json';

  try {
    const response = await fetch(eventsUrl, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}

// Update the stored URL when the page changes (for single-page apps)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    currentPageUrl = url;
  }
}).observe(document, { subtree: true, childList: true });
