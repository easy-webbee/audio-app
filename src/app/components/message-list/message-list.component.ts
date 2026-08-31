import {
  Component,
  ElementRef,
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

  workspaceId = input.required<string>();
  channelId = input.required<string>();

  @ViewChild('messagesContainer')
  messagesContainer?: ElementRef<HTMLDivElement>;

  private uid = this.localStorageService.getUid();

  messages$ = combineLatest([
    toObservable(this.workspaceId),
    toObservable(this.channelId),
  ]).pipe(
    switchMap(([workspaceId, channelId]) =>
      this.messageService.getMessages(workspaceId, channelId)
    ),
    tap(() => {
      setTimeout(() => {
        this.scrollToBottom();
      });
    })
  );

  constructor() {
    /*
     * Whenever the channel changes,
     * scroll to the newest message.
     */
    effect(() => {
      this.channelId();

      setTimeout(() => {
        this.scrollToBottom();
      });
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
}
