import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { MegaPlayerService } from './mega-player.service';
import { NgIf } from '@angular/common';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'audio-app';
  videoUrl?: string;
  constructor(
    private swUpdate: SwUpdate,
    private mega: MegaPlayerService
  ) {
    this.swUpdate.versionUpdates.subscribe((event) => {
      if (confirm('New version available. Load new version?')) {
        window.location.reload();
      }
    });
  }
  async ngOnInit() {
    console.log(132)
    this.videoUrl = await this.mega.getVideoBlobUrl(
      'https://mega.nz/file/ZbpD3LjC#-6YA65wD8Ez5qv7MTFoJ8A99146vl3h1v5BvcylNZFs'
    );
    console.log(132)
    console.log(this.videoUrl)
  }
}
