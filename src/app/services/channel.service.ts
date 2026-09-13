import { Injectable, inject } from '@angular/core';

import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  docData
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';

import { Channel } from '../models/channel.model';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private firestore = inject(Firestore);

  getChannels(workspaceId: string): Observable<Channel[]> {
    const channelsRef = collection(
      this.firestore,
      `workspaces/${workspaceId}/channels`
    );

    const channelsQuery = query(channelsRef, orderBy('createdAt', 'asc'));

    return collectionData(channelsQuery, {
      idField: 'id',
    }) as Observable<Channel[]>;
  }

  async createChannel(workspaceId: string, name: string): Promise<void> {
    const channelsRef = collection(
      this.firestore,
      `workspaces/${workspaceId}/channels`
    );

    await addDoc(channelsRef, {
      name: name.trim(),
      createdAt: serverTimestamp(),
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
      name,
    });
  }

  async deleteChannel(workspaceId: string, channelId: string): Promise<void> {
    const channelRef = doc(
      this.firestore,
      `workspaces/${workspaceId}/channels/${channelId}`
    );

    await deleteDoc(channelRef);
  }

  async updateChannelSection(
    workspaceId: string,
    channelId: string,
    sectionId: string
  ): Promise<void> {
    const channelRef = doc(
      this.firestore,
      `workspaces/${workspaceId}/channels/${channelId}`
    );

    await updateDoc(channelRef, {
      sectionId,
    });
  }

  async updateChannelAlert(
    workspaceId: string,
    channelId: string,
    alert: boolean
  ): Promise<void> {
    const channelRef = doc(
      this.firestore,
      `workspaces/${workspaceId}/channels/${channelId}`
    );

    await updateDoc(channelRef, {
      alert,
    });
  }

  async deleteAllMessages(
    workspaceId: string,
    channelId: string
  ): Promise<void> {
    const messagesRef = collection(
      this.firestore,
      `workspaces/${workspaceId}/channels/${channelId}/messages`
    );

    const snapshot = await getDocs(messagesRef);

    await Promise.all(
      snapshot.docs.map((messageDoc) => deleteDoc(messageDoc.ref))
    );
  }

  getChannelName(
    workspaceId: string,
    channelId: string
  ): Observable<string | undefined> {
    const channelRef = doc(
      this.firestore,
      `workspaces/${workspaceId}/channels/${channelId}`
    );
  
    return docData(channelRef).pipe(
      map((channel: Channel) => channel?.name)
    );
  }
}
