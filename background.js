// Background service worker for Reddit Helper extension

// Initialize extension when it starts up
chrome.runtime.onStartup.addListener(() => {
  console.log('Reddit Helper extension starting up - initializing API polling on Reddit tabs');
  initializeRedditTabs();
});

// Initialize extension when it's installed or enabled
chrome.runtime.onInstalled.addListener(() => {
  console.log('Reddit Helper extension installed/enabled - initializing API polling on Reddit tabs');
  initializeRedditTabs();
});

// Monitor tab updates to auto-start API polling on Reddit pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only act when the page has finished loading
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('reddit.com')) {
    console.log('Reddit tab loaded, initializing API polling:', tab.url);

    // Small delay to ensure content script is fully loaded
    setTimeout(() => {
      chrome.tabs.sendMessage(tabId, {
        action: 'startApiPolling'
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('Content script not ready yet, will auto-start when loaded');
        } else {
          console.log('API polling initialized on Reddit tab:', response);
        }
      });
    }, 1000);
  }
});

// Function to initialize API polling on all existing Reddit tabs
function initializeRedditTabs() {
  chrome.tabs.query({url: "*://www.reddit.com/*"}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.id) {
        console.log('Initializing API polling on existing Reddit tab:', tab.url);
        chrome.tabs.sendMessage(tab.id, {
          action: 'startApiPolling'
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.log('Content script not ready on tab:', tab.id);
          } else {
            console.log('API polling initialized on existing tab:', response);
          }
        });
      }
    });
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "executeOnReddit") {
    // Forward message to content script
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        if (tabs[0].url && tabs[0].url.includes('reddit.com')) {
          chrome.tabs.sendMessage(tabs[0].id, request, (response) => {
            if (chrome.runtime.lastError) {
              console.error('Error sending message to content script:', chrome.runtime.lastError);
              sendResponse({ success: false, message: 'Failed to communicate with page' });
            } else {
              sendResponse(response);
            }
          });
        } else {
          // Navigate to Reddit first, then execute action
          chrome.tabs.update(tabs[0].id, {url: 'https://www.reddit.com'}, () => {
            // Wait a moment for the page to load, then send the message
            setTimeout(() => {
              chrome.tabs.sendMessage(tabs[0].id, request, (response) => {
                if (chrome.runtime.lastError) {
                  console.error('Error sending message after navigation:', chrome.runtime.lastError);
                  sendResponse({ success: false, message: 'Failed to communicate after navigation' });
                } else {
                  sendResponse(response);
                }
              });
            }, 3000);
          });
        }
      } else {
        sendResponse({ success: false, message: 'No active tab found' });
      }
    });
    return true; // Keep message channel open for async response
  }
});