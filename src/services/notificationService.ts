import type { NotificationOptions } from '../types';
import { NOTIFICATION_DURATION, UI_CONFIG } from '../constants';

class NotificationService {
  
  private createNotificationElement(options: NotificationOptions): HTMLElement {
    const div = document.createElement('div');
    div.innerHTML = options.message;
    
    Object.assign(div.style, {
      position: 'fixed',
      bottom: UI_CONFIG.NOTIFICATION.POSITION.BOTTOM,
      left: UI_CONFIG.NOTIFICATION.POSITION.LEFT,
      backgroundColor: this.getBackgroundColor(options.type),
      color: 'white',
      padding: '10px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: UI_CONFIG.NOTIFICATION.Z_INDEX.toString(),
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      maxWidth: '320px',
      wordBreak: 'break-word',
      transition: 'all 0.3s ease'
    });

    return div;
  }

  private getBackgroundColor(type: NotificationOptions['type']): string {
    switch (type) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'info':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  }

  private show(options: NotificationOptions): void {
    const notification = this.createNotificationElement(options);
    const duration = options.duration || NOTIFICATION_DURATION.MEDIUM;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
          if (notification.parentElement) {
            document.body.removeChild(notification);
          }
        }, 300);
      }
    }, duration);
  }

  success(message: string, duration?: number): void {
    this.show({
      message,
      type: 'success',
      duration
    });
  }

  error(message: string, duration?: number): void {
    this.show({
      message,
      type: 'error',
      duration: duration || NOTIFICATION_DURATION.LONG
    });
  }

  info(message: string, duration?: number): void {
    this.show({
      message,
      type: 'info',
      duration
    });
  }

  notify(options: NotificationOptions): void {
    this.show(options);
  }
}

export const notificationService = new NotificationService();