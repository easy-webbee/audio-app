import { Injectable, inject } from '@angular/core';

import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  setDoc,
  deleteDoc
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';

import { Channel } from '../models/channel.model';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {

  private firestore = inject(Firestore);

  getChannels(workspaceId: string): Observable<Channel[]> {

    const channelsRef = collection(
      this.firestore,
      `workspaces/${workspaceId}/channels`
    );

    return collectionData(channelsRef, {
      idField: 'id'
    }) as Observable<Channel[]>;
  }

  async createChannel(
    workspaceId: string,
    name: string
  ): Promise<void> {

    const channelsRef = collection(
      this.firestore,
      `workspaces/${workspaceId}/channels`
    );

    await addDoc(channelsRef, {
      name: name.trim()
    });
  }

  async createChannelWithId(
    workspaceId: string,
    channelId: string,
    name: string
  ): Promise<void> {

    const channelRef = doc(
      this.firestore,
      `workspaces/${workspaceId}/channels/${channelId}`
    );

    await setDoc(channelRef, {
      name
    });
  }

  async deleteChannel(
    workspaceId: string,
    channelId: string
  ): Promise<void> {

    const channelRef = doc(
      this.firestore,
      `workspaces/${workspaceId}/channels/${channelId}`
    );

    await deleteDoc(channelRef);
  }
}