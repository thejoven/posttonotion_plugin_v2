export interface UserInfo {
  avatar?: string;
  username: string;
  email: string;
}

export interface UserSettings {
  user_tag_list: string;
  [key: string]: any;
}

export interface ApiResponse<T = any> {
  error?: string;
  setting?: UserSettings;
  data?: T;
  [key: string]: any;
}

export interface PostToNotionData {
  tag: string;
  twtter_data: any;
  language_str: string;
}

export interface AuthSession {
  apiKey: string;
  sessionToken?: string;
  expires?: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  apiKey: string | null;
  userInfo: UserInfo | null;
  tags: string | null;
  authMethod: 'manual' | 'web' | null;
}

export interface NotificationOptions {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  position?: 'top' | 'bottom';
}

export enum SendStatus {
  Idle = 0,
  Sending = 1,
  Success = 2,
  Failed = 3
}

export interface StorageKeys {
  apikey: string;
  userinfo: UserInfo;
  tags: string;
  authMethod: 'manual' | 'web';
  sessionToken?: string;
  sessionExpires?: number;
}

export interface LoginCredentials {
  apiKey: string;
  method: 'manual' | 'web';
}

export interface WebAuthResult {
  success: boolean;
  apiKey?: string;
  userInfo?: UserInfo;
  error?: string;
}