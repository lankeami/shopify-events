// Popup script for displaying events
const urlInfoDiv = document.getElementById('urlInfo');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const eventsDiv = document.getElementById('events');
const refreshBtn = document.getElementById('refreshBtn');

let currentUrl = '';

// Initialize popup
async function init() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url || !tab.url.includes('admin.shopify.com')) {
      showError('This extension only works on admin.shopify.com pages');
      refreshBtn.disabled = true;
      return;
    }

    currentUrl = tab.url;
    urlInfoDiv.innerHTML = `<strong>Current Page:</strong><br>${currentUrl}`;

    // Auto-fetch events on popup open
    fetchEvents();
  } catch (error) {
    showError('Error initializing: ' + error.message);
  }
}

// Fetch events from the current page
async function fetchEvents() {
  try {
    refreshBtn.disabled = true;
    loadingDiv.style.display = 'block';
    errorDiv.style.display = 'none';
    eventsDiv.innerHTML = '';

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Send message to content script to fetch events
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'fetchEvents' });

    loadingDiv.style.display = 'none';
    refreshBtn.disabled = false;

    if (response.success) {
      displayEvents(response.events);
    } else {
      showError('Error fetching events: ' + response.error);
    }
  } catch (error) {
    loadingDiv.style.display = 'none';
    refreshBtn.disabled = false;
    showError('Error: ' + error.message);
  }
}

// Display events in the popup
function displayEvents(data) {
  eventsDiv.innerHTML = '';

  // Handle different possible response structures
  let events = [];

  if (Array.isArray(data)) {
    events = data;
  } else if (data.events && Array.isArray(data.events)) {
    events = data.events;
  } else if (typeof data === 'object') {
    // If it's an object, display it as a single event
    events = [data];
  }

  if (events.length === 0) {
    eventsDiv.innerHTML = '<div class="no-events">No events found for this page</div>';
    return;
  }

  events.forEach((event, index) => {
    const eventItem = document.createElement('div');
    eventItem.className = 'event-item';

    // Extract common fields
    const eventType = event.type || event.event_type || event.verb || 'Unknown Event';
    const timestamp = event.created_at || event.timestamp || event.occurred_at;
    const description = event.description || event.message || '';

    let timeString = '';
    if (timestamp) {
      const date = new Date(timestamp);
      timeString = date.toLocaleString();
    }

    eventItem.innerHTML = `
      <div class="event-header">
        <div class="event-type">${escapeHtml(eventType)}</div>
        ${timeString ? `<div class="event-time">${escapeHtml(timeString)}</div>` : ''}
      </div>
      <div class="event-details">
        ${description ? `<div>${escapeHtml(description)}</div>` : ''}
        <pre>${escapeHtml(JSON.stringify(event, null, 2))}</pre>
      </div>
    `;

    eventsDiv.appendChild(eventItem);
  });
}

// Show error message
function showError(message) {
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  eventsDiv.innerHTML = '';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Event listeners
refreshBtn.addEventListener('click', fetchEvents);

// Initialize on load
init();
