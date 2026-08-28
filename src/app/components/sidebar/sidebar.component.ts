import { Component, inject, output } from '@angular/core';

import { ChannelService } from '../../services/channel.service';
import { Channel } from '../../models/channel.model';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

  private channelService = inject(ChannelService);

  channelSelected = output<Channel>();

  channels = this.channelService.getChannels();

  selectChannel(channel: Channel): void {
    this.channelSelected.emit(channel);
  }
}