import {
  Component,
  inject,
  input,
  output,
  signal,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';

import { AsyncPipe } from '@angular/common';

import { toObservable } from '@angular/core/rxjs-interop';
import { switchMap, tap, shareReplay } from 'rxjs';

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
  // ==========================================
  // CONTEXT MENU ELEMENT
  // ==========================================

  @ViewChild('contextMenu')
  contextMenu!: ElementRef<HTMLElement>;

  // ==========================================
  // DOCUMENT CLICK
  // ==========================================

  @HostListener('document:click')
  onDocumentClick() {
    this.closeContextMenu();
  }

  // ==========================================
  // DOCUMENT RIGHT CLICK
  // ==========================================

  @HostListener('document:contextmenu', ['$event'])
  onDocumentContextMenu(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (!target.closest('.context-menu')) {
      this.closeContextMenu();
    }
  }

  // ==========================================
  // SERVICES
  // ==========================================

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
      for (const channel of channels) {
        this.unreadService.watchChannel(this.workspace().id, channel.id);
      }

      this.groupChannels(channels);

      const channelA = channels.filter((channel) => channel?.alert === true);

      console.log(channelA);

      this.helperService.alertChannelId.set(channelA);
    }),

    shareReplay({
      bufferSize: 1,
      refCount: true,
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

      // ==========================================
      // PUT CHANNELS INTO THEIR SECTION
      // ==========================================

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

    this.closeContextMenu();
  }

  // ==========================================
  // CONTEXT MENU
  // ==========================================

  contextMenuVisible = false;

  contextMenuX = 0;

  contextMenuY = 0;

  contextMenuChannel: Channel | null = null;

  // ==========================================
  // SHOW CONTEXT MENU
  // ==========================================

  showChannelContextMenu(event: MouseEvent, channel: Channel): void {
    event.preventDefault();

    event.stopPropagation();

    // Save channel

    this.contextMenuChannel = channel;

    // Initial mouse position

    this.contextMenuX = event.clientX;

    this.contextMenuY = event.clientY;

    // Show menu

    this.contextMenuVisible = true;

    /*
     * Angular needs to render the menu first
     * before we can know its actual height/width.
     *
     * setTimeout allows @ViewChild to become
     * available.
     */

    setTimeout(() => {
      this.positionContextMenu(event.clientX, event.clientY);
    });
  }

  // ==========================================
  // POSITION CONTEXT MENU
  // ==========================================

  private positionContextMenu(mouseX: number, mouseY: number): void {
    if (!this.contextMenu) {
      return;
    }

    const menu = this.contextMenu.nativeElement;

    // ==========================================
    // MENU SIZE
    // ==========================================

    const menuWidth = menu.offsetWidth;

    const menuHeight = menu.offsetHeight;

    // ==========================================
    // VIEWPORT SIZE
    // ==========================================

    const viewportWidth = window.innerWidth;

    const viewportHeight = window.innerHeight;

    const padding = 8;

    // ==========================================
    // INITIAL POSITION
    // ==========================================

    let top = mouseY;

    let left = mouseX;

    // ==========================================
    // FLIP UP
    // ==========================================

    /*
     * If there isn't enough room below
     * the mouse, place the menu above it.
     */

    if (mouseY + menuHeight > viewportHeight - padding) {
      top = mouseY - menuHeight;
    }

    // ==========================================
    // PREVENT TOP OVERFLOW
    // ==========================================

    if (top < padding) {
      top = padding;
    }

    // ==========================================
    // MOVE LEFT
    // ==========================================

    /*
     * If there isn't enough room on the
     * right side of the screen, move menu left.
     */

    if (mouseX + menuWidth > viewportWidth - padding) {
      left = mouseX - menuWidth;
    }

    // ==========================================
    // PREVENT LEFT OVERFLOW
    // ==========================================

    if (left < padding) {
      left = padding;
    }

    // ==========================================
    // APPLY POSITION
    // ==========================================

    this.contextMenuX = left;

    this.contextMenuY = top;
  }

  // ==========================================
  // CLOSE CONTEXT MENU
  // ==========================================

  closeContextMenu(): void {
    this.contextMenuVisible = false;

    this.contextMenuChannel = null;
  }

  // ==========================================
  // DELETE ALL MESSAGES
  // ==========================================

  async delete_all_msg(channel: Channel): Promise<void> {
    const confirmed = confirm(
      'Are you sure you want to delete ALL-MSGs in this channel ?'
    );

    if (!confirmed) {
      this.closeContextMenu();

      return;
    }

    await this.channelService.deleteAllMessages(
      this.workspace().id,
      channel.id
    );

    this.closeContextMenu();

    // ==========================================
    // DELETE CHANNEL
    // ==========================================

    // if (channel.sectionId !== 'do_not_do') {
    //   const confirmed2 = confirm(
    //     'Are you sure you want to delete this channel ? ' + channel.name
    //   );

    //   if (!confirmed2) {
    //     this.closeContextMenu();

    //     return;
    //   }

    //   await this.channelService.deleteChannel(this.workspace().id, channel.id);
    // }
  }

  // ==========================================
  // COPY CHANNEL ID
  // ==========================================

  async copyText(contextMenuChannel: Channel | null): Promise<void> {
    if (contextMenuChannel) {
      console.log(contextMenuChannel);

      this.helperService.copyText(contextMenuChannel.id);

      this.closeContextMenu();
    }
  }

  // ==========================================
  // TOGGLE ALERT
  // ==========================================

  async alertTogle(channel: Channel): Promise<void> {
    console.log('🔥 alertTogle CALLED', channel.id, channel.alert);

    await this.channelService.updateChannelAlert(
      this.workspace().id,
      channel.id,
      !channel.alert
    );

    console.log('🔥 updateChannelAlert FINISHED');

    this.closeContextMenu();
  }
}
