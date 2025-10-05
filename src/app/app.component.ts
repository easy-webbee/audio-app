import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'audio-app';
  constructor(
    private swUpdate: SwUpdate
  ) {
    this.swUpdate.versionUpdates.subscribe((event) => {
      if (confirm('New version available. Load new version?')) {
        window.location.reload();
      }
    });
  }
}
