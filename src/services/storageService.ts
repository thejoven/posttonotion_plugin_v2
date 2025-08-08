import { Storage } from "@plasmohq/storage";
import type { UserInfo, AuthState } from '../types';
import { STORAGE_KEYS } from '../constants';

class StorageService {
  private storage: Storage;

  constructor() {
    this.storage = new Storage();
  }

  async setApiKey(apiKey: string): Promise<void> {
    await this.storage.set(STORAGE_KEYS.API_KEY, apiKey);
  }

  async getApiKey(): Promise<string | null> {
    return await this.storage.get(STORAGE_KEYS.API_KEY);
  }

  async setUserInfo(userInfo: UserInfo): Promise<void> {
    await this.storage.set(STORAGE_KEYS.USER_INFO, userInfo);
  }

  async getUserInfo(): Promise<UserInfo | null> {
    return await this.storage.get(STORAGE_KEYS.USER_INFO);
  }

  async setTags(tags: string): Promise<void> {
    await this.storage.set(STORAGE_KEYS.TAGS, tags);
  }

  async getTags(): Promise<string | null> {
    return await this.storage.get(STORAGE_KEYS.TAGS);
  }

  async setAuthMethod(method: 'manual' | 'web'): Promise<void> {
    await this.storage.set(STORAGE_KEYS.AUTH_METHOD, method);
  }

  async getAuthMethod(): Promise<'manual' | 'web' | null> {
    return await this.storage.get(STORAGE_KEYS.AUTH_METHOD);
  }

  async setSessionToken(token: string): Promise<void> {
    await this.storage.set(STORAGE_KEYS.SESSION_TOKEN, token);
  }

  async getSessionToken(): Promise<string | null> {
    return await this.storage.get(STORAGE_KEYS.SESSION_TOKEN);
  }

  async setSessionExpires(expires: number): Promise<void> {
    await this.storage.set(STORAGE_KEYS.SESSION_EXPIRES, expires);
  }

  async getSessionExpires(): Promise<number | null> {
    return await this.storage.get(STORAGE_KEYS.SESSION_EXPIRES);
  }

  async getAuthState(): Promise<AuthState> {
    const [apiKey, userInfo, tags, authMethod] = await Promise.all([
      this.getApiKey(),
      this.getUserInfo(),
      this.getTags(),
      this.getAuthMethod()
    ]);

    return {
      isAuthenticated: !!(apiKey && userInfo),
      apiKey,
      userInfo,
      tags,
      authMethod
    };
  }

  async clearAuth(): Promise<void> {
    await Promise.all([
      this.storage.remove(STORAGE_KEYS.API_KEY),
      this.storage.remove(STORAGE_KEYS.USER_INFO),
      this.storage.remove(STORAGE_KEYS.TAGS),
      this.storage.remove(STORAGE_KEYS.AUTH_METHOD),
      this.storage.remove(STORAGE_KEYS.SESSION_TOKEN),
      this.storage.remove(STORAGE_KEYS.SESSION_EXPIRES)
    ]);
  }

  async isSessionValid(): Promise<boolean> {
    const expires = await this.getSessionExpires();
    if (!expires) return false;
    return Date.now() < expires;
  }

  onChanged(callback: (changes: any) => void): void {
    this.storage.watch({
      [STORAGE_KEYS.API_KEY]: callback,
      [STORAGE_KEYS.USER_INFO]: callback,
      [STORAGE_KEYS.TAGS]: callback,
      [STORAGE_KEYS.AUTH_METHOD]: callback,
      [STORAGE_KEYS.SESSION_TOKEN]: callback,
      [STORAGE_KEYS.SESSION_EXPIRES]: callback
    });
  }
}

export const storageService = new StorageService();