import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule, } from '@angular/common';
import { environment } from '../environments/environment';
import { signal } from '@angular/core';
import { dataAudio } from './data';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { FormsModule } from '@angular/forms';
import { ReplaceUSPipe } from './replace-us.pipe';
import { Title } from '@angular/platform-browser';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, TypeaheadModule, FormsModule, ReplaceUSPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'audio-app';
  audioTitles:any;
  selected: any;
  constructor(     private titleService: Title, ) {}

  @ViewChild('audio', { static: true }) audioRef!: ElementRef<HTMLAudioElement>;

  ngOnInit() {
    console.log(Object.keys(dataAudio))
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
  }

  onInputChange(input: any) {
    console.log(input.target.value)
  }

  onSearchSelected(input: any) {
    this.subtitles = []
    this.filterTitles(input.value);
  }
  filterTitles(input: string) {
    this.titleService.setTitle(this.selected.replace(/-/g, ''))
    this.show = false
    this.videoUrl.set('')
    this.activeIndex ={}
    const filteredTitles: { [key: string]: any } = {};
    Object.keys(dataAudio).forEach((title) => {
      console.log(title)
      if (title.replace(/-/g, '').toLowerCase().includes(input.replace(/ /g, '').toLowerCase())) {
        filteredTitles[title] = dataAudio[title];
      }
    });
    console.log(filteredTitles)
    this.subtitles = Object.values(filteredTitles)
    console.log(Object.values(filteredTitles));
  }
  clearInput(){
    this.selected =''
    this.show = true
    this.subtitles = []
  }
  show:boolean = true
  getBook(book:string){
    this.selected = book
    this.filterTitles(book);
  }
  get displayAudioTitles() {
    return this.audioTitles.map((t: string) => t.replace(/_/g, ' '));
  }
}
