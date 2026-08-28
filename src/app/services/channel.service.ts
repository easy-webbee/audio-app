import { Injectable } from '@angular/core';

import { Channel } from '../models/channel.model';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {

  private channels: Channel[] = [
    {
      id: 'general',
      name: 'general'
    },
    {
      id: 'random',
      name: 'random'
    },
    {
      id: 'development',
      name: 'development'
    }
  ];

  getChannels(): Channel[] {
    return this.channels;
  }
}