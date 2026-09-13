import { Component, inject, signal, OnInit } from '@angular/core';

import { ChannelComponent } from './components/channel/channel';

import { Channel } from './models/channel.model';
import { Workspace } from './models/workspace.model';

import { SidebarComponent } from './components/sidebar/sidebar.component';
import { WorkspaceSwitcherComponent } from './components/workspace-switcher/workspace-switcher.component';

import { UnreadService } from './services/unread.service';
import { PushNotificationService } from './services/push-notification.service';
import { ChannelService } from './services/channel.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SidebarComponent, ChannelComponent, WorkspaceSwitcherComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private unreadService = inject(UnreadService);
  private channelService = inject(ChannelService);

  private pushNotificationService = inject(PushNotificationService);

  selectedWorkspace = signal<Workspace>({
    id: 'workspace-1',
    name: 'My Workspace-1',
  });

  selectedChannel = signal<Channel | null>({
    name: 'ALL_IN_ONE',
    id: 'vPbVpdIoDIRjNl9j5Iu7',
  });

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
    this.sidebarCollapsed.update((value) => {
      const newValue = !value;
      localStorage.setItem('sidebarCollapsed', String(newValue));
      return newValue;
    });
  }

  ngOnInit(): void {
    this.pushNotificationService.listenForeground();
  
    this.pushNotificationService.notificationClick$.subscribe(
      async ({ channelId, messageId }) => {
        alert(`'Opening notification message:', ${channelId},${messageId},`);
  
        const nameI = await firstValueFrom(
          this.channelService.getChannelName(
            'workspace-1',
            channelId
          )
        );
  
        const channel: Channel = {
          name: nameI ?? '',
          id: channelId,
        };
        alert(channel)
        this.selectChannel(channel);
      }
    );
  }
}