# Post to Notion 功能修复说明

## 🔧 已修复的问题

### 原问题
点击 Post to Notion 功能后出现错误：
```
Request URL: https://x.com/marktowin8/status/[object%20Object]
Status Code: 400 Bad Request
```

### 根本原因
在 `main3.tsx` 的 `getTweetData` 函数中，当从 background script 获取 TweetDetail URL 时，调用了 `response.toString()` 但没有进行适当的类型检查和错误处理。

### 修复措施
1. **改进了 URL 处理**：在 `main3.tsx` 中添加了类型检查和 URL 格式验证
2. **增强了错误处理**：添加了详细的错误日志和状态检查
3. **优化了 background script**：增加了 URL 验证逻辑

## 🧪 测试步骤

### 1. 加载更新后的扩展
```bash
# 重新加载扩展
# 在 Chrome 扩展管理页面中，点击"重新加载"按钮
# 或者重新加载 build/chrome-mv3-prod 目录
```

### 2. 调试模式测试
1. 打开任意 Twitter 推文页面
2. 按 F12 打开开发者工具
3. 切换到 Console 标签
4. 清除现有日志

### 3. 执行 Post to Notion 操作
1. 确保已登录 PostToNotion 账户
2. 点击扩展悬浮菜单中的任意标签
3. 观察 Console 日志输出

### 4. 预期的调试日志
如果工作正常，应该看到类似以下的日志：
```
Background received message: getRequestHeaders
Sending headers: {x-csrf-token: "...", authorization: "...", ...}
Background received message: getLatestTweetDetailUrl  
Sending URL: https://x.com/i/api/graphql/...TweetDetail...
Fetching tweet data from URL: https://x.com/i/api/graphql/...TweetDetail...
Using headers: {...}
Response status: 200
Tweet data fetched successfully: {...}
```

### 5. 错误情况的日志
如果仍有问题，日志会显示具体错误：
```
Failed to get headers: {...}
Failed to get URL: {...}
No TweetDetail URL found
Invalid URL format: [显示实际的URL]
Invalid or empty TweetDetail URL: {...}
```

## 🔍 故障排除

### 问题1: 仍然出现 `[object Object]` 错误
**可能原因**: Background script 没有正确拦截 TweetDetail 请求
**解决方案**:
1. 刷新 Twitter 页面
2. 重新访问推文页面（点击推文进入详情页）
3. 确保 URL 格式为 `https://x.com/username/status/1234567890`

### 问题2: "No TweetDetail URL found" 错误
**可能原因**: Background script 未捕获到 Twitter API 请求
**解决方案**:
1. 确保扩展有足够权限
2. 在推文页面进行一些交互（点赞、转发等）触发 API 请求
3. 等待几秒钟后再尝试

### 问题3: "Failed to get headers" 错误
**可能原因**: Background script 通信问题
**解决方案**:
1. 重启浏览器
2. 重新加载扩展
3. 检查是否有其他扩展冲突

## 🔧 调试命令

如果需要手动调试，可以在 Console 中运行：

```javascript
// 检查 background script 通信
chrome.runtime.sendMessage({action: "getLatestTweetDetailUrl"}, (response) => {
  console.log("URL response:", response, typeof response);
});

chrome.runtime.sendMessage({action: "getRequestHeaders"}, (response) => {
  console.log("Headers response:", response);
});

// 检查当前页面 URL
console.log("Current URL:", window.location.href);
console.log("Is valid tweet page:", /^https:\/\/x\.com\/[^/]+\/status\/\d+$/.test(window.location.href));
```

## 📝 关键修复点

### main3.tsx (第203-213行)
```typescript
// 确保response是字符串
const url = typeof response === 'string' ? response : String(response);

// 验证URL格式
if (!url.includes('TweetDetail') || url.includes('undefined') || url.includes('[object')) {
  console.error("Invalid URL format:", url);
  reject(new Error("Invalid TweetDetail URL format"));
  return;
}
```

### background/index.ts (第62-68行)
```typescript
// 发送前验证URL
if (!latestTweetDetailUrl || !latestTweetDetailUrl.includes('TweetDetail')) {
  console.error("Invalid or empty TweetDetail URL:", latestTweetDetailUrl);
  sendResponse(null);
} else {
  sendResponse(latestTweetDetailUrl);
}
```

现在您可以重新加载扩展并测试 Post to Notion 功能，应该能够正常工作了！