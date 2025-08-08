// Background script for PostToNotion extension
// Handles communication between content scripts and Chrome API

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  switch (request.action) {
    case 'openOptionsPage':
      // 打开扩展选项页面
      chrome.runtime.openOptionsPage()
        .then(() => {
          console.log('Options page opened successfully');
          sendResponse({ success: true });
        })
        .catch((error) => {
          console.error('Failed to open options page:', error);
          sendResponse({ success: false, error: error.message });
        });
      
      // 返回true表示我们会异步发送响应
      return true;
    
    default:
      console.log('Unknown action:', request.action);
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

console.log('PostToNotion background script loaded');