import { Injectable, inject } from '@angular/core';

import {
  Firestore,
  collection,
  collectionData,
  collectionChanges,
  addDoc,
  serverTimestamp,
  orderBy,
  query,
  doc,
  updateDoc
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';

import { Message } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private firestore = inject(Firestore);

  getMessages(
    workspaceId: string,
    channelId: string
  ): Observable<Message[]> {

    const messagesRef = collection(
      this.firestore,
      `workspaces/${workspaceId}/channels/${channelId}/messages`
    );

    const messagesQuery = query(
      messagesRef,
      orderBy('createdAt', 'asc')
    );

    return collectionData(messagesQuery, {
      idField: 'id'
    }) as Observable<Message[]>;
  }

  watchNewMessages(
    workspaceId: string,
    channelId: string
  ) {

    const messagesRef = collection(
      this.firestore,
      `workspaces/${workspaceId}/channels/${channelId}/messages`
    );

    const messagesQuery = query(
      messagesRef,
      orderBy('createdAt', 'asc')
    );

    return collectionChanges(messagesQuery);
  }

  async sendMessage(
    workspaceId: string,
    channelId: string,
    userId: string,
    userName: string,
    text: string
  ): Promise<void> {

    const messagesRef = collection(
      this.firestore,
      `workspaces/${workspaceId}/channels/${channelId}/messages`
    );

    await addDoc(messagesRef, {
      userId,
      userName,
      text,
      createdAt: serverTimestamp()
    });
  }

  async setMessageRead(
    workspaceId: string,
    channelId: string,
    messageId: string,
    read: boolean
  ): Promise<void> {
  
    const messageRef = doc(
      this.firestore,
      `workspaces/${workspaceId}/channels/${channelId}/messages/${messageId}`
    );
  
    await updateDoc(messageRef, {
      read
    });
  }
}