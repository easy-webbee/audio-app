import {
  Component,
  inject,
  output
} from '@angular/core';

import { AsyncPipe } from '@angular/common';

import { WorkspaceService } from '../../services/workspace.service';
import { Workspace } from '../../models/workspace.model';

@Component({
  selector: 'app-workspace-switcher',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './workspace-switcher.component.html',
  styleUrl: './workspace-switcher.component.scss'
})
export class WorkspaceSwitcherComponent {

  private workspaceService = inject(WorkspaceService);

  workspaceSelected = output<Workspace>();

  workspaces$ = this.workspaceService.getWorkspaces();

  async createWorkspace(): Promise<void> {

    const name = prompt('Workspace name');

    if (!name?.trim()) {
      return;
    }

    const id = await this.workspaceService.createWorkspace(
      name
    );

    this.workspaceSelected.emit({
      id,
      name: name.trim()
    });
  }

  selectWorkspace(workspace: Workspace): void {
    this.workspaceSelected.emit(workspace);
  }
}