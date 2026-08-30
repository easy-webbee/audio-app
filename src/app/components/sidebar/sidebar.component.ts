import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

import { AsyncPipe } from '@angular/common';

import { toObservable } from '@angular/core/rxjs-interop';
import { switchMap, tap, map } from 'rxjs';

import { ChannelService } from '../../services/channel.service';

import { Channel } from '../../models/channel.model';
import { Workspace } from '../../models/workspace.model';
import { UnreadService } from '../../services/unread.service';
import { ChannelSection } from '../../models/section.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private channelService = inject(ChannelService);

  private unreadService = inject(UnreadService);

  public unreadCounts = this.unreadService.counts;

  readonly messageCounts = this.unreadService.messageCounts;

  workspace = input.required<Workspace>();

  selectedChannel = input<Channel | null>(null);

  channelSelected = output<Channel>();

  // Sections
  sections = signal<ChannelSection[]>([
    {
      id: 'crypto',
      name: 'crypto',
      expanded: true,
      channels: [] as Channel[],
    },
    {
      id: 'forex',
      name: 'forex',
      expanded: true,
      channels: [] as Channel[],
    },
    {
      id: 'us-rsi',
      name: 'us-rsi',
      expanded: true,
      channels: [] as Channel[],
    },
    {
      id: 'trading',
      name: 'trading',
      expanded: true,
      channels: [] as Channel[],
    },
    {
      id: 'other',
      name: 'Other',
      expanded: true,
      channels: [] as Channel[],
    },
  ]);

  channels$ = toObservable(this.workspace).pipe(
    switchMap((workspace) => this.channelService.getChannels(workspace.id)),

    tap((channels) => {
      for (const channel of channels) {
        this.unreadService.watchChannel(this.workspace().id, channel.id);
      }

      this.groupChannels(channels);

      if (channels.length > 0) {
        this.channelSelected.emit(channels[0]);
      }
    })
  );

  constructor() {
    effect(() => {
      this.channels$.subscribe((channels) => {
        if (channels.length > 0) {
          this.channelSelected.emit(channels[0]);
        }
      });
    });
  }

  private groupChannels(channels: Channel[]): void {
    this.sections.update((sections) => {
      const updated: ChannelSection[] = sections.map((section) => ({
        ...section,
        channels: [] as Channel[],
      }));

      for (const channel of channels) {
        // Change this logic to whatever
        // determines which section a channel belongs to

        let section = updated.find((s) => s.id === channel.sectionId);

        // If no section exists, put it in Other
        if (!section) {
          section = updated.find((s) => s.id === 'other');
        }

        section?.channels.push(channel);
      }

      return updated;
    });
  }

  toggleSection(sectionId: string): void {
    this.sections.update((sections) =>
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              expanded: !section.expanded,
            }
          : section
      )
    );
  }

  selectChannel(channel: Channel): void {
    this.channelSelected.emit(channel);
  }

  async createChannel(): Promise<void> {
    const name = prompt('Channel name');

    if (!name?.trim()) {
      return;
    }

    await this.channelService.createChannel(this.workspace().id, name);
  }

  async moveChannelToSection(
    channel: Channel,
    sectionId: string
  ): Promise<void> {
    await this.channelService.updateChannelSection(
      this.workspace().id,
      channel.id,
      sectionId
    );
  }
}
