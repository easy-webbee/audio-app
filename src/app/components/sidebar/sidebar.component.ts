import {
  Component,
  inject,
  input,
  output,
  signal,
  HostListener,
} from '@angular/core';

import { AsyncPipe } from '@angular/common';

import { toObservable } from '@angular/core/rxjs-interop';
import { switchMap, tap } from 'rxjs';

import { ChannelService } from '../../services/channel.service';

import { Channel } from '../../models/channel.model';
import { Workspace } from '../../models/workspace.model';
import { UnreadService } from '../../services/unread.service';
import { ChannelSection } from '../../models/section.model';
import { LocalStorageService } from '../../services/localstorage.service';
import { HelperService } from '../../services/helper.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @HostListener('document:click')
  onDocumentClick() {
    this.closeContextMenu();
  }

  @HostListener('document:contextmenu', ['$event'])
  onDocumentContextMenu(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (!target.closest('.context-menu')) {
      this.closeContextMenu();
    }
  }

  private channelService = inject(ChannelService);

  private unreadService = inject(UnreadService);

  private localStorageService = inject(LocalStorageService);
  public helperService = inject(HelperService);

  // ==========================================
  // UNREAD COUNTS
  // ==========================================

  public unreadCounts = this.unreadService.counts;

  // ==========================================
  // TOTAL MESSAGE COUNTS
  // ==========================================

  readonly messageCounts = this.unreadService.messageCounts;

  // ==========================================
  // INPUTS
  // ==========================================

  workspace = input.required<Workspace>();

  selectedChannel = input<Channel | null>(null);

  // ==========================================
  // OUTPUT
  // ==========================================

  channelSelected = output<Channel>();

  // ==========================================
  // SECTIONS
  // ==========================================

  sections = signal<ChannelSection[]>(
    this.localStorageService.createSections()
  );

  // ==========================================
  // CHANNELS
  // ==========================================

  channels$ = toObservable(this.workspace).pipe(
    switchMap((workspace) => this.channelService.getChannels(workspace.id)),

    tap((channels) => {
      // Watch every channel for unread messages

      for (const channel of channels) {
        this.unreadService.watchChannel(this.workspace().id, channel.id);
      }

      // Group channels into sections

      this.groupChannels(channels);

      // Select first channel

      // if (channels.length > 0) {
      //   this.channelSelected.emit(channels[0]);
      // }
    })
  );

  // ==========================================
  // GROUP CHANNELS
  // ==========================================

  private groupChannels(channels: Channel[]): void {
    this.sections.update((sections) => {
      /*
       * Create a new section array.
       *
       * Keep expanded/collapsed state.
       * Clear channels before regrouping.
       */

      const updated: ChannelSection[] = sections.map((section) => ({
        ...section,

        channels: [],
      }));

      // Put channels into their section

      for (const channel of channels) {
        let section = updated.find(
          (section) => section.id === channel.sectionId
        );

        /*
         * If the channel does not have
         * a valid section, use Other.
         */

        if (!section) {
          section = updated.find((section) => section.id === 'other');
        }

        section?.channels.push(channel);
      }

      return updated;
    });
  }

  // ==========================================
  // GET SECTION UNREAD COUNT
  // ==========================================

  getSectionUnreadCount(section: ChannelSection): number {
    const unreadCounts = this.unreadCounts();

    return section.channels.reduce((total, channel) => {
      return total + (unreadCounts[channel.id] ?? 0);
    }, 0);
  }

  // ==========================================
  // TOGGLE SECTION
  // ==========================================

  toggleSection(sectionId: string): void {
    this.sections.update((sections) => {
      const updatedSections = sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,

              expanded: !section.expanded,
            }
          : section
      );

      // Save expanded/collapsed state

      this.localStorageService.saveSectionState(updatedSections);

      return updatedSections;
    });
  }

  // ==========================================
  // SELECT CHANNEL
  // ==========================================

  selectChannel(channel: Channel): void {
    this.channelSelected.emit(channel);
  }

  // ==========================================
  // CREATE CHANNEL
  // ==========================================

  async createChannel(): Promise<void> {
    const name = prompt('Channel name');

    if (!name?.trim()) {
      return;
    }

    await this.channelService.createChannel(this.workspace().id, name);
  }

  // ==========================================
  // MOVE CHANNEL TO SECTION
  // ==========================================

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

  contextMenuVisible = false;
  contextMenuX = 0;
  contextMenuY = 0;
  contextMenuChannel: Channel | null = null;

  showChannelContextMenu(event: MouseEvent, channel: Channel) {
    event.preventDefault();
    event.stopPropagation();

    this.contextMenuX = event.clientX;
    this.contextMenuY = event.clientY;

    this.contextMenuChannel = channel;
    this.contextMenuVisible = true;
  }

  closeContextMenu() {
    this.contextMenuVisible = false;
    this.contextMenuChannel = null;
  }

  async delete_all_msg(channel: Channel): Promise<void> {
    const confirmed = confirm(
      'Are you sure you want to delete ALL-MSGs in this channel ?'
    );

    if (!confirmed) {
      return;
    }
    await this.channelService.deleteAllMessages(
      this.workspace().id,
      channel.id
    );
  }
}
