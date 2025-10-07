import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule, } from '@angular/common';
import { environment } from '../environments/environment';
import { signal } from '@angular/core';
import { dataAudio } from './data';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, TypeaheadModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'audio-app';
  audioTitles:any;
  selected: any;
  constructor(  ) {}

  @ViewChild('audio', { static: true }) audioRef!: ElementRef<HTMLAudioElement>;

  ngOnInit() {
    // console.log(Object.keys(dataAudio))
    this.audioTitles = Object.keys(dataAudio)
    console.log(Object.values(dataAudio))
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
  books = Object.values(dataAudio);
  toggleExpand(book: any) {
    book.expanded = !book.expanded;
  }
  subtitles:any
  onSubClick(bookIndex: number, partIndex: number, part: any) {
    console.log(`Book #${bookIndex + 1}, Part #${partIndex + 1}: ${part.detail}`);
    this.activeIndex[bookIndex] =
      this.activeIndex[bookIndex] === partIndex ? null : partIndex;
    console.log(part)
    this.loadAudio(part.detail)
  }
  loadAudio(megastr:string){
    const megaFileUrl = encodeURIComponent(`${megastr}`);
    this.videoUrl.set(`${environment.keyobUrl}stream/audio?url=${megaFileUrl}`)
    console.log(megaFileUrl)
    console.log(`${environment.keyobUrl}stream/audio?url=${megaFileUrl}`)
  }

  onInputChange(input: any) {
    console.log(input.target.value)
  }

  onSearchSelected(input: any) {
    console.log(input.value)
    this.filterTitles(input.value);
  }
  filterTitles(input: string) {
    const filteredTitles: { [key: string]: any } = {};
    Object.keys(dataAudio).forEach((title) => {
      if (title.replace(/-/g, '').toLowerCase().includes(input.replace(/ /g, '').toLowerCase())) {
        filteredTitles[title] = dataAudio[title];
      }
    });
    this.subtitles = Object.values(filteredTitles)
    console.log(Object.values(filteredTitles));
  }
  clearInput(){
    this.selected =''
  }
}
