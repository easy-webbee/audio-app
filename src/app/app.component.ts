import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { environment } from '../environments/environment.development';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf, NgFor],
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
    // const megaFileUrl = encodeURIComponent('https://mega.nz/file/oTgiCKib#M2TyXr8cBTJzUI1oFyyZ9L92Of0hRv5VxbDvOBncGbs');
    // this.videoUrl = `${environment.keyobUrl}mega/stream?url=${megaFileUrl}`;
    // this.videoUrl = `${environment.keyobUrl}mega/stream?url=${encodeURIComponent('https://mega.nz/file/oTgiCKib#M2TyXr8cBTJzUI1oFyyZ9L92Of0hRv5VxbDvOBncGbs')}`;
  }

  playAudio() {
    this.audioRef.nativeElement.src = this.videoUrl;
    this.audioRef.nativeElement.play();
  }
  expanded = false;
  activeIndex: number | null = null;
  subtitles = [
    { label: 'part1', detail: 'Iag3UTqJ#zUMa0uCvhQLDk3Ean18oys2yClHgQ9tkcjvg5K4myPU' },
    { label: 'part2', detail: '9bZmzaRT#IQbIAunaqsO9SzytNj1ZhjeMjL7wOYA5SQM3N88y_84' },
    { label: 'part3', detail: '9fZxHA4R#CX_5z1CpEpYnHwPJYN_zEIri3SrQPa_VR_XkmpSUbsw' },
    { label: 'part4', detail: 'gDwQxDob#LrNr3O4tAqn9fKn0Jcod49JP-mOeRqrbavlqIxE6pao' },
    { label: 'part5', detail: 'wCoFTa7L#Jwjxt7LmrOBKapH9rpdi8u0LpkJRYWQCad_IzodzaLA' },
  ];
  toggleExpand() {
    this.expanded = !this.expanded;
  }

  onSubClick(sub: any, index: number) {
    console.log(`Clicked #${index}: ${sub.detail}`);
    // toggle same item off if clicked again
    this.activeIndex = this.activeIndex === index ? null : index;
    this.loadAudio(sub.detail)
  }
  loadAudio(megastr:string){
    const megaFileUrl = encodeURIComponent(`https://mega.nz/file/${megastr}`);
    this.videoUrl = `${environment.keyobUrl}mega/stream?url=${megaFileUrl}`;
  }
}
