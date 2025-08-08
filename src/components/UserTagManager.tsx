import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload, Trash2, BarChart3, Users, Tag, History, X, AlertTriangle } from "lucide-react";
import { userTaggerService } from '../services/userTaggerService';

interface UserDetail {
  username: string;
  displayName: string;
  avatar: string;
  tagCount: number;
  tags: Array<{ id: string, name: string, icon: string, color: string, createdAt: number }>;
  lastUpdated: number;
}

interface Statistics {
  totalUsers: number;
  totalTags: number;
  totalHistoryTags: number;
  mostUsedTags: Array<{ name: string, count: number }>;
  userDetails: UserDetail[];
}

export const UserTagManager: React.FC = () => {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<'overview' | 'users' | 'tags'>('overview');

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const stats = await userTaggerService.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const handleExport = async () => {
    setIsLoading(true);
    try {
      const data = await userTaggerService.exportAllData();
      
      // 创建下载文件
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-tags-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMessage('数据导出成功！');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('导出失败：' + error.message);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsLoading(true);
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        const result = await userTaggerService.importAllData(data);
        setMessage(result.message);
        setTimeout(() => setMessage(''), 3000);
        
        if (result.success) {
          await loadStatistics();
        }
      } catch (error) {
        setMessage('导入失败：文件格式错误');
        setTimeout(() => setMessage(''), 3000);
      } finally {
        setIsLoading(false);
      }
    };
    input.click();
  };

  const handleClearData = async () => {
    if (!confirm('确定要清空所有标签数据吗？此操作无法撤销！')) {
      return;
    }

    setIsLoading(true);
    try {
      await userTaggerService.clearAllData();
      setMessage('所有数据已清空');
      setTimeout(() => setMessage(''), 3000);
      await loadStatistics();
    } catch (error) {
      setMessage('清空数据失败：' + error.message);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUser = async (username: string) => {
    if (!confirm(`确定要删除用户 @${username} 的所有标签吗？`)) {
      return;
    }

    setIsLoading(true);
    try {
      await userTaggerService.removeUserTags(username);
      setMessage(`用户 @${username} 的标签已删除`);
      setTimeout(() => setMessage(''), 3000);
      await loadStatistics();
    } catch (error) {
      setMessage('删除失败：' + error.message);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveSelectedUsers = async () => {
    if (selectedUsers.length === 0) return;
    
    if (!confirm(`确定要删除选中的 ${selectedUsers.length} 个用户的所有标签吗？`)) {
      return;
    }

    setIsLoading(true);
    try {
      const removedCount = await userTaggerService.removeMultipleUsers(selectedUsers);
      setMessage(`已删除 ${selectedUsers.length} 个用户的 ${removedCount} 个标签`);
      setSelectedUsers([]);
      setTimeout(() => setMessage(''), 3000);
      await loadStatistics();
    } catch (error) {
      setMessage('批量删除失败：' + error.message);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveTagFromAll = async (tagName: string) => {
    if (!confirm(`确定要从所有用户中删除标签"${tagName}"吗？`)) {
      return;
    }

    setIsLoading(true);
    try {
      const removedCount = await userTaggerService.removeTagFromAllUsers(tagName);
      setMessage(`已从所有用户中删除 ${removedCount} 个"${tagName}"标签`);
      setTimeout(() => setMessage(''), 3000);
      await loadStatistics();
    } catch (error) {
      setMessage('删除标签失败：' + error.message);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveTagFromUser = async (username: string, tagId: string) => {
    setIsLoading(true);
    try {
      await userTaggerService.removeTagFromUser(username, tagId);
      setMessage(`标签已删除`);
      setTimeout(() => setMessage(''), 3000);
      await loadStatistics();
    } catch (error) {
      setMessage('删除标签失败：' + error.message);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelection = (username: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, username]);
    } else {
      setSelectedUsers(selectedUsers.filter(u => u !== username));
    }
  };

  const handleSelectAllUsers = (checked: boolean) => {
    if (checked && statistics) {
      setSelectedUsers(statistics.userDetails.map(u => u.username));
    } else {
      setSelectedUsers([]);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* 统计信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            标签统计
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statistics ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg cursor-pointer" onClick={() => setCurrentView('users')}>
                <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600">{statistics.totalUsers}</div>
                <div className="text-sm text-gray-600">已标记用户</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg cursor-pointer" onClick={() => setCurrentView('tags')}>
                <Tag className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-600">{statistics.totalTags}</div>
                <div className="text-sm text-gray-600">总标签数</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <History className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-purple-600">{statistics.totalHistoryTags}</div>
                <div className="text-sm text-gray-600">历史标签</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <BarChart3 className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                <div className="text-2xl font-bold text-yellow-600">{statistics.mostUsedTags.length}</div>
                <div className="text-sm text-gray-600">常用标签种类</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">加载统计数据中...</div>
          )}
        </CardContent>
      </Card>

      {/* 最常用标签 */}
      {statistics && statistics.mostUsedTags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>最常用标签</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {statistics.mostUsedTags.slice(0, 5).map((tag, index) => (
                <div key={tag.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium">#{index + 1} {tag.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{tag.count} 次使用</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveTagFromAll(tag.name)}
                      disabled={isLoading}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 数据管理 */}
      <Card>
        <CardHeader>
          <CardTitle>数据管理</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={handleExport}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              <Download className="mr-2 h-4 w-4" />
              导出数据
            </Button>
            
            <Button 
              onClick={handleImport}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              <Upload className="mr-2 h-4 w-4" />
              导入数据
            </Button>
            
            <Button 
              onClick={handleClearData}
              disabled={isLoading}
              className="w-full"
              variant="destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              清空数据
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUsersView = () => (
    <div className="space-y-6">
      {/* 用户管理头部 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              用户管理 ({statistics?.totalUsers || 0})
            </CardTitle>
            {selectedUsers.length > 0 && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleRemoveSelectedUsers}
                disabled={isLoading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除选中 ({selectedUsers.length})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {statistics && statistics.userDetails.length > 0 && (
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === statistics.userDetails.length}
                  onChange={(e) => handleSelectAllUsers(e.target.checked)}
                />
                <span className="text-sm">全选</span>
              </label>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 用户列表 */}
      {statistics && statistics.userDetails.length > 0 ? (
        <div className="space-y-4">
          {statistics.userDetails.map((user) => (
            <Card key={user.username}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.username)}
                      onChange={(e) => handleUserSelection(user.username, e.target.checked)}
                    />
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                        {user.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{user.displayName}</div>
                        <div className="text-sm text-gray-500">@{user.username}</div>
                        <div className="text-xs text-gray-400">
                          {user.tagCount} 个标签 • {new Date(user.lastUpdated).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveUser(user.username)}
                    disabled={isLoading}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    删除
                  </Button>
                </div>
                
                {/* 用户标签 */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {user.tags.map((tag) => (
                    <div key={tag.id} className="flex items-center gap-1">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs"
                        style={{ backgroundColor: tag.color }}
                      >
                        <span>{tag.icon}</span>
                        <span>{tag.name}</span>
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveTagFromUser(user.username, tag.id)}
                        disabled={isLoading}
                        className="h-4 w-4 p-0 hover:bg-red-100"
                      >
                        <X className="h-3 w-3 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <div className="text-gray-500">暂无用户数据</div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderTagsView = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            标签管理
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statistics && statistics.mostUsedTags.length > 0 ? (
            <div className="space-y-3">
              {statistics.mostUsedTags.map((tag, index) => (
                <div key={tag.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{tag.name}</div>
                      <div className="text-sm text-gray-500">{tag.count} 次使用</div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveTagFromAll(tag.name)}
                    disabled={isLoading}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    从所有用户删除
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <div className="text-gray-500">暂无标签数据</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 导航标签 */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'overview', label: '总览', icon: BarChart3 },
          { key: 'users', label: '用户管理', icon: Users },
          { key: 'tags', label: '标签管理', icon: Tag }
        ].map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={currentView === key ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentView(key as any)}
            className="flex items-center gap-2"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Button>
        ))}
      </div>

      {/* 消息提示 */}
      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.includes('成功') || message.includes('已删除') || message.includes('已清空') 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* 内容区域 */}
      {currentView === 'overview' && renderOverview()}
      {currentView === 'users' && renderUsersView()}
      {currentView === 'tags' && renderTagsView()}
    </div>
  );
};