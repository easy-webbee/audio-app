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

  // Unread/new message counts
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
      // Total number of messages
      this._messageCounts.update((counts) => ({
        ...counts,
        [channelId]: snapshot.size,
      }));

      // Existing unread logic
      if (!this.initializedChannels.has(channelId)) {
        const lastMessage = snapshot.docs.at(-1);

        if (lastMessage) {
          this.lastMessageIds.set(channelId, lastMessage.id);
        }

        this.initializedChannels.add(channelId);

        return;
      }

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

        this.increment(channelId);

        this.soundService.playAlert('bullish.mp3');
      }
    });

    return unsubscribe;
  }

  // Get total messages
  getMessageCount(channelId: string): number {
    return this.messageCounts()[channelId] ?? 0;
  }

  // Unread count
  increment(channelId: string): void {
    this.unreadCounts.update((counts) => ({
      ...counts,

      [channelId]: (counts[channelId] ?? 0) + 1,
    }));
  }

  markAsRead(channelId: string): void {
    this.unreadCounts.update((counts) => ({
      ...counts,
      [channelId]: 0,
    }));
  }

  getCount(channelId: string): number {
    return this.unreadCounts()[channelId] ?? 0;
  }
}
