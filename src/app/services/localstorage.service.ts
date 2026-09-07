import { Injectable } from '@angular/core';
import { ChannelSection } from '../models/section.model';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private readonly SECTION_STATE_KEY = 'sidebar-section-state';
  setUid() {
    localStorage.setItem('uid', 'n90Q4DYyzQc8Ibv9Xw5xTmT1G5F3');
    return 'n90Q4DYyzQc8Ibv9Xw5xTmT1G5F3';
  }
  getUid() {
    return localStorage.getItem('uid');
  }

  getSectionState(): Record<string, boolean> {
    const saved = localStorage.getItem(this.SECTION_STATE_KEY);

    if (!saved) {
      return {};
    }

    try {
      return JSON.parse(saved);
    } catch {
      return {};
    }
  }

  createSections(): ChannelSection[] {
    const savedState = this.getSectionState();

    return [
      {
        id: 'trading',
        name: 'TRADING',
        expanded: savedState['trading'] ?? true,
        channels: [],
      },
      {
        id: 'crypto',
        name: 'CRYPTO',
        expanded: savedState['crypto'] ?? true,
        channels: [],
      },
      {
        id: 'forex',
        name: 'FOREX',
        expanded: savedState['forex'] ?? true,
        channels: [],
      },
      {
        id: 'us-rsi',
        name: 'US-RSI',
        expanded: savedState['us-rsi'] ?? true,
        channels: [],
      },
      {
        id: 'other',
        name: 'OTHER',
        expanded: savedState['other'] ?? true,
        channels: [],
      },

      {
        id: 'do_not_do',
        name: 'DO NOT DELETE CN',
        expanded: savedState['do_not_do'] ?? true,
        channels: [],
      },
    ];
  }

  saveSectionState(sections: ChannelSection[]): void {
    const state: Record<string, boolean> = {};

    for (const section of sections) {
      state[section.id] = section.expanded;
    }

    localStorage.setItem(this.SECTION_STATE_KEY, JSON.stringify(state));
  }
}
