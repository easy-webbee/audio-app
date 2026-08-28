import {
  Component,
  inject,
  input
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.scss'
})
export class MessageInputComponent {

  private messageService = inject(MessageService);

  workspaceId = input.required<string>();
  channelId = input.required<string>();

  messageText = '';

  currentUser = {
    id: 'user-1',
    name: 'Luke'
  };

  async sendMessage(): Promise<void> {

    const text = this.messageText.trim();

    if (!text) {
      return;
    }

    await this.messageService.sendMessage(
      this.workspaceId(),
      this.channelId(),
      this.currentUser.id,
      this.currentUser.name,
      text
    );

    this.messageText = '';
  }
}