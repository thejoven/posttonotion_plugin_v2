import type { ApiResponse, PostToNotionData, UserSettings, WebAuthResult } from '../types';
import { API_ENDPOINTS } from '../constants';
import { formatError } from '../utils';

class ApiService {
  
  private async request<T>(
    url: string,
    options: RequestInit = {},
    apiKey?: string
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {})
    };

    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        ...options,
        headers
      });

      if (!response.ok && response.status !== 401) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw new Error(formatError(error));
    }
  }

  async getUserSettings(apiKey: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(API_ENDPOINTS.GET_SETTING, {}, apiKey);
  }

  async postToNotion(data: PostToNotionData, apiKey: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(
      API_ENDPOINTS.POST_TO_NOTION,
      {
        method: 'POST',
        body: JSON.stringify(data)
      },
      apiKey
    );
  }

  async getAuthSession(): Promise<WebAuthResult> {
    try {
      const response = await this.request<any>(API_ENDPOINTS.AUTH_SESSION);
      console.log('Raw session response:', response);
      
      if (response.error) {
        return {
          success: false,
          error: response.error
        };
      }

      // API返回结构: { user: { apiKey: "...", username: "...", email: "..." }, expires: "..." }
      const apiKey = response.user?.apiKey || response.apiKey;
      console.log('Extracted apiKey:', apiKey);
      
      if (!apiKey) {
        console.log('No API key found in response:', response);
        return {
          success: false,
          error: 'No API key returned from session'
        };
      }

      // Include user info from session response
      const userInfo = response.user ? {
        username: response.user.username,
        email: response.user.email,
        avatar: response.user.avatar
      } : undefined;
      
      console.log('Extracted userInfo:', userInfo);

      return {
        success: true,
        apiKey,
        userInfo
      };
    } catch (error) {
      console.log('Session API error:', error);
      return {
        success: false,
        error: formatError(error)
      };
    }
  }

  async validateApiKey(apiKey: string): Promise<{ isValid: boolean; userInfo?: any; settings?: UserSettings; error?: string }> {
    try {
      console.log('Validating API key:', apiKey);
      const response = await this.getUserSettings(apiKey);
      console.log('getUserSettings response:', response);
      
      if (response.error) {
        return {
          isValid: false,
          error: response.error
        };
      }

      const userInfo = response.userinfo || response.user;
      console.log('Extracted userInfo:', userInfo);
      
      return {
        isValid: true,
        userInfo,
        settings: response.setting
      };
    } catch (error) {
      console.log('API key validation error:', error);
      return {
        isValid: false,
        error: formatError(error)
      };
    }
  }
}

export const apiService = new ApiService();