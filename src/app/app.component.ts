import { Component, inject, signal, OnInit } from '@angular/core';

import { ChannelComponent } from './components/channel/channel';

import { Channel } from './models/channel.model';
import { Workspace } from './models/workspace.model';

import { SidebarComponent } from './components/sidebar/sidebar.component';
import { WorkspaceSwitcherComponent } from './components/workspace-switcher/workspace-switcher.component';

import { UnreadService } from './services/unread.service';
import { PushNotificationService } from './services/push-notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SidebarComponent, ChannelComponent, WorkspaceSwitcherComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private unreadService = inject(UnreadService);

  private pushNotificationService = inject(PushNotificationService);

  selectedWorkspace = signal<Workspace>({
    id: 'workspace-1',
    name: 'My Workspace',
  });

  selectedChannel = signal<Channel | null>({
    name: 'ALL_IN_ONE',
    id: 'vPbVpdIoDIRjNl9j5Iu7',
  });

  ngOnInit(): void {
    // Listen for FCM notifications
    // while the app is open.
    this.pushNotificationService.listenForeground();
  }

  selectWorkspace(workspace: Workspace): void {
    this.selectedWorkspace.set(workspace);

    // Clear the old channel.
    // Sidebar will select the first channel.
    this.selectedChannel.set({
      name: 'ALL_IN_ONE',
      id: 'vPbVpdIoDIRjNl9j5Iu7',
    });
  }

  selectChannel(channel: Channel): void {
    this.selectedChannel.set(channel);

    this.unreadService.markAsRead(channel.id);
  }


  sidebarCollapsed = signal(
    localStorage.getItem('sidebarCollapsed') === 'true'
  );
  
  toggleSidebar(): void {
    this.sidebarCollapsed.update(value => {
      const newValue = !value;
      localStorage.setItem('sidebarCollapsed', String(newValue));
      return newValue;
    });
  }
}
