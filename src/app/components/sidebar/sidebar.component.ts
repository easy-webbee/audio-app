import {
  Component,
  effect,
  inject,
  input,
  output
} from '@angular/core';

import { AsyncPipe } from '@angular/common';

import { toObservable } from '@angular/core/rxjs-interop';
import {
  switchMap,
  tap
} from 'rxjs';

import { ChannelService } from '../../services/channel.service';

import { Channel } from '../../models/channel.model';
import { Workspace } from '../../models/workspace.model';
import { UnreadService } from '../../services/unread.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  private channelService = inject(ChannelService);

  private unreadService = inject(UnreadService);
  
  public unreadCounts =
    this.unreadService.counts;

  workspace = input.required<Workspace>();

  selectedChannel = input<Channel | null>(null);
  
  channelSelected = output<Channel>();

  channels$ = toObservable(this.workspace).pipe(

    switchMap(workspace =>
      this.channelService.getChannels(workspace.id)
    ),
  
    tap(channels => {
  
      for (const channel of channels) {
  
        this.unreadService.watchChannel(
          this.workspace().id,
          channel.id
        );
  
      }
  
      if (channels.length > 0) {
  
        this.channelSelected.emit(
          channels[0]
        );
  
      }
  
    })
  
  );

  constructor() {

    effect(() => {

      this.channels$.subscribe(channels => {

        if (channels.length > 0) {

          this.channelSelected.emit(
            channels[0]
          );

        }

      });

    });

  }

  selectChannel(channel: Channel): void {
    this.channelSelected.emit(channel);
  }

  async createChannel(): Promise<void> {

    const name = prompt('Channel name');

    if (!name?.trim()) {
      return;
    }

    await this.channelService.createChannel(
      this.workspace().id,
      name
    );
  }
}