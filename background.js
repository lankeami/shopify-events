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
  }
  return true;
});

// Update icon based on whether we're on a Shopify admin page
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    if (tab.url.includes('admin.shopify.com')) {
      // On Shopify admin page - could update icon to indicate active state
      chrome.action.setIcon({
        tabId: tabId,
        path: {
          "16": "icon16.png",
          "48": "icon48.png",
          "128": "icon128.png"
        }
      });
    }
  }
});
