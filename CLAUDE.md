# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server
pnpm dev
# or
npm run dev

# Production build (creates zip file)
pnpm build
# or  
npm run build

# Linting
npm run lint
```

## Architecture Overview

This is a **Plasmo browser extension** for posting X (Twitter) content to Notion. The extension targets X.com specifically and provides an overlay interface for content sharing.

### New Service-Oriented Architecture

**Services Layer (`src/services/`)**
- `authService.ts` - Unified authentication management supporting both manual API key and web-based OAuth login
- `apiService.ts` - Centralized API communication with PostToNotion backend
- `storageService.ts` - Browser extension storage abstraction using Plasmohq Storage
- `notificationService.ts` - Consistent user feedback system replacing direct DOM manipulation

**Type Definitions (`src/types/`)**
- Comprehensive TypeScript interfaces for all data structures
- `AuthState`, `UserInfo`, `SendStatus`, and other shared types

**Utilities & Constants (`src/utils/` & `src/constants/`)**
- Reusable utility functions and application constants
- Tweet URL validation, ID extraction, UI configuration

### Key Components

**Content Script (`src/contents/main3.tsx`)**
- Main user interface overlay that appears on X.com pages
- Floating navigation menu with expandable animation using Framer Motion
- Uses new authService for authentication state management
- Integrated with notificationService for user feedback

**Extension Pages**
- `src/options.tsx` - Options page with reactive authentication state
- `src/views/loginView.tsx` - **Dual authentication interface** supporting:
  - Web-based OAuth login (opens PostToNotion.com)
  - Manual API key entry (legacy support)
- `src/views/infosView.tsx` - User profile and settings with logout functionality

### Authentication System

**Dual Login Support:**
1. **Web Login Flow**: Opens https://www.posttonotion.com/zh, polls `/api/auth/session` endpoint
2. **Manual API Key**: Direct API key input with validation via `/api/notion/setting`

**Storage Management:**
- Persistent authentication state across browser sessions
- Session expiration handling for web logins
- Automatic authentication refresh

### Browser Extension Architecture

- **Manifest V3** configuration in `package.json`
- **Host permissions**: `https://x.com/*`, `https://www.posttonotion.com/*`
- **Permissions**: `storage`, `activeTab`, `webRequest`, `tabs`
- **Content script injection**: Matches `https://x.com/*` URLs
- **Multi-locale support**: English and Chinese locales in `/locales`

### UI Framework

- **React + TypeScript** with Plasmo framework
- **Tailwind CSS** for styling with custom components in `src/components/ui/`
- **Framer Motion** for animations and transitions
- **Lucide React** icons throughout the interface

### Data Flow

1. Content script detects X.com tweet pages using regex pattern matching
2. Background script intercepts X.com TweetDetail API requests to extract tweet data
3. User selects tag from floating overlay menu
4. Tweet data + user tag sent to PostToNotion.com API via apiService
5. Success/error notifications displayed via notificationService

## Development Setup

Load the development build from `build/chrome-mv3-dev` in your Chrome browser after running the dev server.

## Production Deployment

The build command creates a production bundle ready for Chrome Web Store submission. The extension uses the built-in Plasmo BPP GitHub action for automated store submission.

## Recent Refactoring (v2.0)

The codebase has been completely refactored with:
- Service-oriented architecture for better maintainability
- Unified authentication system with dual login methods
- Centralized error handling and user notifications
- Strong TypeScript typing throughout
- Elimination of code duplication and improved abstractions