import { Component, ElementRef, inject, input, ViewChild } from '@angular/core';

import { Channel } from '../../models/channel.model';
import { MessageInputComponent } from '../message-input/message-input.component';
import { MessageListComponent } from '../message-list/message-list.component';
import { UnreadService } from '../../services/unread.service';
import { HelperService } from '../../services/helper.service';
import { NgIf } from '@angular/common';


@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [MessageListComponent, MessageInputComponent, NgIf],
  templateUrl: './channel.html',
  styleUrl: './channel.scss',
})
export class ChannelComponent {
  @ViewChild('messagesContainer')
  messagesContainer?: ElementRef<HTMLDivElement>;
  workspaceId = input.required<string>();

  channel = input.required<Channel>();
  private unreadService = inject(UnreadService);
  public helperService = inject(HelperService);
  public unreadCounts = this.unreadService.counts;

  openMenuVisible = false;
  toggleOpenMenu(event: MouseEvent): void {
    event.stopPropagation();

    this.openMenuVisible = !this.openMenuVisible;
  }
  scrollingTo(id: string): void {
    this.openMenuVisible = false;
    setTimeout(() => {
      const container = this.messagesContainer?.nativeElement;
      console.log(container);
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
}
