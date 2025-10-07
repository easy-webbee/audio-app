import { Component, ElementRef, ViewChild ,ViewChildren, QueryList} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
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
  imports: [
    RouterOutlet,
    CommonModule,
    TypeaheadModule,
    FormsModule,
    ReplaceUSPipe,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'audio-app';
  audioTitles: any;
  selected: any;
  constructor(private titleService: Title) {}

  @ViewChild('audio', { static: true }) audioRef!: ElementRef<HTMLAudioElement>;
  @ViewChildren('audioPlayer') audioPlayers!: QueryList<ElementRef<HTMLAudioElement>>;

  ngOnInit() {
    this.audioTitles = Object.keys(dataAudio);
    // const megaFileUrl = encodeURIComponent(
    //   'https://mega.nz/file/oTgiCKib#M2TyXr8cBTJzUI1oFyyZ9L92Of0hRv5VxbDvOBncGbs'
    // );
    // this.videoUrl2 = `${environment.keyobUrl}mega/stream?url=${megaFileUrl}`;
  }

  playAudio() {
    this.audioRef.nativeElement.src = this.videoUrl();
    this.audioRef.nativeElement.play();
  }
  activeIndex: { [bookIndex: number]: number | null } = {};
  videoUrl = signal('');
  videoUrl2: any;
  books = Object.values(dataAudio);
  toggleExpand(book: any) {
    book.expanded = !book.expanded;
  }
  subtitles: any;
  // onSubClick(bookIndex: number, partIndex: number, part: any) {
  //   console.log(`Book #${bookIndex + 1}, Part #${partIndex + 1}: ${part.detail}`);
  //   this.activeIndex[bookIndex] =
  //     this.activeIndex[bookIndex] === partIndex ? null : partIndex;
  //   console.log(part)
  //   this.loadAudio(part.detail)
  // }
  loadAudio(megastr: any) {
    this.videoUrl.set('');
    const currentTitle = this.titleService.getTitle()
    this.titleService.setTitle(currentTitle + ' ' + megastr.label)
    const megaFileUrl = encodeURIComponent(`${megastr.detail}`);
    this.videoUrl.set(`${environment.keyobUrl}stream/audio?url=${megaFileUrl}`);
  }

  onInputChange(input: any) {
    console.log(input.target.value);
  }

  onSearchSelected(input: any) {
    this.subtitles = [];
    this.filterTitles(input.value);
  }
  filterTitles(input: string) {
    this.titleService.setTitle(this.selected.replace(/-/g, ''));
    this.show = false;
    this.videoUrl.set('');
    this.activeIndex = {};
    const filteredTitles: { [key: string]: any } = {};
    Object.keys(dataAudio).forEach((title) => {
      if (
        title
          .replace(/-/g, '')
          .toLowerCase()
          .includes(input.replace(/ /g, '').toLowerCase())
      ) {
        filteredTitles[title] = dataAudio[title];
      }
    });
    this.subtitles = Object.values(filteredTitles);
  }
  clearInput() {
    this.selected = '';
    this.show = true;
    this.subtitles = [];
    this.videoUrl.set('');
  }
  show: boolean = true;
  getBook(book: string) {
    this.selected = book;
    this.filterTitles(book);
  }
  get displayAudioTitles() {
    return this.audioTitles.map((t: string) => t.replace(/_/g, ' '));
  }
  currentBookIndex: number | null = null;
  currentPartIndex: number | null = null;

  onSubClick(bookIndex: number, partIndex: number, part: any) {
    this.currentBookIndex = bookIndex;
    this.currentPartIndex = partIndex;
    this.activeIndex[bookIndex] = partIndex;
    this.loadAudio(part);
  
    setTimeout(() => {
      const audioElement = document.querySelector('audio') as HTMLAudioElement;
      if (!audioElement) return;
  
      // Set up media session metadata
      this.setupMediaSession(part, audioElement);
  
      // Wait until the audio is ready to play
      audioElement.addEventListener(
        'canplay',
        () => {
          audioElement.play().catch(err => console.warn('Auto-play blocked:', err));
        },
        { once: true } // only fire once
      );
    }, 500);
  }
  
  setupMediaSession(part: any, audioElement: HTMLAudioElement) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: part.label || 'Unknown title',
        artist: 'audio app',
        album: 'Audio Collection',
        // artwork: [
        //   { src: '/assets/icon-192.png', sizes: '192x192', type: 'image/png' },
        //   { src: '/assets/icon-512.png', sizes: '512x512', type: 'image/png' },
        // ],
      });
  
      navigator.mediaSession.setActionHandler('play', () => {
        audioElement.play();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        audioElement.pause();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        this.playPrev(this.currentBookIndex!);
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        this.playNext(this.currentBookIndex!);
      });
    }
  }
  
  // Auto next when audio ends
  onAudioEnded(bookIndex: number, partIndex: number) {
    const book = this.subtitles[bookIndex];
    if (!book || !book.parts) return;

    const nextIndex = partIndex + 1;
    if (nextIndex < book.parts.length) {
      const nextPart = book.parts[nextIndex];
      this.onSubClick(bookIndex, nextIndex, nextPart);
    } else {
      console.log('End of this book reached!');
    }
  }

  playNext(bookIndex: number) {
    if (this.currentBookIndex === null || this.currentPartIndex === null) return;
  
    const book = this.subtitles[this.currentBookIndex];
    const nextIndex = this.currentPartIndex + 1;
  
    if (book && nextIndex < book.parts.length) {
      const nextPart = book.parts[nextIndex];
      this.onSubClick(this.currentBookIndex, nextIndex, nextPart);
  
      // auto-play after loading
      setTimeout(() => {
        const audioElement = document.querySelector('audio') as HTMLAudioElement;
        if (audioElement) {
          audioElement.src = this.videoUrl();
          audioElement.play().catch(err => console.warn('Auto-play blocked:', err));
        }
      }, 400);
    }
  }
  
  playPrev(bookIndex: number) {
    if (this.currentBookIndex === null || this.currentPartIndex === null) return;
  
    const book = this.subtitles[this.currentBookIndex];
    const prevIndex = this.currentPartIndex - 1;
  
    if (book && prevIndex >= 0) {
      const prevPart = book.parts[prevIndex];
      this.onSubClick(this.currentBookIndex, prevIndex, prevPart);
  
      // auto-play after loading
      setTimeout(() => {
        const audioElement = document.querySelector('audio') as HTMLAudioElement;
        if (audioElement) {
          audioElement.src = this.videoUrl();
          audioElement.play().catch(err => console.warn('Auto-play blocked:', err));
        }
      }, 400);
    }
  }
}
