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
