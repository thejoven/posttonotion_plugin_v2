import type { AuthState, LoginCredentials, WebAuthResult, UserInfo } from '../types';
import { apiService } from './apiService';
import { storageService } from './storageService';
import { notificationService } from './notificationService';
import { API_ENDPOINTS, AUTH_METHODS } from '../constants';
import { isValidApiKey, formatError } from '../utils';

class AuthService {
  private authStateListeners: ((authState: AuthState) => void)[] = [];

  constructor() {
    this.initializeAuthStateListener();
  }

  private initializeAuthStateListener(): void {
    storageService.onChanged((changes) => {
      this.notifyAuthStateChange();
    });
  }

  async getAuthState(): Promise<AuthState> {
    return await storageService.getAuthState();
  }

  async loginWithApiKey(apiKey: string): Promise<{ success: boolean; error?: string }> {
    if (!isValidApiKey(apiKey)) {
      return {
        success: false,
        error: chrome.i18n.getMessage("key") || 'Invalid API key'
      };
    }

    try {
      const validation = await apiService.validateApiKey(apiKey);
      
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error || 'API key validation failed'
        };
      }

      await this.saveAuthData(apiKey, validation.userInfo, validation.settings, AUTH_METHODS.MANUAL);
      
      notificationService.success(chrome.i18n.getMessage("login_successful") || 'Login successful');
      
      return { success: true };
    } catch (error) {
      const errorMessage = formatError(error);
      notificationService.error(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async loginWithWeb(): Promise<{ success: boolean; error?: string }> {
    try {
      const tab = await chrome.tabs.create({
        url: API_ENDPOINTS.LOGIN_PAGE,
        active: true
      });

      return new Promise((resolve) => {
        let resolved = false;
        
        const resolveOnce = (result: { success: boolean; error?: string }) => {
          if (!resolved) {
            resolved = true;
            chrome.tabs.onRemoved.removeListener(tabRemovedListener);
            resolve(result);
          }
        };

        const checkAuth = async () => {
          if (resolved) return;
          
          try {
            const authResult = await apiService.getAuthSession();
            console.log('Auth session result:', authResult);
            
            if (authResult.success && authResult.apiKey) {
              console.log('API key from session:', authResult.apiKey);
              const validation = await apiService.validateApiKey(authResult.apiKey);
              console.log('Validation result:', validation);
              
              if (validation.isValid) {
                await this.saveAuthData(
                  authResult.apiKey, 
                  validation.userInfo, 
                  validation.settings, 
                  AUTH_METHODS.WEB
                );
                
                if (tab.id) {
                  await chrome.tabs.remove(tab.id);
                }
                
                notificationService.success(chrome.i18n.getMessage("login_successful") || 'Web login successful');
                
                resolveOnce({ success: true });
                return;
              } else {
                console.log('API key validation failed, but we have session data');
                // If validation fails but we have session data, try to use it
                if (authResult.userInfo) {
                  await this.saveAuthData(
                    authResult.apiKey,
                    authResult.userInfo,
                    { user_tag_list: 'crypto,tech,ai,other' }, // Default tags
                    AUTH_METHODS.WEB
                  );
                  
                  if (tab.id) {
                    await chrome.tabs.remove(tab.id);
                  }
                  
                  notificationService.success(chrome.i18n.getMessage("login_successful") || 'Web login successful');
                  
                  resolveOnce({ success: true });
                  return;
                }
                console.log('API key validation failed:', validation.error);
              }
            }
            
            if (!resolved) {
              setTimeout(checkAuth, 2000);
            }
          } catch (error) {
            console.log('Auth check error:', error);
            if (!resolved) {
              setTimeout(checkAuth, 2000);
            }
          }
        };

        const tabRemovedListener = (removedTabId: number) => {
          if (removedTabId === tab.id) {
            resolveOnce({
              success: false,
              error: 'Login was cancelled'
            });
          }
        };

        setTimeout(checkAuth, 3000);
        chrome.tabs.onRemoved.addListener(tabRemovedListener);
      });
      
    } catch (error) {
      const errorMessage = formatError(error);
      notificationService.error(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  private async saveAuthData(
    apiKey: string, 
    userInfo: UserInfo, 
    settings: any, 
    method: 'manual' | 'web'
  ): Promise<void> {
    console.log('Saving auth data:', { apiKey, userInfo, settings, method });
    
    await Promise.all([
      storageService.setApiKey(apiKey),
      storageService.setUserInfo(userInfo),
      storageService.setAuthMethod(method),
      settings?.user_tag_list && storageService.setTags(settings.user_tag_list)
    ]);

    if (method === AUTH_METHODS.WEB) {
      const expires = Date.now() + (24 * 60 * 60 * 1000);
      await storageService.setSessionExpires(expires);
    }

    console.log('Auth data saved, notifying state change');
    // Notify auth state change after saving data
    this.notifyAuthStateChange();
  }

  async logout(): Promise<void> {
    try {
      await storageService.clearAuth();
      notificationService.info(chrome.i18n.getMessage("logout_successful") || 'Logged out successfully');
      this.notifyAuthStateChange();
    } catch (error) {
      notificationService.error(formatError(error));
    }
  }

  async refreshAuth(): Promise<boolean> {
    const authState = await this.getAuthState();
    
    if (!authState.isAuthenticated || !authState.apiKey) {
      return false;
    }

    try {
      const validation = await apiService.validateApiKey(authState.apiKey);
      
      if (validation.isValid) {
        if (validation.settings?.user_tag_list) {
          await storageService.setTags(validation.settings.user_tag_list);
        }
        return true;
      } else {
        await this.logout();
        return false;
      }
    } catch (error) {
      console.error('Auth refresh failed:', error);
      return false;
    }
  }

  async isSessionExpired(): Promise<boolean> {
    const authMethod = await storageService.getAuthMethod();
    
    if (authMethod !== AUTH_METHODS.WEB) {
      return false;
    }
    
    return !(await storageService.isSessionValid());
  }

  onAuthStateChange(callback: (authState: AuthState) => void): void {
    this.authStateListeners.push(callback);
  }

  removeAuthStateListener(callback: (authState: AuthState) => void): void {
    const index = this.authStateListeners.indexOf(callback);
    if (index > -1) {
      this.authStateListeners.splice(index, 1);
    }
  }

  private async notifyAuthStateChange(): Promise<void> {
    const authState = await this.getAuthState();
    console.log('Notifying auth state change:', authState);
    console.log('Number of listeners:', this.authStateListeners.length);
    this.authStateListeners.forEach((callback, index) => {
      console.log(`Calling listener ${index}`);
      callback(authState);
    });
  }

  async requireAuth(): Promise<boolean> {
    const authState = await this.getAuthState();
    
    if (authState.isAuthenticated) {
      const isExpired = await this.isSessionExpired();
      if (isExpired) {
        await this.logout();
        return false;
      }
      return true;
    }
    
    return false;
  }
}

export const authService = new AuthService();