import { TWEET_URL_REGEX } from '../constants';

export const extractTweetId = (url: string): string | null => {
  const match = url.match(/\d+$/);
  return match ? match[0] : null;
};

export const isTweetPage = (url: string): boolean => {
  return TWEET_URL_REGEX.test(url);
};

export const generateSearchText = (text: string): string => {
  return text.charAt(0);
};

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const getCurrentUrl = (): string => {
  return window.location.href;
};

export const getUserLanguage = (): string => {
  return chrome.i18n.getUILanguage();
};

export const isValidApiKey = (apiKey: string): boolean => {
  return apiKey && apiKey.trim().length > 0;
};

export const formatError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
};