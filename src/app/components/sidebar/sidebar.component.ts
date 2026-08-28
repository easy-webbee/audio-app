import {
  Component,
  inject,
  input,
  output
} from '@angular/core';

import { AsyncPipe } from '@angular/common';

import { toObservable } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';

import { ChannelService } from '../../services/channel.service';
import { Channel } from '../../models/channel.model';
import { Workspace } from '../../models/workspace.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

  private channelService = inject(ChannelService);

  workspace = input.required<Workspace>();

  channelSelected = output<Channel>();

  channels$ = toObservable(this.workspace).pipe(
    switchMap(workspace =>
      this.channelService.getChannels(workspace.id)
    )
  );

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