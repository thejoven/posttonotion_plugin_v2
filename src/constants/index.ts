export const API_ENDPOINTS = {
  BASE_URL: 'https://www.posttonotion.com',
  GET_SETTING: 'https://www.posttonotion.com/api/notion/setting',
  POST_TO_NOTION: 'https://www.posttonotion.com/api/notion',
  AUTH_SESSION: 'https://www.posttonotion.com/api/auth/session',
  LOGIN_PAGE: 'https://www.posttonotion.com/zh',
  REGISTER_PAGE: 'https://www.posttonotion.com/login'
} as const;

export const STORAGE_KEYS = {
  API_KEY: 'apikey',
  USER_INFO: 'userinfo', 
  TAGS: 'tags',
  AUTH_METHOD: 'authMethod',
  SESSION_TOKEN: 'sessionToken',
  SESSION_EXPIRES: 'sessionExpires'
} as const;

export const NOTIFICATION_DURATION = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 5000
} as const;

export const TWEET_URL_REGEX = /^https:\/\/x\.com\/[^/]+\/status\/\d+$/;

export const AUTH_METHODS = {
  MANUAL: 'manual',
  WEB: 'web'
} as const;

export const UI_CONFIG = {
  ANIMATION: {
    SPRING: {
      type: "spring",
      stiffness: 500,
      damping: 40,
      mass: 0.8
    }
  },
  NOTIFICATION: {
    POSITION: {
      BOTTOM: '20px',
      LEFT: '40px'
    },
    Z_INDEX: 10000
  }
} as const;