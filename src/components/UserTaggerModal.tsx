import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X, Tag as TagIcon, Clock, Star, Settings, ExternalLink } from 'lucide-react';
import type { UserTag, UserTagData } from '../types/userTagger';
import { userTaggerService } from '../services/userTaggerService';

interface UserTaggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  displayName: string;
  avatar: string;
  onTagsUpdate: (tags: UserTag[]) => void;
}

const AVAILABLE_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#06b6d4',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
  '#ec4899', '#f43f5e', '#64748b', '#374151'
];

const AVAILABLE_ICONS = [
  '👤', '⭐', '💡', '🔥', '⚡', '🎯', '💎', '🚀',
  '💰', '📈', '🏆', '🎨', '🔍', '💼', '🎓', '🌟',
  '❤️', '👍', '🎉', '🔖', '📌', '🏷️', '✨', '🎪'
];

export const UserTaggerModal: React.FC<UserTaggerModalProps> = ({
  isOpen,
  onClose,
  username,
  displayName,
  avatar,
  onTagsUpdate
}) => {
  const [userTags, setUserTags] = useState<UserTag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_ICONS[0]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // 新增状态：用于标签选择
  const [viewMode, setViewMode] = useState<'select' | 'create'>('select');
  const [presetTags, setPresetTags] = useState<UserTag[]>([]);
  const [historyTags, setHistoryTags] = useState<UserTag[]>([]);

  // 加载用户标签和可用标签
  useEffect(() => {
    if (isOpen && username) {
      loadAllData();
    }
  }, [isOpen, username]);

  const loadAllData = async () => {
    try {
      // 加载用户标签
      const userData = await userTaggerService.getUserTags(username);
      setUserTags(userData?.tags || []);
      
      // 加载预设标签和历史标签
      const availableTags = await userTaggerService.getAvailableTags();
      setPresetTags(availableTags.presets);
      setHistoryTags(availableTags.history);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const handleSelectTag = async (tag: UserTag) => {
    if (isLoading) return;
    
    // 检查用户是否已有此标签
    const hasTag = userTags.some(userTag => userTag.name === tag.name);
    if (hasTag) {
      console.log('User already has this tag');
      return;
    }

    setIsLoading(true);
    try {
      const newTag = {
        ...tag,
        id: Date.now().toString(), // 生成新的ID
        createdAt: Date.now()
      };

      await userTaggerService.addTagToUser(username, displayName, avatar, newTag);
      const updatedTags = [...userTags, newTag];
      setUserTags(updatedTags);
      onTagsUpdate(updatedTags);
    } catch (error) {
      console.error('Failed to select tag:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTagName.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const newTag: UserTag = {
        id: Date.now().toString(),
        name: newTagName.trim(),
        color: selectedColor,
        icon: selectedIcon,
        createdAt: Date.now()
      };

      await userTaggerService.addTagToUser(username, displayName, avatar, newTag);
      const updatedTags = [...userTags, newTag];
      setUserTags(updatedTags);
      onTagsUpdate(updatedTags);

      // 重新加载可用标签（因为新标签会加入历史）
      const availableTags = await userTaggerService.getAvailableTags();
      setHistoryTags(availableTags.history);

      // 重置表单
      setNewTagName('');
      setIsAddingTag(false);
      setViewMode('select');
      setSelectedColor(AVAILABLE_COLORS[0]);
      setSelectedIcon(AVAILABLE_ICONS[0]);
    } catch (error) {
      console.error('Failed to add tag:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    setIsLoading(true);
    try {
      await userTaggerService.removeTagFromUser(username, tagId);
      const updatedTags = userTags.filter(tag => tag.id !== tagId);
      setUserTags(updatedTags);
      onTagsUpdate(updatedTags);
    } catch (error) {
      console.error('Failed to remove tag:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenTagManagement = () => {
    // 使用chrome.storage存储标记，表示用户想要直接访问标签管理
    chrome.storage.local.set({ openTagManager: true }, () => {
      console.log('Tag manager flag set');
      
      // 发送消息给background script来打开选项页面
      chrome.runtime.sendMessage({ action: 'openOptionsPage' }, (response) => {
        console.log('Options page opened:', response);
      });
    });
    
    onClose(); // 关闭当前弹窗
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2147483647,
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          width: '400px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: 'rgb(15, 20, 25)' }}>
            用户标签管理
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleOpenTagManagement}
              style={{
                background: 'none',
                border: '1px solid rgb(207, 217, 222)',
                padding: '6px 12px',
                borderRadius: '20px',
                cursor: 'pointer',
                color: 'rgb(29, 155, 240)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(29, 155, 240, 0.1)';
                e.currentTarget.style.borderColor = 'rgb(29, 155, 240)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'rgb(207, 217, 222)';
              }}
              title="打开标签管理页面"
            >
              <Settings size={14} />
              <span>管理</span>
              <ExternalLink size={12} />
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                borderRadius: '50%',
                cursor: 'pointer',
                color: 'rgb(83, 100, 113)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          backgroundColor: 'rgb(247, 249, 249)',
          borderRadius: '12px',
          marginBottom: '16px'
        }}>
          {/* <img
            src={avatar}
            alt={displayName}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          /> */}
          <div>
            {/* <div style={{ fontWeight: '600', color: 'rgb(15, 20, 25)' }}>{displayName}</div> */}
            <div style={{ fontSize: '14px', color: 'rgb(83, 100, 113)' }}>@{username}</div>
          </div>
        </div>

        {/* Current Tags */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 12px 0', color: 'rgb(15, 20, 25)' }}>
            当前标签
          </h3>
          {userTags.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'rgb(83, 100, 113)', fontSize: '14px' }}>
              暂无标签
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {userTags.map((tag) => (
                <div
                  key={tag.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: 'rgb(247, 249, 249)',
                    borderRadius: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>{tag.icon}</span>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        backgroundColor: tag.color,
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      {tag.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveTag(tag.id)}
                    disabled={isLoading}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '4px',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      color: 'rgb(83, 100, 113)',
                      borderRadius: '4px'
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 模式切换器 */}
        <div style={{
          display: 'flex',
          backgroundColor: 'rgb(247, 249, 249)',
          borderRadius: '8px',
          padding: '4px',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => setViewMode('select')}
            style={{
              flex: 1,
              padding: '8px 16px',
              backgroundColor: viewMode === 'select' ? 'white' : 'transparent',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              color: viewMode === 'select' ? 'rgb(15, 20, 25)' : 'rgb(83, 100, 113)',
              boxShadow: viewMode === 'select' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            快速选择
          </button>
          <button
            onClick={() => setViewMode('create')}
            style={{
              flex: 1,
              padding: '8px 16px',
              backgroundColor: viewMode === 'create' ? 'white' : 'transparent',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              color: viewMode === 'create' ? 'rgb(15, 20, 25)' : 'rgb(83, 100, 113)',
              boxShadow: viewMode === 'create' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            创建新标签
          </button>
        </div>

        {/* 标签选择界面 */}
        {viewMode === 'select' ? (
          <div>
            {/* 预设标签 */}
            {presetTags.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '12px'
                }}>
                  <Star size={16} style={{ color: 'rgb(255, 193, 7)' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: '500', margin: 0, color: 'rgb(15, 20, 25)' }}>
                    推荐标签
                  </h3>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {presetTags.map((tag) => {
                    const hasTag = userTags.some(userTag => userTag.name === tag.name);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => !hasTag && handleSelectTag(tag)}
                        disabled={hasTag || isLoading}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 12px',
                          backgroundColor: hasTag ? 'rgb(247, 249, 249)' : tag.color,
                          color: hasTag ? 'rgb(83, 100, 113)' : 'white',
                          border: 'none',
                          borderRadius: '16px',
                          fontSize: '13px',
                          fontWeight: '500',
                          cursor: hasTag ? 'not-allowed' : 'pointer',
                          opacity: hasTag ? 0.5 : 1,
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (!hasTag) {
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!hasTag) {
                            e.currentTarget.style.transform = 'scale(1)';
                          }
                        }}
                      >
                        <span style={{ fontSize: '14px' }}>{tag.icon}</span>
                        <span>{tag.name}</span>
                        {hasTag && <span style={{ fontSize: '12px' }}>已添加</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 历史标签 */}
            {historyTags.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '12px'
                }}>
                  <Clock size={16} style={{ color: 'rgb(83, 100, 113)' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: '500', margin: 0, color: 'rgb(15, 20, 25)' }}>
                    历史标签
                  </h3>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {historyTags.map((tag) => {
                    const hasTag = userTags.some(userTag => userTag.name === tag.name);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => !hasTag && handleSelectTag(tag)}
                        disabled={hasTag || isLoading}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 12px',
                          backgroundColor: hasTag ? 'rgb(247, 249, 249)' : tag.color,
                          color: hasTag ? 'rgb(83, 100, 113)' : 'white',
                          border: 'none',
                          borderRadius: '16px',
                          fontSize: '13px',
                          fontWeight: '500',
                          cursor: hasTag ? 'not-allowed' : 'pointer',
                          opacity: hasTag ? 0.5 : 1,
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (!hasTag) {
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!hasTag) {
                            e.currentTarget.style.transform = 'scale(1)';
                          }
                        }}
                      >
                        <span style={{ fontSize: '14px' }}>{tag.icon}</span>
                        <span>{tag.name}</span>
                        {hasTag && <span style={{ fontSize: '12px' }}>已添加</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 如果没有可选标签 */}
            {presetTags.length === 0 && historyTags.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgb(83, 100, 113)' }}>
                <TagIcon size={32} style={{ marginBottom: '12px' }} />
                <div style={{ fontSize: '14px' }}>暂无可选标签</div>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>点击"创建新标签"开始</div>
              </div>
            )}
          </div>
        ) : (
          /* 创建新标签界面 */
          <div>
            {isAddingTag ? (
              <div style={{ padding: '16px', backgroundColor: 'rgb(247, 249, 249)', borderRadius: '12px' }}>
                <input
                  type="text"
                  placeholder="标签名称"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid rgb(207, 217, 222)',
                    borderRadius: '6px',
                    fontSize: '14px',
                    marginBottom: '12px',
                    outline: 'none'
                  }}
                  autoFocus
                />

                {/* Color Selection */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: 'rgb(15, 20, 25)' }}>
                    选择颜色
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {AVAILABLE_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: color,
                          border: selectedColor === color ? '2px solid rgb(15, 20, 25)' : '1px solid rgb(207, 217, 222)',
                          cursor: 'pointer'
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Icon Selection */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: 'rgb(15, 20, 25)' }}>
                    选择图标
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {AVAILABLE_ICONS.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setSelectedIcon(icon)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          backgroundColor: selectedIcon === icon ? 'rgb(29, 155, 240)' : 'white',
                          border: '1px solid rgb(207, 217, 222)',
                          cursor: 'pointer',
                          fontSize: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleAddTag}
                    disabled={!newTagName.trim() || isLoading}
                    style={{
                      flex: 1,
                      padding: '8px 16px',
                      backgroundColor: 'rgb(29, 155, 240)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: !newTagName.trim() || isLoading ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      opacity: !newTagName.trim() || isLoading ? 0.5 : 1
                    }}
                  >
                    {isLoading ? '添加中...' : '添加'}
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingTag(false);
                      setNewTagName('');
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 16px',
                      backgroundColor: 'rgb(239, 243, 244)',
                      color: 'rgb(15, 20, 25)',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingTag(true)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'white',
                  border: '2px dashed rgb(207, 217, 222)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: 'rgb(83, 100, 113)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Plus size={16} />
                创建新标签
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // 创建modal容器并渲染
  let modalContainer = document.getElementById('user-tagger-modal-container');
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'user-tagger-modal-container';
    document.body.appendChild(modalContainer);
  }

  return createPortal(modalContent, modalContainer);
};