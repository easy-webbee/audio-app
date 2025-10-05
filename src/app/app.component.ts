import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { environment } from '../environments/environment.development';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'audio-app';
  videoUrl?: any;
  constructor(

  ) {
    // this.swUpdate.versionUpdates.subscribe((event) => {
    //   if (confirm('New version available. Load new version?')) {
    //     window.location.reload();
    //   }
    // });
  }

  @ViewChild('audio', { static: true }) audioRef!: ElementRef<HTMLAudioElement>;

  ngOnInit() {
    const megaFileUrl = encodeURIComponent(
      'https://mega.nz/file/oTgiCKib#M2TyXr8cBTJzUI1oFyyZ9L92Of0hRv5VxbDvOBncGbs'
    );
    this.videoUrl = `${environment.keyobUrl}mega/stream?url=${megaFileUrl}`;
  }

  playAudio() {
    this.audioRef.nativeElement.src = this.videoUrl;
    this.audioRef.nativeElement.play();
  }
}
