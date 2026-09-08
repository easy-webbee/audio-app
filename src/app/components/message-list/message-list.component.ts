import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  effect,
  inject,
  input,
} from '@angular/core';

import {
  AsyncPipe,
  DatePipe,
  NgFor,
  NgIf,
  NgClass,
  DecimalPipe,
} from '@angular/common';

import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, forkJoin, switchMap, tap } from 'rxjs';

import { MessageService } from '../../services/message.service';
import { MessageFormatPipe } from './msg.pipe';
import { Message } from '../../models/message.model';
import { LocalStorageService } from '../../services/localstorage.service';
import { LazyIframeComponent } from './lazy-iframe.component';
import { HelperService } from '../../services/helper.service';
import { ApiService } from '../../services/apiservice.service';
import { FormsModule } from '@angular/forms';
import * as DataSymbols from '../../models/chartData';
import { RecentMessagePipe } from './recent-msg.pipe';
import { LazyIframeIpadComponent } from './lazy-iframe-ipad-size.component';

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
    LazyIframeIpadComponent,
    DecimalPipe,
    FormsModule,
    RecentMessagePipe,
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
  User_DC_W_Time: any;

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
      const msgunread = messages.filter(
        (message: Message) => !this.isRead(message)
      );
      this.helperService.unreadCounts.set(msgunread);
      this.User_DC_W_Time = messages.reduce<
        Record<string, { discord: any; createdAt: any }[]>
      >((acc, message) => {
        const matches = [
          ...message.text.matchAll(
            /discord\.com\/channels\/\d+\/(\d+)\/(\d+)/g
          ),
        ];

        const dc_msg_full = matches.length
          ? matches.map((match) => `${match[1]}/${match[2]}`)
          : null;

        (acc[message.userName] ??= []).push({
          discord: dc_msg_full,
          createdAt: message.createdAt.seconds,
        });

        return acc;
      }, {});
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

      const dc_msg_target = {
        username: message.userName,
        createdAt: message.createdAt.seconds,
      };

      const olderDiscordMessages =
        this.User_DC_W_Time[dc_msg_target.username]?.filter(
          (item: any) => item.createdAt < dc_msg_target.createdAt
        ) ?? [];
      console.log(olderDiscordMessages);
      const discordIds = olderDiscordMessages.flatMap(
        (item: any) => item.discord ?? []
      );
      if (discordIds.length > 0) {
        forkJoin(
          discordIds.map((discordId: string) =>
            this.apiService.deleteDiscord_msg(discordId)
          )
        ).subscribe({
          next: () => console.log('All Discord messages deleted'),
          error: (err) =>
            console.error('Failed to delete Discord messages:', err),
        });
      }
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
      console.log(message.dc_msg_full);

      const discordMessages = Array.isArray(message.dc_msg_full)
        ? message.dc_msg_full
        : message.dc_msg_full?.split(',') ?? [];
      discordMessages.forEach((id: string) => {
        this.apiService.deleteDiscord_msg(id).subscribe();
      });
    }
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
   * Scroll to the first message belonging to a username.
   */
  scrollingTo(id: string): void {
    this.openMenuVisible = false;

    setTimeout(() => {
      const container = this.messagesContainer?.nativeElement;

      const message = container?.querySelector(
        `.message[data-msg-id="${CSS.escape(id)}"]`
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

  showImageModal = false;
  selectedImage = '';

  imageZoomed = false;
  imageScale = 1;

  imageX = 0;
  imageY = 0;

  private draggingImage = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private startImageX = 0;
  private startImageY = 0;

  openImage(url: string): void {
    this.selectedImage = url;

    this.showImageModal = true;
    this.imageZoomed = false;
    this.imageScale = 1;

    this.imageX = 0;
    this.imageY = 0;

    document.body.style.overflow = 'hidden';
  }

  toggleImageZoom(event: MouseEvent): void {
    // Don't toggle zoom when dragging
    if (this.draggingImage) {
      return;
    }

    event.stopPropagation();

    this.imageZoomed = !this.imageZoomed;

    if (this.imageZoomed) {
      this.imageScale = 1.25;
    } else {
      this.imageScale = 1;
      this.imageX = 0;
      this.imageY = 0;
    }
  }

  startImageDrag(event: MouseEvent): void {
    if (!this.imageZoomed) {
      return;
    }

    this.draggingImage = true;

    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;

    this.startImageX = this.imageX;
    this.startImageY = this.imageY;

    event.preventDefault();
  }

  dragImage(event: MouseEvent): void {
    if (!this.draggingImage) {
      return;
    }

    this.imageX = this.startImageX + (event.clientX - this.dragStartX);

    this.imageY = this.startImageY + (event.clientY - this.dragStartY);
  }

  stopImageDrag(): void {
    this.draggingImage = false;
  }

  closeImage(): void {
    this.showImageModal = false;
    this.selectedImage = '';

    this.imageZoomed = false;
    this.imageScale = 1;

    this.imageX = 0;
    this.imageY = 0;

    document.body.style.overflow = '';
  }

  getBullBear(ticker: string) {
    let bullxx: string = '';
    let bearxx: string = '';
    if (DataSymbols.watchlistBB[ticker]?.BULL.length > 0) {
      DataSymbols.watchlistBB[ticker].BULL.forEach((element) => {
        // bullxx += `<https://www.tradingview.com/chart/?symbol=${element}|BULL_${element}> | `;
        bullxx += `${element} || `;
      });
    }
    if (DataSymbols.watchlistBB[ticker]?.BEAR.length > 0) {
      DataSymbols.watchlistBB[ticker].BEAR.forEach((element) => {
        // bearxx +=  `<https://www.tradingview.com/chart/?symbol=${element}|BEAR_${element}> | `;
        bearxx += `${element} || `;
      });
    }
    let bullbearxx = `BULL: ${bullxx} \nBEAR: ${bearxx}`;
    return bullbearxx;
  }
}
