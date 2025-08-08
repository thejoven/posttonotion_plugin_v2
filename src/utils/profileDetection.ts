// 用于检测X.com用户资料页面的工具函数

export interface ProfileInfo {
  username: string;
  displayName: string;
  avatar: string;
}

// 检测当前页面是否为用户资料页面
export const isUserProfilePage = (): boolean => {
  // 检查URL是否符合用户资料页面模式
  const profileUrlPattern = /^\/[^\/]+\/?$/;
  if (!profileUrlPattern.test(window.location.pathname)) return false;

  // 检查是否存在用户头像容器元素  
  const avatarContainer = document.querySelector('[data-testid*="UserAvatar-Container-"]');
  if (!avatarContainer) return false;

  // 检查是否存在用户名元素
  const userNameElement = document.querySelector('[data-testid="UserName"]');
  if (!userNameElement) return false;

  // 检查是否存在"关注"按钮或关注数量元素（个人资料页面特有）
  const followButton = document.querySelector('[data-testid*="follow"]');
  const followingLink = document.querySelector('a[href*="/following"]');
  const followersLink = document.querySelector('a[href*="/verified_followers"]');
  
  return !!(followButton || followingLink || followersLink);
};

// 获取当前用户资料页面的用户信息
export const getCurrentProfileInfo = (): ProfileInfo | null => {
  if (!isUserProfilePage()) return null;

  try {
    // 获取用户名
    const userNameElement = document.querySelector('[data-testid="UserName"]');
    if (!userNameElement) return null;

    // 从URL中提取用户名（更可靠）
    const pathMatch = window.location.pathname.match(/^\/([^\/]+)/);
    if (!pathMatch) return null;
    const username = pathMatch[1];

    // 获取显示名称
    const displayNameElement = userNameElement.querySelector('span[dir="ltr"]');
    const displayName = displayNameElement?.textContent?.trim() || username;

    // 获取用户头像
    const avatarElement = document.querySelector('[data-testid*="UserAvatar-Container-"] img');
    const avatar = (avatarElement as HTMLImageElement)?.src || '';

    if (!username || !avatar) return null;

    return {
      username,
      displayName,
      avatar
    };
  } catch (error) {
    console.error('Failed to get profile info:', error);
    return null;
  }
};

// 获取用户名右侧的插入点（用于添加标签）- 已弃用
export const getUserNameInsertionPoint = (): Element | null => {
  const userNameElement = document.querySelector('[data-testid="UserName"]');
  if (!userNameElement) return null;

  // 查找包含用户显示名的直接容器
  const nameSpan = userNameElement.querySelector('span[dir="ltr"]');
  if (nameSpan && nameSpan.parentElement) {
    return nameSpan.parentElement;
  }

  // 备用方案：查找第一个包含文本的span元素的父容器
  const spans = userNameElement.querySelectorAll('span');
  for (const span of spans) {
    if (span.textContent && span.textContent.trim() && span.parentElement) {
      return span.parentElement;
    }
  }

  // 最后的备用方案：返回UserName元素本身
  return userNameElement;
};

// 获取个人资料底部的插入点（推荐的标签插入位置）
export const getProfileBottomInsertionPoint = (): Element | null => {
  // 尝试找到个人资料的主要容器
  // X.com的个人资料通常在这些位置之后插入标签比较合适
  
  // 方案1：在关注/粉丝数量下方
  const followingSection = document.querySelector('a[href*="/following"]')?.closest('[role="group"]');
  if (followingSection) {
    console.log('[ProfileDetection] Found following section:', followingSection);
    return followingSection.parentElement || followingSection;
  }

  // 方案2：在用户简介下方
  const bioContainer = document.querySelector('[data-testid="UserDescription"]');
  if (bioContainer) {
    console.log('[ProfileDetection] Found bio container:', bioContainer);
    return bioContainer.parentElement || bioContainer;
  }

  // 方案3：在位置信息下方
  const locationElement = document.querySelector('[data-testid="UserLocation"]');
  if (locationElement) {
    console.log('[ProfileDetection] Found location element:', locationElement);
    return locationElement.parentElement || locationElement;
  }

  // 方案4：在用户名容器的父级下方
  const userNameElement = document.querySelector('[data-testid="UserName"]');
  if (userNameElement) {
    // 尝试找到包含整个用户信息区域的容器
    let container = userNameElement.parentElement;
    while (container && container !== document.body) {
      // 寻找一个合适大小的容器
      if (container.children.length >= 2) {
        console.log('[ProfileDetection] Found suitable container:', container);
        return container;
      }
      container = container.parentElement;
    }
  }

  console.log('[ProfileDetection] No suitable bottom insertion point found');
  return null;
};