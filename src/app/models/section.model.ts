import { Channel } from './channel.model';

export interface ChannelSection {
  id: string;
  name: string;
  expanded: boolean;
  channels: Channel[];
}
