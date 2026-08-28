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

  channelId = input.required<string>();

  messages: Message[] = [];

  constructor() {

    effect(() => {

      const channelId = this.channelId();

      this.messageService
        .getMessages(channelId)
        .subscribe(messages => {
          this.messages = messages;
        });

    });

  }
}