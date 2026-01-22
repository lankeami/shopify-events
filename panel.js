// Panel script for displaying events in the iframe
const urlInfoDiv = document.getElementById('urlInfo');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const eventsDiv = document.getElementById('events');
const closeBtn = document.getElementById('closeBtn');

// Initialize panel
function init() {
  // Request events from parent window (content script)
  window.parent.postMessage({ action: 'fetchEvents' }, '*');
}

// Listen for messages from the parent window
window.addEventListener('message', (event) => {
  if (event.data.action === 'eventsData') {
    loadingDiv.style.display = 'none';

    if (event.data.success) {
      displayEvents(event.data.events);
    } else {
      if (event.data.error && event.data.error.includes('status: 404')) {
        showInfo('Events not supported for this page type');
      } else {
        showError('Error fetching events: ' + event.data.error);
      }
    }
  } else if (event.data.action === 'updateUrl') {
    // Update URL display if parent sends it
    const displayPath = event.data.path || '';
    urlInfoDiv.textContent = displayPath;
  }
});

// Display events in the panel
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

  // Sort events by timestamp (newest first)
  events.sort((a, b) => {
    const timeA = a.created_at || a.timestamp || a.occurred_at || 0;
    const timeB = b.created_at || b.timestamp || b.occurred_at || 0;
    return new Date(timeB) - new Date(timeA);
  });

  events.forEach((event) => {
    const eventItem = document.createElement('div');
    eventItem.className = 'event-item';

    // Extract fields for header
    const subjectType = event.subject_type || 'Unknown';
    const verb = event.verb || 'Unknown';
    const headerText = `${subjectType}: ${verb}`;
    const timestamp = event.created_at || event.timestamp || event.occurred_at;
    const description = event.description || event.message || '';

    let timeString = '';
    if (timestamp) {
      const date = new Date(timestamp);
      timeString = date.toLocaleString();
    }

    eventItem.innerHTML = `
      <div class="event-header">
        <div class="event-type">${escapeHtml(headerText)}</div>
        ${timeString ? `<div class="event-time">${escapeHtml(timeString)}</div>` : ''}
      </div>
      <div class="event-details">
        ${description ? `<div>${escapeHtml(description)}</div>` : ''}
        <details>
          <summary>View JSON payload</summary>
          <pre>${escapeHtml(JSON.stringify(event, null, 2))}</pre>
        </details>
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

// Show info message (less alarming than error)
function showInfo(message) {
  eventsDiv.innerHTML = `<div class="no-events">${escapeHtml(message)}</div>`;
  errorDiv.style.display = 'none';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Close button handler
closeBtn.addEventListener('click', () => {
  window.parent.postMessage({ action: 'closePanel' }, '*');
});

// Initialize on load
init();
