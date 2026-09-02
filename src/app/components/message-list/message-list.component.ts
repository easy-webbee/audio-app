import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  effect,
  inject,
  input,
} from '@angular/core';

import { AsyncPipe, DatePipe, NgFor, NgIf, NgClass, DecimalPipe } from '@angular/common';

import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, switchMap, tap } from 'rxjs';

import { MessageService } from '../../services/message.service';
import { MessageFormatPipe } from './msg.pipe';
import { Message } from '../../models/message.model';
import { LocalStorageService } from '../../services/localstorage.service';
import { LazyIframeComponent } from './lazy-iframe.component';
import { HelperService } from '../../services/helper.service';
import { ApiService } from '../../services/apiservice.service';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    NgFor,
    MessageFormatPipe,
    DatePipe,
    NgClass,
    LazyIframeComponent,
    DecimalPipe
  ],
  templateUrl: './message-list.component.html',
  styleUrl: './message-list.component.scss',
})
export class MessageListComponent {
  private messageService = inject(MessageService);
  private localStorageService = inject(LocalStorageService);
  public helperService = inject(HelperService);
  public apiService = inject(ApiService);
  workspaceId = input.required<string>();
  channelId = input.required<string>();

  @ViewChild('messagesContainer')
  messagesContainer?: ElementRef<HTMLDivElement>;

  private uid = this.localStorageService.getUid();

  /**
   * True when the user has selected/switched to a new channel.
   */
  private shouldScrollToBottom = false;

  /**
   * Keeps track of messages from the previous Firebase emission.
   *
   * This allows us to detect when a new message is added
   * without reacting to normal Firebase updates.
   */
  private previousMessageIds = new Set<string>();

  /**
   * User must be within this many pixels of the bottom
   * for a new message to automatically scroll the container.
   */
  private readonly AUTO_SCROLL_THRESHOLD = 150;

  userNames: string[] = [];

  messages$ = combineLatest([
    toObservable(this.workspaceId),
    toObservable(this.channelId),
  ]).pipe(
    switchMap(([workspaceId, channelId]) =>
      this.messageService.getMessages(workspaceId, channelId)
    ),

    tap((messages) => {
      // ========================================
      // UPDATE USERNAME LIST
      // ========================================

      this.userNames = [
        ...new Set(messages.map((message) => message.userName).filter(Boolean)),
      ];

      // ========================================
      // CURRENT MESSAGE IDS
      // ========================================

      const currentMessageIds = new Set(messages.map((message) => message.id));

      // ========================================
      // NEW CHANNEL
      // ========================================

      if (this.shouldScrollToBottom) {
        this.shouldScrollToBottom = false;

        /**
         * This is important.
         *
         * The existing messages in the new channel become
         * our baseline. Therefore, they won't be treated
         * as "new messages".
         */
        this.previousMessageIds = currentMessageIds;

        /**
         * Wait until Angular has rendered the messages
         * before calculating scrollHeight.
         */
        setTimeout(() => {
          this.scrollToBottom();
        }, 0);

        return;
      }

      // ========================================
      // SAME CHANNEL
      // CHECK FOR NEW MESSAGE
      // ========================================

      const hasNewMessage = messages.some(
        (message) => !this.previousMessageIds.has(message.id)
      );

      // Always update our baseline.
      this.previousMessageIds = currentMessageIds;

      // Nothing new was added.
      if (!hasNewMessage) {
        return;
      }

      console.log('New message detected');

      // ========================================
      // AUTO SCROLL ONLY IF NEAR BOTTOM
      // ========================================

      if (this.isNearBottom()) {
        setTimeout(() => {
          this.scrollToBottom();
        }, 0);
      }
    })
  );

  constructor() {
    effect(() => {
      this.channelId();

      // ========================================
      // NEW CHANNEL SELECTED
      // ========================================

      this.shouldScrollToBottom = true;

      /**
       * Clear the old channel's message IDs.
       *
       * The first Firebase emission from the new channel
       * will establish a fresh baseline.
       */
      this.previousMessageIds.clear();
    });
  }

  /**
   * Returns true when the user is close enough to the
   * bottom of the message container.
   */
  private isNearBottom(): boolean {
    const container = this.messagesContainer?.nativeElement;

    if (!container) {
      return true;
    }

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    return distanceFromBottom <= this.AUTO_SCROLL_THRESHOLD;
  }

  /**
   * Scroll the message container to the bottom.
   */
  private scrollToBottom(): void {
    const container = this.messagesContainer?.nativeElement;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    });
  }

  /**
   * Toggle the read state for a message.
   */
  async toggleRead(message: Message): Promise<void> {
    if (!this.uid) {
      this.uid = this.localStorageService.setUid() || '';

      console.error('No uid found in localStorage');

      return;
    }

    const currentRead = message.readBy?.[this.uid] ?? false;

    await this.messageService.setMessageRead(
      this.workspaceId(),
      this.channelId(),
      message.id,
      this.uid,
      !currentRead
    );
  }

  /**
   * Check whether the current user has read this message.
   */
  isRead(message: Message): boolean {
    if (!this.uid) {
      return false;
    }

    return message.readBy?.[this.uid] ?? false;
  }

  /**
   * Delete a message.
   *
   * If deleteother === 'read_delete_old':
   *   - Mark the selected message as read/unread
   *   - Find older messages from the same username
   *   - Delete those older messages
   *
   * Otherwise:
   *   - Delete only the selected message
   */
  async deleteMessage(message: Message, deleteother?: any): Promise<void> {
    if (deleteother === 'read_delete_old') {
      await this.toggleRead(message);

      const data = await this.messageService.getMessagesByUserName(
        this.workspaceId(),
        this.channelId(),
        message.userName
      );

      const newdata = data.filter((each) => {
        const eachTime = each.createdAt?.toMillis?.() ?? 0;
        const messageTime = message.createdAt?.toMillis?.() ?? 0;

        return eachTime < messageTime;
      });

      newdata.forEach(async (message) => {
        await this.messageService.deleteMessage(
          this.workspaceId(),
          this.channelId(),
          message.id
        );
      });
    } else {
      const confirmed = confirm(
        'Are you sure you want to delete this message?'
      );

      if (!confirmed) {
        return;
      }

      await this.messageService.deleteMessage(
        this.workspaceId(),
        this.channelId(),
        message.id
      );
    }
  }

  /**
   * Check whether a Firebase timestamp belongs to today.
   */
  isToday(timestamp: any): boolean {
    if (!timestamp) {
      return false;
    }

    const date = timestamp.toDate();
    const today = new Date();

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }

  openMenuVisible = false;

  /**
   * Toggle the Open menu.
   */
  toggleOpenMenu(event: MouseEvent): void {
    event.stopPropagation();

    this.openMenuVisible = !this.openMenuVisible;
  }

  /**
   * Scroll to the first message belonging to a username.
   */
  openOption(username: string): void {
    this.openMenuVisible = false;

    setTimeout(() => {
      const container = this.messagesContainer?.nativeElement;

      const message = container?.querySelector(
        `.message[data-username="${CSS.escape(username)}"]`
      ) as HTMLElement | null;

      if (!message) {
        return;
      }

      message.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
  }

  /**
   * Close the Open menu when clicking anywhere
   * outside the menu.
   */
  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeContextMenu();
    this.openMenuVisible = false;
  }

  closeContextMenu(): void {
    this.openMenuVisible = false;
  }

  /**
   * Request the browser to keep the screen awake.
   *
   * Works in browsers that support the Screen Wake Lock API,
   * including supported versions of Safari/iPadOS.
   */
  async keepScreenAwake(): Promise<WakeLockSentinel | null> {
    try {
      if (!('wakeLock' in navigator)) {
        console.error('Screen Wake Lock API is not supported');

        return null;
      }

      const wakeLock = await navigator.wakeLock.request('screen');

      console.log('Screen Wake Lock active');

      wakeLock.addEventListener('release', () => {
        console.log('Wake Lock released');
      });

      return wakeLock;
    } catch (err) {
      console.error('Wake Lock failed:', err);

      return null;
    }
  }

  currentPrice: any = null;
  selectedTicker = '';
  showPriceModal = false;
  loadingPrice = false;
  
  GetPrice(ticker: string): void {
    this.selectedTicker = ticker;
    this.showPriceModal = true;
    this.loadingPrice = true;
    this.currentPrice = null;
  
    this.apiService.getCurrentPrice(ticker).subscribe({
      next: (data) => {
        this.currentPrice = data;
        this.loadingPrice = false;
      },
      error: (error) => {
        console.error('Error getting current price:', error);
        this.currentPrice = null;
        this.loadingPrice = false;
      },
    });
  }
  
  closePriceModal(): void {
    this.showPriceModal = false;
  }
}
