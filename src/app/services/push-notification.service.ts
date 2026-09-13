import { Injectable } from '@angular/core';

import {
  getMessaging,
  getToken,
  onMessage,
  Messaging,
} from 'firebase/messaging';

import { ReplaySubject } from 'rxjs';

import { environment } from '../../environments/environment';

export interface NotificationClickData {
  channelId: string;
  messageId: string;
  ticker?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
  private messaging: Messaging;

  private notificationClickSubject = new ReplaySubject<NotificationClickData>(
    1
  );

  notificationClick$ = this.notificationClickSubject.asObservable();

  constructor() {
    this.messaging = getMessaging();

    navigator.serviceWorker?.addEventListener('message', (event) => {
      console.log('🔥 Angular received SW message:', event.data);

      if (event.data?.type === 'FCM_NOTIFICATION_CLICK') {
        const { channelId, messageId, ticker } = event.data;

        if (channelId && messageId) {
          this.notificationClickSubject.next({
            channelId,
            messageId,
            ticker,
          });
        }
      }
    });
  }

  async requestPermission(): Promise<string | null> {
    try {
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        return null;
      }

      if (!('serviceWorker' in navigator)) {
        return null;
      }

      const registrations = await navigator.serviceWorker.getRegistrations();

      const registration = registrations.find(
        (item) => item.active && item.active.state === 'activated'
      );

      if (!registration) {
        return null;
      }

      const token = await getToken(this.messaging, {
        vapidKey: environment.firebaseVapidKey,
        serviceWorkerRegistration: registration,
      });

      return token || null;
    } catch (error) {
      console.error('FCM registration error:', error);

      return null;
    }
  }

  listenForeground(): void {
    onMessage(this.messaging, (payload) => {
      const title = payload.notification?.title ?? 'Stock Alert';

      const body = payload.notification?.body ?? '';

      if (Notification.permission !== 'granted') {
        return;
      }

      const notification = new Notification(title, {
        body,
        icon: '/assets/icons/icon-192x192.png',
        tag: payload.data?.['ticker'] ?? 'stock-alert',
        data: payload.data,
      });

      notification.onclick = () => {
        const channelId = payload.data?.['channelId'];

        const messageId = payload.data?.['messageId'];

        const ticker = payload.data?.['ticker'];

        if (channelId && messageId) {
          this.notificationClickSubject.next({
            channelId,
            messageId,
            ticker,
          });
        }

        window.focus();
        notification.close();
      };
    });
  }
}
