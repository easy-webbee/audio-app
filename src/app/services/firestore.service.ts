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

export interface Message {
  id?: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: any;
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  private firestore = inject(Firestore);

  getMessages(channelId: string): Observable<Message[]> {

    const messagesRef = collection(
      this.firestore,
      `channels/${channelId}/messages`
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
    channelId: string,
    userId: string,
    userName: string,
    text: string
  ) {

    const messagesRef = collection(
      this.firestore,
      `channels/${channelId}/messages`
    );

    await addDoc(messagesRef, {
      userId,
      userName,
      text,
      createdAt: serverTimestamp()
    });
  }
}