import { Storage } from "@plasmohq/storage";
import type { UserTag, UserTagData, UserTaggerStorage } from '../types/userTagger';

// 预设标签定义
export const PRESET_TAGS: UserTag[] = [
  {
    id: 'preset-tech',
    name: 'Tech',
    icon: '💻',
    color: '#1DA1F2',
    createdAt: Date.now()
  },
  {
    id: 'preset-kol',
    name: 'KOL',
    icon: '👑',
    color: '#FF6B6B',
    createdAt: Date.now()
  },
  {
    id: 'preset-ai',
    name: 'AI',
    icon: '🤖',
    color: '#4ECDC4',
    createdAt: Date.now()
  }
];

class UserTaggerService {
  private storage: Storage;
  private storageKey = 'userTagger_data';
  private tagHistoryKey = 'userTagger_tagHistory';

  constructor() {
    this.storage = new Storage();
  }

  // 获取所有用户标签数据
  async getAllUserTags(): Promise<UserTaggerStorage> {
    return await this.storage.get(this.storageKey) || {};
  }

  // 获取特定用户的标签数据
  async getUserTags(username: string): Promise<UserTagData | null> {
    const allData = await this.getAllUserTags();
    return allData[username] || null;
  }

  // 保存用户标签数据
  async saveUserTags(userData: UserTagData): Promise<void> {
    const allData = await this.getAllUserTags();
    allData[userData.username] = userData;
    await this.storage.set(this.storageKey, allData);
  }

  // 为用户添加标签
  async addTagToUser(username: string, displayName: string, avatar: string, tag: UserTag): Promise<void> {
    let userData = await this.getUserTags(username);
    
    if (!userData) {
      userData = {
        username,
        displayName,
        avatar,
        tags: [],
        lastUpdated: Date.now()
      };
    }

    // 检查是否已存在相同名称的标签
    const existingTagIndex = userData.tags.findIndex(t => t.name === tag.name);
    if (existingTagIndex >= 0) {
      userData.tags[existingTagIndex] = tag;
    } else {
      userData.tags.push(tag);
    }

    userData.lastUpdated = Date.now();
    userData.avatar = avatar; // 更新头像（可能会变化）
    userData.displayName = displayName; // 更新显示名称

    await this.saveUserTags(userData);
    
    // 将标签添加到历史记录（如果不是预设标签）
    const isPresetTag = PRESET_TAGS.some(presetTag => presetTag.name === tag.name);
    if (!isPresetTag) {
      await this.addTagToHistory(tag);
    }
  }

  // 删除用户的标签
  async removeTagFromUser(username: string, tagId: string): Promise<void> {
    const userData = await this.getUserTags(username);
    if (!userData) return;

    userData.tags = userData.tags.filter(tag => tag.id !== tagId);
    userData.lastUpdated = Date.now();

    if (userData.tags.length === 0) {
      // 如果没有标签了，删除整个用户数据
      await this.removeUserTags(username);
    } else {
      await this.saveUserTags(userData);
    }
  }

  // 删除用户的所有标签数据
  async removeUserTags(username: string): Promise<void> {
    const allData = await this.getAllUserTags();
    delete allData[username];
    await this.storage.set(this.storageKey, allData);
  }

  // 更新用户信息（头像、显示名称）
  async updateUserInfo(username: string, displayName: string, avatar: string): Promise<void> {
    const userData = await this.getUserTags(username);
    if (!userData) return;

    userData.displayName = displayName;
    userData.avatar = avatar;
    userData.lastUpdated = Date.now();

    await this.saveUserTags(userData);
  }

  // 获取标签历史
  async getTagHistory(): Promise<UserTag[]> {
    return await this.storage.get(this.tagHistoryKey) || [];
  }

  // 添加标签到历史记录
  async addTagToHistory(tag: UserTag): Promise<void> {
    const history = await this.getTagHistory();
    
    // 检查是否已存在相同名称的标签
    const existingIndex = history.findIndex(t => t.name === tag.name);
    if (existingIndex >= 0) {
      // 更新已存在的标签
      history[existingIndex] = { ...tag, createdAt: Date.now() };
    } else {
      // 添加新标签到历史记录开头
      history.unshift({ ...tag, createdAt: Date.now() });
    }

    // 限制历史记录数量（最多保存20个）
    const limitedHistory = history.slice(0, 20);
    
    await this.storage.set(this.tagHistoryKey, limitedHistory);
  }

  // 获取所有可选标签（预设标签 + 历史标签）
  async getAvailableTags(): Promise<{ presets: UserTag[], history: UserTag[] }> {
    const history = await this.getTagHistory();
    
    // 过滤掉与预设标签重名的历史标签
    const filteredHistory = history.filter(historyTag => 
      !PRESET_TAGS.some(presetTag => presetTag.name === historyTag.name)
    );

    return {
      presets: PRESET_TAGS,
      history: filteredHistory
    };
  }

  // 获取预设标签
  getPresetTags(): UserTag[] {
    return PRESET_TAGS;
  }

  // 导出所有标签数据
  async exportAllData(): Promise<{ userTags: UserTaggerStorage, tagHistory: UserTag[], exportDate: string }> {
    const userTags = await this.getAllUserTags();
    const tagHistory = await this.getTagHistory();
    
    return {
      userTags,
      tagHistory,
      exportDate: new Date().toISOString()
    };
  }

  // 导入标签数据
  async importAllData(data: { userTags?: UserTaggerStorage, tagHistory?: UserTag[] }): Promise<{ success: boolean, message: string }> {
    try {
      if (data.userTags) {
        await this.storage.set(this.storageKey, data.userTags);
      }
      
      if (data.tagHistory) {
        await this.storage.set(this.tagHistoryKey, data.tagHistory);
      }

      return { success: true, message: '数据导入成功' };
    } catch (error) {
      console.error('Failed to import data:', error);
      return { success: false, message: '数据导入失败：' + error.message };
    }
  }

  // 清空所有数据
  async clearAllData(): Promise<void> {
    await this.storage.remove(this.storageKey);
    await this.storage.remove(this.tagHistoryKey);
  }

  // 获取统计信息和用户详情
  async getStatistics(): Promise<{
    totalUsers: number,
    totalTags: number,
    totalHistoryTags: number,
    mostUsedTags: Array<{ name: string, count: number }>,
    userDetails: Array<{
      username: string,
      displayName: string,
      avatar: string,
      tagCount: number,
      tags: UserTag[],
      lastUpdated: number
    }>
  }> {
    const userTags = await this.getAllUserTags();
    const tagHistory = await this.getTagHistory();
    
    const users = Object.keys(userTags);
    let totalTags = 0;
    const tagCounts: { [key: string]: number } = {};
    const userDetails: Array<{
      username: string,
      displayName: string,
      avatar: string,
      tagCount: number,
      tags: UserTag[],
      lastUpdated: number
    }> = [];

    // 统计每个用户的标签
    users.forEach(username => {
      const userData = userTags[username];
      totalTags += userData.tags.length;
      
      // 添加用户详情
      userDetails.push({
        username: userData.username,
        displayName: userData.displayName,
        avatar: userData.avatar,
        tagCount: userData.tags.length,
        tags: userData.tags,
        lastUpdated: userData.lastUpdated
      });
      
      userData.tags.forEach(tag => {
        tagCounts[tag.name] = (tagCounts[tag.name] || 0) + 1;
      });
    });

    // 按最后更新时间排序用户详情
    userDetails.sort((a, b) => b.lastUpdated - a.lastUpdated);

    // 获取最常用的标签
    const mostUsedTags = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalUsers: users.length,
      totalTags,
      totalHistoryTags: tagHistory.length,
      mostUsedTags,
      userDetails
    };
  }

  // 删除历史标签
  async removeFromHistory(tagName: string): Promise<void> {
    const history = await this.getTagHistory();
    const filteredHistory = history.filter(tag => tag.name !== tagName);
    await this.storage.set(this.tagHistoryKey, filteredHistory);
  }

  // 批量删除标签（从所有用户中删除指定名称的标签）
  async removeTagFromAllUsers(tagName: string): Promise<number> {
    const allData = await this.getAllUserTags();
    let removedCount = 0;
    const usersToUpdate: string[] = [];

    // 遍历所有用户，删除指定标签
    Object.keys(allData).forEach(username => {
      const userData = allData[username];
      const originalLength = userData.tags.length;
      userData.tags = userData.tags.filter(tag => tag.name !== tagName);
      
      if (userData.tags.length < originalLength) {
        removedCount += originalLength - userData.tags.length;
        userData.lastUpdated = Date.now();
        
        if (userData.tags.length === 0) {
          // 如果用户没有标签了，删除整个用户数据
          delete allData[username];
        } else {
          usersToUpdate.push(username);
        }
      }
    });

    // 保存更新后的数据
    await this.storage.set(this.storageKey, allData);
    
    // 同时从历史标签中删除
    await this.removeFromHistory(tagName);

    return removedCount;
  }

  // 批量删除用户（删除多个用户的所有标签）
  async removeMultipleUsers(usernames: string[]): Promise<number> {
    const allData = await this.getAllUserTags();
    let removedCount = 0;

    usernames.forEach(username => {
      if (allData[username]) {
        removedCount += allData[username].tags.length;
        delete allData[username];
      }
    });

    await this.storage.set(this.storageKey, allData);
    return removedCount;
  }
}

export const userTaggerService = new UserTaggerService();