import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  effect,
  inject,
  input,
} from '@angular/core';

import { AsyncPipe, DatePipe, NgFor, NgIf, NgClass } from '@angular/common';

import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, switchMap } from 'rxjs';

import { MessageService } from '../../services/message.service';
import { MessageFormatPipe } from './msg.pipe';
import { Message } from '../../models/message.model';
import { LocalStorageService } from '../../services/localstorage.service';
import { tap } from 'rxjs';
import { LazyIframeComponent } from './lazy-iframe.component';
import { HelperService } from '../../services/helper.service';

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
  ],
  templateUrl: './message-list.component.html',
  styleUrl: './message-list.component.scss',
})
export class MessageListComponent {
  private messageService = inject(MessageService);
  private localStorageService = inject(LocalStorageService);
  public helperService = inject(HelperService);
  workspaceId = input.required<string>();
  channelId = input.required<string>();

  @ViewChild('messagesContainer')
  messagesContainer?: ElementRef<HTMLDivElement>;

  private uid = this.localStorageService.getUid();

  private shouldScrollToBottom = false;

  userNames: string[] = [];
  messages$ = combineLatest([
    toObservable(this.workspaceId),
    toObservable(this.channelId),
  ]).pipe(
    switchMap(([workspaceId, channelId]) =>
      this.messageService.getMessages(workspaceId, channelId)
    ),
    /* * Firebase can emit many times. * * We only scroll when shouldScrollToBottom * was set by the channelId effect. */
    tap((messages) => {
      this.userNames = [
        ...new Set(messages.map((message) => message.userName).filter(Boolean)),
      ];

      console.log('All usernames:', this.userNames);
      if (!this.shouldScrollToBottom) {
        return;
      }

      this.shouldScrollToBottom = false;

      setTimeout(() => {
        this.scrollToBottom();
      });
    })
  );

  constructor() {
    /* * This runs when channelId changes. * * It does NOT run when Firebase updates * the messages. */
    effect(() => {
      this.channelId();

      // New channel selected
      this.shouldScrollToBottom = true;
    });
  }

  private scrollToBottom(): void {
    const container = this.messagesContainer?.nativeElement;

    if (!container) {
      return;
    }

    container.scrollTop = container.scrollHeight;
  }

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

  isRead(message: Message): boolean {
    if (!this.uid) {
      return false;
    }

    return message.readBy?.[this.uid] ?? false;
  }

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

  toggleOpenMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.openMenuVisible = !this.openMenuVisible;
  }

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
  @HostListener('document:click')
  onDocumentClick() {
    this.closeContextMenu();
    this.openMenuVisible = false;
  }

  closeContextMenu() {
    this.openMenuVisible = false;
  }

  async keepScreenAwake() {
    try {
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
}
