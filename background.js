// Background service worker for the extension
console.log('Shopify Admin Events Viewer: Background service worker initialized');

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Shopify Admin Events Viewer installed');
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'log') {
    console.log('Extension log:', request.message);
    sendResponse({ success: true });
  } else if (request.action === 'updateBadge') {
    // Update badge based on events availability
    const tabId = sender.tab?.id;
    if (tabId) {
      if (request.available) {
        chrome.action.setBadgeText({ tabId, text: '👍' });
        chrome.action.setBadgeBackgroundColor({ tabId, color: [0, 0, 0, 0] });
      } else {
        chrome.action.setBadgeText({ tabId, text: '' });
      }
      sendResponse({ success: true });
    }
  }
  return true;
});

// Update icon based on whether we're on a Shopify admin page
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    if (tab.url.includes('admin.shopify.com')) {
      // On Shopify admin page - icon is already active
      chrome.action.setIcon({
        tabId: tabId,
        path: {
          "16": "icon16.png",
          "48": "icon48.png",
          "128": "icon128.png"
        }
      });
      // Content script will automatically check events availability via updateBadge()
    } else {
      // Clear badge on non-Shopify pages
      chrome.action.setBadgeText({ tabId, text: '' });
    }
  }
});
