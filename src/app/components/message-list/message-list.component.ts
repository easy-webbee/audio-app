import {
  Component,
  effect,
  inject,
  input
} from '@angular/core';

import { MessageService } from '../../services/message.service';
import { Message } from '../../models/message.model';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [],
  templateUrl: './message-list.component.html',
  styleUrl: './message-list.component.scss'
})
export class MessageListComponent {

  private messageService = inject(MessageService);

  workspaceId = input.required<string>();
  channelId = input.required<string>();

  messages: Message[] = [];

  constructor() {

    effect(() => {

      const workspaceId = this.workspaceId();
      const channelId = this.channelId();

      this.messageService
        .getMessages(workspaceId, channelId)
        .subscribe(messages => {
          this.messages = messages;
        });

    });

  }
}