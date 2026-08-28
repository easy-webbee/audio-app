import { Component } from '@angular/core';

import { ChannelComponent } from './components/channel/channel';

import { Channel } from './models/channel.model';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    SidebarComponent,
    ChannelComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  selectedChannel: Channel = {
    id: 'general',
    name: 'general'
  };

  selectChannel(channel: Channel): void {
    this.selectedChannel = channel;
  }
}