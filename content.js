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
      // If 404, try alternative method using admin_graphql_api_id
      // if (response.status === 404) {
      //   return await fetchEventsViaAdminAPI();
      // }
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

// Alternative method: Fetch events using admin REST API
async function fetchEventsViaAdminAPI() {
  const currentUrl = window.location.href;
  const url = new URL(currentUrl);

  // Append .json to get the resource data
  const resourceUrl = url.pathname.replace(/\/$/, '') + '.json';
  const fullResourceUrl = `${url.origin}${resourceUrl}`;

  try {
    // Fetch the resource to get admin_graphql_api_id
    const resourceResponse = await fetch(fullResourceUrl, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!resourceResponse.ok) {
      throw new Error(`Failed to fetch resource: ${resourceResponse.status}`);
    }

    const resourceData = await resourceResponse.json();

    // Extract admin_graphql_api_id from the first object key's data
    let adminGraphqlApiId = null;
    for (const key in resourceData) {
      if (resourceData[key] && resourceData[key].admin_graphql_api_id) {
        adminGraphqlApiId = resourceData[key].admin_graphql_api_id;
        break;
      }
    }

    if (!adminGraphqlApiId) {
      throw new Error('admin_graphql_api_id not found in resource data');
    }

    // Parse GID: "gid://shopify/<subject-type>/<subject-id>"
    const gidMatch = adminGraphqlApiId.match(/gid:\/\/shopify\/([^\/]+)\/(\d+)/);
    if (!gidMatch) {
      throw new Error('Invalid admin_graphql_api_id format');
    }

    const subjectType = gidMatch[1];
    const subjectId = gidMatch[2];

    // Extract store name from URL path (e.g., /store/my-store/...)
    const storeMatch = url.pathname.match(/\/store\/([^\/]+)/);
    if (!storeMatch) {
      throw new Error('Could not extract store name from URL');
    }
    const storeName = storeMatch[1];

    // Construct admin REST API events URL
    const eventsApiUrl = `${url.origin}/store/${storeName}/api/2025-01/events.json?subject_id=${subjectId}&subject_type=${subjectType}`;

    const eventsResponse = await fetch(eventsApiUrl, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!eventsResponse.ok) {
      throw new Error(`Failed to fetch events from admin API: ${eventsResponse.status}`);
    }

    const eventsData = await eventsResponse.json();
    return eventsData;
  } catch (error) {
    console.error('Error fetching events via admin API:', error);
    throw error;
  }
}

// Check if events are available for the current page (lightweight check)
async function checkEventsAvailability(signal) {
  const currentUrl = window.location.href;
  const url = new URL(currentUrl);
  url.pathname = url.pathname.replace(/\/$/, '') + '/events.json';
  const eventsUrl = url.toString();

  try {
    const response = await fetch(eventsUrl, {
      method: 'HEAD', // Use HEAD to avoid downloading the full response
      credentials: 'include',
      signal,
    });
    return response.ok;
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    return false;
  }
}

// Panel width constant
const PANEL_WIDTH = 380;

// Inject the events panel iframe into the main section, retrying if <main> isn't mounted yet
function injectPanel(attempt = 0) {
  if (document.getElementById('shopify-events-panel')) return;

  const main = document.querySelector('main');
  if (!main) {
    const delays = [200, 500, 1000];
    if (attempt < delays.length) {
      setTimeout(() => injectPanel(attempt + 1), delays[attempt]);
    }
    return;
  }

  // Create a container that will hold the panel alongside the main content
  const container = document.createElement('div');
  container.id = 'shopify-events-panel-container';
  container.style.cssText = `
    position: fixed;
    top: 56px;
    right: 0;
    width: ${PANEL_WIDTH}px;
    height: calc(100vh - 56px);
    z-index: 99;
    display: flex;
    flex-direction: column;
    background: white;
    border-left: 1px solid #e2e8f0;
    box-shadow: -2px 0 12px rgba(0, 0, 0, 0.08);
  `;

  const iframe = document.createElement('iframe');
  iframe.id = 'shopify-events-panel';
  iframe.src = chrome.runtime.getURL('panel.html');
  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
    background: white;
  `;

  container.appendChild(iframe);
  document.body.appendChild(container);

  // Inject a stylesheet to shrink #AppFrameBevel (Shopify's fixed-position
  // content frame) — its width: 100% !important in Polaris CSS requires our
  // own !important to override.
  let style = document.getElementById('shopify-events-panel-style');
  if (!style) {
    style = document.createElement('style');
    style.id = 'shopify-events-panel-style';
    document.head.appendChild(style);
  }
  style.textContent = `
    #AppFrameBevel {
      width: calc(100% - ${PANEL_WIDTH}px) !important;
      transition: width 0.2s ease;
    }
  `;
}

// Remove the events panel iframe
function removePanel() {
  document.getElementById('shopify-events-panel-container')?.remove();
  document.getElementById('shopify-events-panel-style')?.remove();
}

// Handle postMessage from the panel iframe
window.addEventListener('message', async (event) => {
  const panel = document.getElementById('shopify-events-panel');
  if (!panel || event.source !== panel.contentWindow) return;

  if (event.data.action === 'fetchEvents') {
    try {
      const events = await fetchEventsForCurrentPage();
      event.source.postMessage({ action: 'eventsData', success: true, events }, '*');
    } catch (error) {
      event.source.postMessage({ action: 'eventsData', success: false, error: error.message }, '*');
    }
  } else if (event.data.action === 'closePanel') {
    panelManuallyClosed = true;
    removePanel();
  }
});

// Track if panel was manually closed to avoid re-showing on same page
let panelManuallyClosed = false;

// AbortController for the current in-flight updateBadge check
let badgeCheckController = null;

// Update badge when events availability changes
async function updateBadge() {
  // Cancel any in-flight check so they don't race
  if (badgeCheckController) {
    badgeCheckController.abort();
  }
  badgeCheckController = new AbortController();
  const { signal } = badgeCheckController;

  let available;
  try {
    available = await checkEventsAvailability(signal);
  } catch (err) {
    if (err.name === 'AbortError') return;
    available = false;
  }

  if (signal.aborted) return;

  // Update badge
  chrome.runtime.sendMessage({
    action: 'updateBadge',
    available
  }).catch(() => {
    // Ignore errors if background script isn't ready
  });

  // Auto-show/hide panel (respect manual close)
  if (available && !panelManuallyClosed) {
    injectPanel();
  } else if (!available) {
    removePanel();
  }
}

// Check events availability on page load
updateBadge();

// Debounce helper
function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// Update the stored URL when the page changes (for single-page apps)
let lastUrl = location.href;
const debouncedUpdateBadge = debounce(updateBadge, 300);
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    currentPageUrl = url;
    // Reset manual close flag on navigation
    panelManuallyClosed = false;
    // Debounce so rapid SPA mutations consolidate into one check
    debouncedUpdateBadge();
  }
}).observe(document, { subtree: true, childList: true });
