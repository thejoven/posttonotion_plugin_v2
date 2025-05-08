const requestHeaders: { [key: string]: string } = {};

// 生成随机字符串的函数
function generateRandomString(length: number = 100): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: 'options.html' });
})


// Listener for modifying request headers
chrome.webRequest.onBeforeSendHeaders.addListener((details) => {
  console.log(details.url);
  
  // 检查 URL 是否匹配特定路径
  if (details.url.includes('https://x.com/i/api/graphql/_8aYOgEDz35BrBcBal1-_w/TweetDetail')) {
    console.log('匹配到目标 URL:', details.url);
    console.log(details)
    for (let header of details.requestHeaders) {
      if (header.name === "x-csrf-token") {
        requestHeaders["x-csrf-token"] = header.value;
      } else if (header.name === "authorization") {
        requestHeaders["authorization"] = header.value;
      } else if (header.name === "x-client-transaction-id") {
        requestHeaders["x-client-transaction-id"] = "jzVRkc8m4kPA2DLx6OFXPmKcD+ScEHMGszaavv2ouRCWN8MZLUB+L6PRiCkE2RmbPUf9MYzcQXTFvlslC9SJdUMzMWfdjA";
      } else if (header.name === "X-Client-UUID") {
        requestHeaders["x-client-uuid"] = header.value;
      } else if (header.name === "x-twitter-active-user") {
        requestHeaders["x-twitter-active-user"] = header.value;
      } else if (header.name === "x-twitter-auth-type") {
        requestHeaders["x-twitter-auth-type"] = header.value;
      } else if (header.name === "x-twitter-client-language") {
        requestHeaders["x-twitter-client-language"] = header.value;
      }
    }
    return { requestHeaders: details.requestHeaders };
  }

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