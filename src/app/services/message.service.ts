import { Injectable, inject } from '@angular/core';

import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  serverTimestamp,
  orderBy,
  query
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
}