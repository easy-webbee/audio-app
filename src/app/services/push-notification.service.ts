import { Injectable } from '@angular/core';

import {
  getMessaging,
  getToken,
  onMessage,
  Messaging,
} from 'firebase/messaging';

import { Subject } from 'rxjs';

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

  /**
   * Emits when the user clicks a notification
   * while the Angular app is open.
   */
  private notificationClickSubject = new Subject<NotificationClickData>();

  notificationClick$ = this.notificationClickSubject.asObservable();

  constructor() {
    this.messaging = getMessaging();
  }

  /**
   * Request notification permission
   * and get the Firebase Cloud Messaging token.
   */
  async requestPermission(): Promise<string | null> {
    try {
      console.log('1. Requesting notification permission...');

      const permission = await Notification.requestPermission();

      console.log('2. Notification permission:', permission);

      if (permission !== 'granted') {
        console.log('Notification permission was not granted');

        return null;
      }

      if (!('serviceWorker' in navigator)) {
        console.error('Service Worker is not supported by this browser');

        return null;
      }

      console.log('3. Checking service workers...');

      const registrations = await navigator.serviceWorker.getRegistrations();

      console.log('4. Service Worker registrations:', registrations);

      if (!registrations.length) {
        console.error('No Service Worker registrations found');

        return null;
      }

      registrations.forEach((registration, index) => {
        console.log(`Service Worker #${index + 1}:`);

        console.log('  Scope:', registration.scope);

        console.log('  Installing:', registration.installing);

        console.log('  Waiting:', registration.waiting);

        console.log('  Active:', registration.active);

        console.log('  Active state:', registration.active?.state);
      });

      const registration = registrations.find(
        (item) => item.active && item.active.state === 'activated'
      );

      if (!registration) {
        console.error('No ACTIVE Service Worker found');

        return null;
      }

      console.log('5. Active Service Worker found:', registration);

      console.log('6. Active Service Worker:', registration.active);

      console.log('7. Service Worker state:', registration.active?.state);

      console.log('8. Calling Firebase getToken...');

      const token = await getToken(this.messaging, {
        vapidKey: environment.firebaseVapidKey,

        serviceWorkerRegistration: registration,
      });

      if (!token) {
        console.error('9. Firebase did not return an FCM token');

        return null;
      }

      console.log('9. FCM token:', token);

      return token;
    } catch (error) {
      console.error('FCM registration error:', error);

      return null;
    }
  }

  /**
   * Listen for FCM notifications while
   * the Angular application is open.
   */
  listenForeground(): void {
    console.log('Starting foreground FCM listener...');

    onMessage(this.messaging, (payload) => {
      console.log('Foreground notification received:', payload);

      const title = payload.notification?.title ?? 'Stock Alert';

      const body = payload.notification?.body ?? '';

      console.log('Notification title:', title);

      console.log('Notification body:', body);

      if (Notification.permission !== 'granted') {
        return;
      }

      const notification = new Notification(title, {
        body,

        icon: '/assets/icons/icon-192x192.png',

        tag: payload.data?.['ticker'] ?? 'stock-alert',

        /**
         * This contains:
         *
         * channelId
         * messageId
         * ticker
         */
        data: payload.data,
      });

      notification.onclick = () => {
        console.log('Notification clicked:', payload.data);

        const channelId = payload.data?.['channelId'];

        const messageId = payload.data?.['messageId'];

        const ticker = payload.data?.['ticker'];

        if (channelId && messageId) {
          this.notificationClickSubject.next({
            channelId,
            messageId,
            ticker,
          });
        } else {
          console.warn(
            'Notification is missing channelId or messageId',
            payload.data
          );
        }

        window.focus();

        notification.close();
      };
    });
  }
}