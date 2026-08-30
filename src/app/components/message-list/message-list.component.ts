import { Component, inject, input } from '@angular/core';
import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, switchMap } from 'rxjs';
import { MessageService } from '../../services/message.service';
import { MessageFormatPipe } from './msg.pipe';
import { Message } from '../../models/message.model';
import { LocalStorageService } from '../../services/localstorage.service';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [AsyncPipe, NgIf, NgFor, MessageFormatPipe, DatePipe],
  templateUrl: './message-list.component.html',
  styleUrl: './message-list.component.scss',
})
export class MessageListComponent {
  private messageService = inject(MessageService);
  private localStorageService = inject(LocalStorageService);

  workspaceId = input.required<string>();
  channelId = input.required<string>();

  private uid = this.localStorageService.getUid();

  messages$ = combineLatest([
    toObservable(this.workspaceId),
    toObservable(this.channelId),
  ]).pipe(
    switchMap(([workspaceId, channelId]) =>
      this.messageService.getMessages(workspaceId, channelId)
    )
  );

  async toggleRead(message: Message): Promise<void> {
    console.log(123, message);
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

  async deleteMessage(message: Message): Promise<void> {
    const confirmed = confirm('Are you sure you want to delete this message?');

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
