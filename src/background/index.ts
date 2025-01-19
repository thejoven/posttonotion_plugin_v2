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
/*
chrome.notifications.create(null, {
	type: 'basic',
	iconUrl: 'img/icon.png',
	title: '这是标题',
	message: '您刚才点击了自定义右键菜单！'
});*/
/*
chrome.webNavigation.onCompleted.addListener((e ) => { 
  console.log("webNavigation:")
  console.log(e)
})*/

/*
chrome.webRequest.onCompleted.addListener(
  (details) => {
    try {      
      if (details.method === "GET") {  
        // 这里可以添加逻辑来处理特定的URL
        if (details.url.includes("https://x.com/i/a")) {
          const response = fetch(details.url, {
            method: details.method,
            headers: new Headers(details.responseHeaders as any),
          });
          const responseText = response;
          console.log('Response content:', responseText);
        }
      }
    } catch (error) {
      console.error('Error fetching response:', error);
    }
  },
  { urls: ['<all_urls>'] }
);*/