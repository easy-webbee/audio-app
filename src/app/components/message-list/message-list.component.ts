import { Component, inject, input } from '@angular/core';
import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, switchMap } from 'rxjs';
import { MessageService } from '../../services/message.service';
import { MessageFormatPipe } from './msg.pipe';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    NgFor,
    MessageFormatPipe,
    DatePipe
  ],
  templateUrl: './message-list.component.html',
  styleUrl: './message-list.component.scss'
})
export class MessageListComponent {

  private messageService = inject(MessageService);

  workspaceId = input.required<string>();
  channelId = input.required<string>();

  messages$ = combineLatest([
    toObservable(this.workspaceId),
    toObservable(this.channelId),
  ]).pipe(
    switchMap(([workspaceId, channelId]) =>
      this.messageService.getMessages(workspaceId, channelId)
    )
  );
}