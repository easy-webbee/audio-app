import { Component, ElementRef, ViewChild ,ViewChildren, QueryList} from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../environments/environment';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { FormsModule } from '@angular/forms';
import { ReplaceUSPipe } from './replace-us.pipe';
import { Title } from '@angular/platform-browser';
import { AudioService } from './audio.service';
import { Location } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    TypeaheadModule,
    FormsModule,
    ReplaceUSPipe,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  @ViewChildren('audioPlayer') audioPlayers!: QueryList<ElementRef<HTMLAudioElement>>;
  activeIndex: { [bookIndex: number]: number | null } = {};
  videoUrl :any;
  pdfUrl!: SafeResourceUrl;
  pdfRawUrl: string = '';
  subtitles: any;
  audioTitles: any;
  dataAudio:any
  books:any
  selected: any ='';
  show: boolean = true;
  currentBookIndex: number | null = null;
  currentPartIndex: number | null = null;

  constructor(private titleService: Title, private audiodata: AudioService,private locationAngular: Location, private sanitizer: DomSanitizer) {
  }
  get isMobile(): boolean {
    return window.innerWidth < 768;
  }
  
  get isIOS(): boolean {
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
  }
  shouldOpenPdfInNewTab(): boolean {
    return this.isIOS || this.isMobile;
  }
  ngOnInit() {
    const urlPath = this.locationAngular.path().slice(1)
    const urlbookName = this.locationAngular.path().split('/')[1];
    const urlParkName = this.locationAngular.path().split('/')[2];
    console.log(urlbookName,urlParkName)
    this.audiodata.getData().subscribe((data:Record<string, any>)=>{
      this.dataAudio = data
      this.audioTitles = Object.keys(data);
      this.books = Object.values(this.dataAudio);
      const matchName = this.audioTitles.includes(urlbookName)
      if(matchName){
        this.selected = urlbookName
        this.filterTitles(urlbookName)
        if(urlParkName){
          const bookdata = data[`${urlbookName}`]
          const partDe = bookdata.parts[urlParkName]
          if(partDe){
            this.onSubClick(0,+urlParkName,partDe)
          }
        }
      }
    })
  }

  toggleExpand(book: any) {
    book.expanded = !book.expanded;
  }

  loadAudio(megastr: any) {
    this.videoUrl= null;
    this.titleService.setTitle(this.selected.replace(/-/g, '')+ ' ' + megastr.label);
    const megaFileUrl = encodeURIComponent(`${megastr.detail}`);
    this.videoUrl = `${environment.keyobUrl}stream/audio?url=${megaFileUrl}`
  }
  loadPdf(bookPdf: string) {
    if (!bookPdf) return;
  
    const raw = bookPdf;
  
   this.pdfRawUrl =`${environment.keyobUrl}stream/pdf?url=` + encodeURIComponent(raw);
  
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl( this.pdfRawUrl );
  
  }
  onInputChange(input: any) {
    console.log(input.target.value);
  }

  onSearchSelected(input: any) {
    this.subtitles = [];
    this.filterTitles(input.value);
    this.locationAngular.go(`/${this.selected}`);
    console.log('Selected search input:', input.value);
    // this.loadPdf(this.books.find((b: any) => b.title === this.selected)?.bookpdf || '');
  }
  
  filterTitles(input: string) {
    this.titleService.setTitle(this.selected.replace(/-/g, ''));
    this.show = false;
    this.videoUrl = null
    this.activeIndex = {};
    const filteredTitles: { [key: string]: any } = {};
    Object.keys(this.dataAudio).forEach((title) => {
      if (
        title
          .replace(/-/g, '')
          .toLowerCase()
          .includes(input.replace(/ /g, '').toLowerCase())
      ) {
        filteredTitles[title] = this.dataAudio[title];
      }
    });
    this.subtitles = Object.values(filteredTitles);
    this.loadPdf(this.subtitles[0]?.bookpdf);
  }

  clearInput() {
    this.selected = '';
    this.show = true;
    this.subtitles = [];
    this.videoUrl = null
    this.locationAngular.go(`/${this.selected}`);
  }

  getBook(book: string) {
    this.selected = book;
    this.filterTitles(book);
    this.locationAngular.go(`/${book}`);
    console.log('Selected book:', book);
  }

  get displayAudioTitles() {
    return this.audioTitles.map((t: string) => t.replace(/_/g, ' '));
  }

  onSubClick(bookIndex: number, partIndex: number, part: any) {
    this.locationAngular.go(`/${this.selected}/${partIndex}`);
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
        // auto-play after loading
      setTimeout(() => {
        const audioElement = document.querySelector('audio') as HTMLAudioElement;
        if (audioElement) {
          audioElement.src = this.videoUrl;
          audioElement.play().catch(err => console.warn('Auto-play blocked:', err));
        }
      }, 400);
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
          audioElement.src = this.videoUrl;
          audioElement.play().catch(err => console.warn('Auto-play blocked:', err));
        }
      }, 400);
    }else{
      console.log(book)
      console.log(nextIndex)
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
          audioElement.src = this.videoUrl;
          audioElement.play().catch(err => console.warn('Auto-play blocked:', err));
        }
      }, 400);
    }
  }
}