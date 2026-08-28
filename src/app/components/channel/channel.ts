import {
  Component,
  input
} from '@angular/core';

import { Channel } from '../../models/channel.model';
import { MessageInputComponent } from '../message-input/message-input.component';
import { MessageListComponent } from '../message-list/message-list.component';



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

}