// firebase.service.ts
import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore, collection, } from 'firebase/firestore';
import { Observable } from 'rxjs';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  // Initialize directly through the core Firebase web SDK
  private app = initializeApp(firebaseConfig);
  public firestore: Firestore = getFirestore(this.app);

  getCollectionData(collectionName: string): Observable<any[]> {
    const ref = collection(this.firestore, collectionName);
    // You can still use rxfire or map standard promises to observables
    return new Observable((subscriber) => {
      import('firebase/firestore').then(({ onSnapshot }) => {
        return onSnapshot(ref, 
          (snapshot) => subscriber.next(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))),
          (err) => subscriber.error(err)
        );
      });
    });
  }
}
