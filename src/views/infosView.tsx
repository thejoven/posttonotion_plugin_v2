import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LayoutDashboard, Settings, Headphones, LogOut, Tag } from "lucide-react"
import { authService, type AuthState } from "~services"
import { UserTagManager } from "../components/UserTagManager"

function InfosView() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    apiKey: null,
    userInfo: null,
    tags: null,
    authMethod: null
  });
  const [showTagManager, setShowTagManager] = useState(false);

  // 检查chrome.storage标记，如果用户从弹窗跳转过来则直接显示标签管理
  useEffect(() => {
    chrome.storage.local.get(['openTagManager'], (result) => {
      if (result.openTagManager === true) {
        console.log('Opening tag manager from popup redirect');
        setShowTagManager(true);
        // 清除标记
        chrome.storage.local.remove(['openTagManager'], () => {
          console.log('Tag manager flag cleared');
        });
      }
    });
  }, []);

  const onLogout = async () => {
    await authService.logout();
  };

  useEffect(() => {
    let mounted = true;

    const loadAuthState = async () => {
      const state = await authService.getAuthState();
      if (mounted) {
        setAuthState(state);
      }
      
      // Refresh auth data to get latest user info and tags
      await authService.refreshAuth();
    };

    const handleAuthStateChange = (newState: AuthState) => {
      if (mounted) {
        setAuthState(newState);
      }
    };

    loadAuthState();
    authService.onAuthStateChange(handleAuthStateChange);

    return () => {
      mounted = false;
      authService.removeAuthStateListener(handleAuthStateChange);
    };
  }, []);
  
  if (showTagManager) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">标签管理</h1>
          <Button 
            variant="outline" 
            onClick={() => setShowTagManager(false)}
          >
            返回主页
          </Button>
        </div>
        <UserTagManager />
      </div>
    );
  }

  return (
        <Card  className="w-full max-w-md p-6">
          <CardContent className="p-0 space-y-6">
            <div className="flex flex-col items-center space-y-2">
              <Avatar className="w-20 h-20">
                <AvatarImage src={authState.userInfo?.avatar || ""} alt={authState.userInfo?.username || ""} />
                <AvatarFallback>{authState.userInfo?.username?.charAt(0) || "?"}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold">
                {`${chrome.i18n.getMessage("welcome")} ${authState.userInfo?.username || ""}`}
              </h2>
              <p className="text-sm text-gray-500">Email: {authState.userInfo?.email || ""}</p>
              {authState.authMethod && (
                <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {authState.authMethod === 'web' ? '🌐 Web Login' : '🔑 API Key Login'}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="w-full" onClick={() => window.open('https://www.posttonotion.com/dashboard/home', '_blank') }>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  {chrome.i18n.getMessage("info_dashboard")}
                </Button>
                <Button variant="outline" className="w-full" onClick={() => window.open('https://www.posttonotion.com/dashboard/setting', '_blank')}>
                  <Settings className="mr-2 h-4 w-4" />
                  {chrome.i18n.getMessage("info_setting")}
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setShowTagManager(true)}>
                  <Tag className="mr-2 h-4 w-4" />
                  标签管理
                </Button>
                <Button variant="outline" className="w-full" onClick={() => window.open('https://cooperative-sea-1e8.notion.site/tutorial-bd524f23d46546179291f9741a402f5a', '_blank') }>
                  <Headphones className="mr-2 h-4 w-4" />
                  {chrome.i18n.getMessage("info_tutorial")}
                </Button>
                <Button variant="outline" className="w-full" onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {chrome.i18n.getMessage("info_logout")}
                </Button>
            </div>
          </CardContent>
        </Card>   
  );
}

export default InfosView
