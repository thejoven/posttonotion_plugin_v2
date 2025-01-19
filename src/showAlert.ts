export const showAlertAbove = async (id: string, message: string, width: number = 200, timeout: number = 3000): void => {
  const element = document.getElementById(id) as HTMLElement;
  if (!element) return; // 如果目标元素不存在，则退出函数

  // 获取元素的位置和尺寸信息
  const rect = element.getBoundingClientRect();
  const left = rect.left + (rect.width - width) / 2; // 水平居中

  // 设置提示框的样式
  const style = `
    position: absolute;
    left: ${left}px;
    width: ${width}px;
    max-width: 100%; /* 最大宽度为视口宽度 */
    padding: 10px;
    border: 1px solid #ccc;
    background: #fff;
    text-align: center;
    box-sizing: border-box; /* 包括内边距和边框在内的总宽度等于设置的宽度 */
    white-space: pre-wrap; /* 自动换行 */
    word-wrap: break-word; /* 长单词或URL地址换行到下一行 */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 添加阴影 */
    border-radius: 5px; /* 添加圆角 */
  `;

  // 创建提示框元素并添加样式和文本
  const popup = document.createElement('div');
  popup.style.cssText = style;
  popup.textContent = message;

  // 创建箭头元素并设置样式
  const arrow = document.createElement('div');
  arrow.style.cssText = `
    position: absolute;
    bottom: -10px; /* 箭头距离提示框底部的距离 */
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid #ccc; /* 箭头颜色与提示框边框颜色一致 */
    border-bottom: none; /* 移除底部边框 */
  `;

  // 将提示框和箭头添加到文档体中
  document.body.appendChild(popup);
  popup.appendChild(arrow);

  // 调整提示框的高度以适应内容
  popup.style.height = 'auto';
  const popupRect = popup.getBoundingClientRect();
  const top = rect.top - popupRect.height - 10; // 提示框出现在目标元素上方，减去提示框高度和一定的偏移量

  // 更新提示框的 top 样式
  popup.style.top = `${top}px`;

  // 确保提示框不会超出视口顶部
  if (top < 0) {
    popup.style.top = '10px'; // 设置一个最小的 top 值，避免超出视口顶部
  }

  // 在一定时间后移除提示框和箭头
  setTimeout(() => {
    popup.remove();
  }, timeout); // 2秒后移除
};