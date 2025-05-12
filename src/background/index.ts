import { generateClientTransactionId as generateTransactionId, initializeTransactionId } from '../lib/transaction_id';

const requestHeaders: { [key: string]: string } = {};
let latestTweetDetailUrl: string = '';


// 生成 UUID 的函数
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: 'options.html' });
})

// Listener for modifying request headers
chrome.webRequest.onBeforeSendHeaders.addListener((details) => {
  console.log(details.url);
  
  // 检查 URL 是否包含 TweetDetail
  if (details.url.includes('TweetDetail')) {
    console.log('匹配到目标 URL:', details.url);
    latestTweetDetailUrl = details.url;
    console.log(details);
    // requestHeaders["x-client-transaction-id"] = generateTransactionId();
    
    // 复制所有需要的请求头
    const requiredHeaders = [
      "x-csrf-token", "authorization", "x-twitter-active-user","x-client-uuid",
      "x-twitter-auth-type", "x-twitter-client-language", "origin",
      "pragma", "priority", "referer", "sec-ch-ua", "sec-ch-ua-arch",
      "sec-ch-ua-bitness", "sec-ch-ua-full-version", "sec-ch-ua-full-version-list",
      "sec-ch-ua-mobile", "sec-ch-ua-model", "sec-ch-ua-platform",
      "sec-ch-ua-platform-version", "sec-fetch-dest", "sec-fetch-mode",
      "sec-fetch-site", "user-agent"
    ];

    for (const header of details.requestHeaders) {
      if (requiredHeaders.includes(header.name)) {
        requestHeaders[header.name] = header.value;
      }
    }
    
    return { requestHeaders: details.requestHeaders };
  }
}, { urls: ["*://x.com/*"] }, ["requestHeaders"]);

// Message listener to handle requests from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getRequestHeaders") {
    sendResponse(requestHeaders);
  } else if (message.action === "getLatestTweetDetailUrl") {
    sendResponse(latestTweetDetailUrl);
  }
  return true; // Indicate that the response will be sent asynchronously
});

