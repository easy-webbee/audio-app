import { Component } from '@angular/core';

import { ChannelComponent } from './components/channel/channel';

import { Channel } from './models/channel.model';
import { Workspace } from './models/workspace.model';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { WorkspaceSwitcherComponent } from './components/workspace-switcher/workspace-switcher.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    SidebarComponent,
    ChannelComponent,
    WorkspaceSwitcherComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  selectedWorkspace: Workspace = {
    id: 'workspace-1',
    name: 'My Workspace'
  };

  selectedChannel: Channel = {
    id: 'general',
    name: 'general'
  };

  selectWorkspace(workspace: Workspace): void {

    this.selectedWorkspace = workspace;

    this.selectedChannel = {
      id: '',
      name: ''
    };
  }

  selectChannel(channel: Channel): void {
    this.selectedChannel = channel;
  }
}