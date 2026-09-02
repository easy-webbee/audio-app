import {
  Component,
  inject,
  input
} from '@angular/core';

import { Channel } from '../../models/channel.model';
import { MessageInputComponent } from '../message-input/message-input.component';
import { MessageListComponent } from '../message-list/message-list.component';
import { UnreadService } from '../../services/unread.service';



@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [
    MessageListComponent,
    MessageInputComponent
  ],
  templateUrl: './channel.html',
  styleUrl: './channel.scss'
})
export class ChannelComponent {

  workspaceId = input.required<string>();

  channel = input.required<Channel>();
  private unreadService = inject(UnreadService);
  public unreadCounts = this.unreadService.counts;

}