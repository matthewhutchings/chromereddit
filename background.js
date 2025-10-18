// Background service worker for Reddit Helper extension

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