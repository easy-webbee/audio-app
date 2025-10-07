import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { environment } from '../environments/environment.development';
import { signal } from '@angular/core';
// import {dataAudio} from './data'
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf, NgFor],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'audio-app';
  constructor(  ) {}

  @ViewChild('audio', { static: true }) audioRef!: ElementRef<HTMLAudioElement>;

  ngOnInit() {
    // const megaFileUrl = encodeURIComponent(
    //   'https://mega.nz/file/oTgiCKib#M2TyXr8cBTJzUI1oFyyZ9L92Of0hRv5VxbDvOBncGbs'
    // );
    // this.videoUrl2 = `${environment.keyobUrl}mega/stream?url=${megaFileUrl}`;
  }

  // playAudio() {
  //   this.audioRef.nativeElement.src = this.videoUrl;
  //   this.audioRef.nativeElement.play();
  // }
  activeIndex: { [bookIndex: number]: number | null } = {};
  videoUrl = signal('');
  videoUrl2 :any;
  books = [
    {
      title: 'Atomic Habits by James Clear',
      subtitle: '5 Parts',
      expanded: false,
      parts: [
        { label: 'part1', detail: 'Iag3UTqJ#zUMa0uCvhQLDk3Ean18oys2yClHgQ9tkcjvg5K4myPU' },
        { label: 'part2', detail: '9bZmzaRT#IQbIAunaqsO9SzytNj1ZhjeMjL7wOYA5SQM3N88y_84' },
        { label: 'part3', detail: '9fZxHA4R#CX_5z1CpEpYnHwPJYN_zEIri3SrQPa_VR_XkmpSUbsw' },
        { label: 'part4', detail: 'gDwQxDob#LrNr3O4tAqn9fKn0Jcod49JP-mOeRqrbavlqIxE6pao' },
        { label: 'part5', detail: 'wCoFTa7L#Jwjxt7LmrOBKapH9rpdi8u0LpkJRYWQCad_IzodzaLA' },
      ],
    },
    {
      title: 'Emotional Intelligence Why It Can Matter More Than IQ by Daniel Goleman',
      subtitle: '3 Parts',
      expanded: false,
      parts: [
        { label: 'Part 1', detail: 'AfhThSwB#tk3w_JF6yDesQRRljPx7Wz2y3sj-smhEw4VF27-FsTo' },
        { label: 'Part 2', detail: '8T4wHK5L#66j8T4TNfAersttMKeao94qFWmV1L20aKTdGYnZ8l88' },
        { label: 'Part 3', detail: 'UWwx1CyA#UyCJ49GTB2Br9KVvJGmafMvNGgPOjZcU944gsuDS7jg' },
      ],
    },
  ];
  toggleExpand(book: any) {
    book.expanded = !book.expanded;
  }

  onSubClick(bookIndex: number, partIndex: number, part: any) {
    console.log(`Book #${bookIndex + 1}, Part #${partIndex + 1}: ${part.detail}`);
    this.activeIndex[bookIndex] =
      this.activeIndex[bookIndex] === partIndex ? null : partIndex;
    this.loadAudio(part.detail)
  }
  loadAudio(megastr:string){
    const megaFileUrl = encodeURIComponent(`https://mega.nz/file/${megastr}`);
    this.videoUrl.set(`${environment.keyobUrl}mega/stream?url=${megaFileUrl}`)
    console.log(`${environment.keyobUrl}mega/stream?url=${megaFileUrl}`)
  }
}
