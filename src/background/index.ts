const requestHeaders: { [key: string]: string } = {};

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: 'options.html' });
})


// Listener for modifying request headers
chrome.webRequest.onBeforeSendHeaders.addListener((details) => {
  for (let header of details.requestHeaders) {
    if (header.name === "x-csrf-token") {
      requestHeaders["x-csrf-token"] = header.value;
    } else if (header.name === "authorization") {
      requestHeaders["authorization"] = header.value;
    }
  }
  return { requestHeaders: details.requestHeaders };
}, { urls: ["*://x.com/*"] }, ["requestHeaders"]);

// Message listener to handle requests from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getRequestHeaders") {
    sendResponse(requestHeaders);
  }
  return true; // Indicate that the response will be sent asynchronously
});

