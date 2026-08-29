import { Injectable, inject } from '@angular/core';

import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,query,orderBy
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
  
    const channelsQuery = query(
      channelsRef,
      orderBy('createdAt', 'asc')
    );
  
    return collectionData(channelsQuery, {
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
      name: name.trim(),
      createdAt: serverTimestamp()
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