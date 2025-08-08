import type { PlasmoCSConfig } from "plasmo"
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Plus, Tag as TagIcon } from 'lucide-react';
import type { UserTag } from '../types/userTagger';
import { UserTaggerModal } from '../components/UserTaggerModal';
import { userTaggerService } from '../services/userTaggerService';
import { isUserProfilePage, getCurrentProfileInfo, getProfileBottomInsertionPoint } from '../utils/profileDetection';

export const config: PlasmoCSConfig = {
  matches: ["https://x.com/*"],
}

interface TagDisplayProps {
  tags: UserTag[];
  onAddTagClick: () => void;
}

const TagDisplay: React.FC<TagDisplayProps> = ({ tags, onAddTagClick }) => {
  console.log('[TagDisplay] Rendering with tags:', tags);
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px',
      marginTop: '12px',
      marginBottom: '16px',
      flexWrap: 'wrap',
      padding: '0 16px'
    }}>
      {/* 显示现有标签 */}
      {tags.map((tag) => (
        <span
          key={tag.id}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            backgroundColor: tag.color,
            color: 'white',
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
          onClick={onAddTagClick}
          title="点击编辑标签"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <span style={{ fontSize: '14px' }}>{tag.icon}</span>
          <span>{tag.name}</span>
        </span>
      ))}
      
      {/* 只在没有标签时显示添加按钮 */}
      {tags.length === 0 && (
        <button
          onClick={onAddTagClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            backgroundColor: 'rgba(29, 155, 240, 0.1)',
            color: 'rgb(29, 155, 240)',
            border: '1px solid rgba(29, 155, 240, 0.2)',
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(29, 155, 240, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(29, 155, 240, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.2)';
          }}
          title="添加标签"
        >
          <Plus size={14} />
          <span>添加标签</span>
        </button>
      )}
    </div>
  );
};

class UserTaggerManager {
  private currentProfileInfo: any = null;
  private tagContainer: HTMLElement | null = null;
  private reactRoot: any = null;
  private isModalOpen = false;
  private userTags: UserTag[] = [];

  constructor() {
    this.init();
  }

  private async init() {
    // 监听页面变化
    this.setupPageObserver();
    
    // 初始检查
    await this.checkAndSetupTagger();
  }

  private setupPageObserver() {
    // 监听URL变化
    let currentUrl = window.location.href;
    
    const checkForChanges = async () => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        await this.checkAndSetupTagger();
      }
    };

    // 使用MutationObserver监听DOM变化
    const observer = new MutationObserver(async (mutations) => {
      // 检查是否有重要的DOM变化
      const hasSignificantChange = mutations.some(mutation => 
        mutation.type === 'childList' && 
        (mutation.target as Element)?.querySelector?.('[data-testid="UserName"]')
      );
      
      if (hasSignificantChange) {
        await this.checkAndSetupTagger();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // 定期检查URL变化
    setInterval(checkForChanges, 1000);
  }

  private async checkAndSetupTagger() {
    try {
      console.log('[UserTagger] Checking page...', window.location.pathname);
      
      // 检查是否在用户资料页面
      if (!isUserProfilePage()) {
        console.log('[UserTagger] Not a profile page');
        this.cleanup();
        return;
      }

      console.log('[UserTagger] Profile page detected');

      // 获取用户信息
      const profileInfo = getCurrentProfileInfo();
      if (!profileInfo) {
        console.log('[UserTagger] Could not get profile info');
        this.cleanup();
        return;
      }

      console.log('[UserTagger] Profile info:', profileInfo);

      // 如果是相同用户，不需要重新设置
      if (this.currentProfileInfo?.username === profileInfo.username && this.tagContainer) {
        console.log('[UserTagger] Same user, skipping setup');
        return;
      }

      // 更新当前用户信息
      this.currentProfileInfo = profileInfo;
      
      // 加载用户标签
      await this.loadUserTags();
      
      // 设置标签显示
      this.setupTagDisplay();

    } catch (error) {
      console.error('[UserTagger] Failed to setup user tagger:', error);
    }
  }

  private async loadUserTags() {
    if (!this.currentProfileInfo) return;
    
    try {
      const userData = await userTaggerService.getUserTags(this.currentProfileInfo.username);
      this.userTags = userData?.tags || [];
    } catch (error) {
      console.error('Failed to load user tags:', error);
      this.userTags = [];
    }
  }

  private setupTagDisplay() {
    if (!this.currentProfileInfo) return;

    console.log('[UserTagger] Setting up tag display for:', this.currentProfileInfo.username);

    // 保存当前用户信息，因为cleanup会清空它
    const profileInfo = this.currentProfileInfo;

    // 清理之前的标签显示（但不清空当前用户信息）
    this.cleanupTagDisplay();

    // 等待DOM稳定后再插入
    setTimeout(() => {
      // 恢复用户信息
      this.currentProfileInfo = profileInfo;
      console.log('[UserTagger] About to insert tag display for:', this.currentProfileInfo.username);
      this.insertTagDisplay();
    }, 500);
  }

  private insertTagDisplay() {
    if (!this.currentProfileInfo) {
      console.log('[UserTagger] No profile info available for tag insertion');
      return;
    }

    // 检查是否已经存在标签容器，防止重复插入
    const existingContainer = document.getElementById('user-tagger-container');
    if (existingContainer) {
      console.log('[UserTagger] Tag container already exists, skipping insertion');
      return;
    }

    console.log('[UserTagger] Attempting to find bottom insertion point...');
    const insertionPoint = getProfileBottomInsertionPoint();
    if (!insertionPoint) {
      console.log('[UserTagger] Could not find bottom insertion point for tags');
      return;
    }

    console.log('[UserTagger] Found insertion point:', insertionPoint);

    // 创建标签容器
    this.tagContainer = document.createElement('div');
    this.tagContainer.id = 'user-tagger-container';
    this.tagContainer.style.cssText = `
      display: block;
      width: 100%;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    // 插入到insertionPoint之后
    if (insertionPoint.parentElement) {
      insertionPoint.parentElement.insertBefore(this.tagContainer, insertionPoint.nextSibling);
    } else {
      insertionPoint.appendChild(this.tagContainer);
    }
    
    console.log('[UserTagger] Tag container inserted at bottom');
    console.log('[UserTagger] Tag container in DOM:', document.getElementById('user-tagger-container'));

    // 渲染React组件
    try {
      this.reactRoot = createRoot(this.tagContainer);
      console.log('[UserTagger] React root created');
      this.renderTagDisplay();
    } catch (error) {
      console.error('[UserTagger] Failed to create React root:', error);
    }
  }

  private renderTagDisplay() {
    if (!this.reactRoot) {
      console.log('[UserTagger] No React root available');
      return;
    }
    if (!this.currentProfileInfo) {
      console.log('[UserTagger] No profile info available for rendering');
      return;
    }

    console.log('[UserTagger] Rendering tag display with tags:', this.userTags);
    console.log('[UserTagger] Profile info for rendering:', this.currentProfileInfo);

    try {
      this.reactRoot.render(
        <div>
          <TagDisplay
            tags={this.userTags}
            onAddTagClick={this.handleAddTagClick}
          />
          
          <UserTaggerModal
            isOpen={this.isModalOpen}
            onClose={this.handleModalClose}
            username={this.currentProfileInfo.username}
            displayName={this.currentProfileInfo.displayName}
            avatar={this.currentProfileInfo.avatar}
            onTagsUpdate={this.handleTagsUpdate}
          />
        </div>
      );
      console.log('[UserTagger] React component rendered successfully');
    } catch (error) {
      console.error('[UserTagger] Failed to render React component:', error);
    }
  }

  private handleAddTagClick = () => {
    this.isModalOpen = true;
    this.renderTagDisplay();
  }

  private handleModalClose = () => {
    this.isModalOpen = false;
    this.renderTagDisplay();
  }

  private handleTagsUpdate = (tags: UserTag[]) => {
    this.userTags = tags;
    this.renderTagDisplay();
  }

  private cleanupTagDisplay() {
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }
    
    if (this.tagContainer) {
      this.tagContainer.remove();
      this.tagContainer = null;
    }
    
    // 清理modal容器
    const modalContainer = document.getElementById('user-tagger-modal-container');
    if (modalContainer) {
      modalContainer.remove();
    }
  }

  private cleanup() {
    this.cleanupTagDisplay();
    
    this.currentProfileInfo = null;
    this.userTags = [];
  }
}

// 启动用户标签管理器
new UserTaggerManager();