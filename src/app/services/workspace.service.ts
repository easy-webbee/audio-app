import { Injectable, inject } from '@angular/core';

import {
  Firestore,
  collection,
  collectionData,
  addDoc
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';

import { Workspace } from '../models/workspace.model';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {

  private firestore = inject(Firestore);

  getWorkspaces(): Observable<Workspace[]> {

    const workspacesRef = collection(
      this.firestore,
      'workspaces'
    );

    return collectionData(workspacesRef, {
      idField: 'id'
    }) as Observable<Workspace[]>;
  }

  async createWorkspace(name: string): Promise<string> {

    const workspacesRef = collection(
      this.firestore,
      'workspaces'
    );

    const workspace = await addDoc(workspacesRef, {
      name: name.trim()
    });

    return workspace.id;
  }
}