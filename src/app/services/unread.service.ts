import { Injectable, inject, signal } from '@angular/core';

import {
  Firestore,
  collection,
  onSnapshot,
  query,
  orderBy,
} from '@angular/fire/firestore';

import { SoundAlertService } from './sound-alert.service';

@Injectable({
  providedIn: 'root',
})
export class UnreadService {
  private firestore = inject(Firestore);

  // Current logged-in user
  private uid = localStorage.getItem('uid');

  // Unread message count per channel
  private unreadCounts = signal<Record<string, number>>({});

  readonly counts = this.unreadCounts.asReadonly();

  // Total messages in each channel
  private _messageCounts = signal<Record<string, number>>({});

  readonly messageCounts = this._messageCounts.asReadonly();

  private soundService = inject(SoundAlertService);

  private lastMessageIds = new Map<string, string>();

  private initializedChannels = new Set<string>();

  watchChannel(workspaceId: string, channelId: string): () => void {
    const messagesRef = collection(
      this.firestore,
      `workspaces/${workspaceId}/channels/${channelId}/messages`
    );

    const messagesQuery = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      // --------------------------------
      // TOTAL MESSAGE COUNT
      // --------------------------------

      this._messageCounts.update((counts) => ({
        ...counts,
        [channelId]: snapshot.size,
      }));

      // --------------------------------
      // UNREAD COUNT
      // --------------------------------

      if (!this.uid) {
        this.unreadCounts.update((counts) => ({
          ...counts,
          [channelId]: 0,
        }));

        return;
      }

      const unreadCount = snapshot.docs.filter((doc) => {
        const data = doc.data();

        const readBy = data['readBy'] as Record<string, boolean> | undefined;

        // true = read
        // false/undefined = unread
        return readBy?.[this.uid!] !== true;
      }).length;

      this.unreadCounts.update((counts) => ({
        ...counts,
        [channelId]: unreadCount,
      }));

      // --------------------------------
      // INITIALIZE CHANNEL
      // --------------------------------

      if (!this.initializedChannels.has(channelId)) {
        const lastMessage = snapshot.docs.at(-1);

        if (lastMessage) {
          this.lastMessageIds.set(channelId, lastMessage.id);
        }

        this.initializedChannels.add(channelId);

        return;
      }

      // --------------------------------
      // NEW MESSAGE SOUND
      // --------------------------------

      for (const change of snapshot.docChanges()) {
        if (change.type !== 'added') {
          continue;
        }

        const messageId = change.doc.id;

        const lastId = this.lastMessageIds.get(channelId);

        if (messageId === lastId) {
          continue;
        }

        this.lastMessageIds.set(channelId, messageId);

        this.soundService.playAlert('bullish.mp3');
      }
    });

    return unsubscribe;
  }

  // --------------------------------
  // TOTAL MESSAGE COUNT
  // --------------------------------

  getMessageCount(channelId: string): number {
    return this.messageCounts()[channelId] ?? 0;
  }

  // --------------------------------
  // MANUALLY MARK CHANNEL AS READ
  // --------------------------------
  markAsRead(channelId: string): void {
    this.unreadCounts.update((counts) => ({
      ...counts,
      [channelId]: 0,
    }));
  }
    // --------------------------------
  // UNREAD COUNT
  // --------------------------------

  getCount(channelId: string): number {
    return this.unreadCounts()[channelId] ?? 0;
  }
}
