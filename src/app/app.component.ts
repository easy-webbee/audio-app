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

  currentSubtitle = '';
  parsedSubtitles: { time: number; text: string }[] = [];

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
    this.audiodata.getData().subscribe(async (data:Record<string, any>)=>{
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
           await this.onSubClick(0,+urlParkName,partDe)
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
   console.log(this.pdfRawUrl )
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

  async onSubClick(bookIndex: number, partIndex: number, part: any) {
    this.locationAngular.go(`/${this.selected}/${partIndex}`);
    this.currentBookIndex = bookIndex;
    this.currentPartIndex = partIndex+1;
    this.activeIndex[bookIndex] = partIndex;
    this.currentSubtitle = '';

    try {
      const text = await this.audiodata.getText(part.text);
  
      console.log('Transcript:', text);
  
      this.parseSubtitles(text);
    } catch (error) {
      this.parsedSubtitles =[]
      console.error('Failed to load transcript:', error);
    }
  
    this.loadAudio(part);
    console.log('Selected part:', part);
    setTimeout(() => {
      const audioElement = document.querySelector('audio') as HTMLAudioElement;
      if (!audioElement) return;
  
      // Set up media session metadata
      this.setupMediaSession(part, audioElement);

      audioElement.ontimeupdate = () => {
        this.onAudioTimeUpdate(audioElement);
      };
  
      // Wait until the audio is ready to play
      audioElement.addEventListener(
        'canplay',
        () => {
          audioElement.play().catch(err => console.warn('Auto-play blocked:', err));
          this.isAllPaused = false
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
        this.isAllPaused = false
        audioElement.play();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        audioElement.pause();
        this.isAllPaused = true
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
  async onAudioEnded(bookIndex: number, partIndex: number) {
    const book = this.subtitles[bookIndex];
    if (!book || !book.parts) return;

    const nextIndex = partIndex + 1;
    if (nextIndex < book.parts.length) {
      const nextPart = book.parts[nextIndex];
      await this.onSubClick(bookIndex, nextIndex, nextPart);
        // auto-play after loading
      setTimeout(() => {
        const audioElement = document.querySelector('audio') as HTMLAudioElement;
        if (audioElement) {
          audioElement.src = this.videoUrl;
          audioElement.play().catch(err => console.warn('Auto-play blocked:', err));
          this.isAllPaused = false
        }
      }, 400);
    } else {
      console.log('End of this book reached!');
    }
  }

  async playNext(bookIndex: number) {
    if (this.currentBookIndex === null || this.currentPartIndex === null) return;
  
    const book = this.subtitles[this.currentBookIndex];
    const nextIndex = this.currentPartIndex ;
  
    if (book && nextIndex < book.parts.length) {
      const nextPart = book.parts[nextIndex];
      await this.onSubClick(this.currentBookIndex, nextIndex, nextPart);
  
      // auto-play after loading
      setTimeout(() => {
        const audioElement = document.querySelector('audio') as HTMLAudioElement;
        if (audioElement) {
          audioElement.src = this.videoUrl;
          audioElement.play().catch(err => console.warn('Auto-play blocked:', err));
          this.isAllPaused = false
        }
      }, 400);
    }else{
      console.log(book)
      console.log(nextIndex)
    }
  }
  
  async playPrev(bookIndex: number) {
    if (this.currentBookIndex === null || this.currentPartIndex === null) return;
  
    const book = this.subtitles[this.currentBookIndex];
    const prevIndex = this.currentPartIndex - 2;
  
    if (book && prevIndex >= 0) {
      const prevPart = book.parts[prevIndex];
      await this.onSubClick(this.currentBookIndex, prevIndex, prevPart);
  
      // auto-play after loading
      setTimeout(() => {
        const audioElement = document.querySelector('audio') as HTMLAudioElement;
        if (audioElement) {
          audioElement.src = this.videoUrl;
          audioElement.play().catch(err => console.warn('Auto-play blocked:', err));
          this.isAllPaused = false
        }
      }, 400);
    }
  }

  parseSubtitles(text: string) {
    console.log(text)
    if (!text) {
      this.parsedSubtitles = [];
      return;
    } 
    // else{
    //   return
    // }


    this.parsedSubtitles = text
      .split('\n')
      .map(line => {
        const match = line.match(
          /^\[(\d{2}):(\d{2}):(\d{2})\]\s*(.*)$/
        );
  
        if (!match) return null;
  
        const hours = Number(match[1]);
        const minutes = Number(match[2]);
        const seconds = Number(match[3]);
  
        return {
          time: hours * 3600 + minutes * 60 + seconds,
          text: match[4],
        };
      })
      .filter((item): item is { time: number; text: string } => item !== null);
  }

  onAudioTimeUpdate(audio: HTMLAudioElement) {
    const currentTime = audio.currentTime;
  
    let current = '';
  
    for (let i = 0; i < this.parsedSubtitles.length; i++) {
      if (this.parsedSubtitles[i].time <= currentTime) {
        current = this.parsedSubtitles[i].text;
      } else {
        break;
      }
    }
  
    this.currentSubtitle = current;
  }

  isAllPaused = false;

  toggleAllAudio(): void {
    this.isAllPaused = !this.isAllPaused;
  
    this.audioPlayers.forEach((audioPlayer) => {
      const audioElement = audioPlayer.nativeElement;
  
      if (this.isAllPaused) {
        audioElement.pause();
      } else {
        audioElement.play();
      }
    });
  }

  onAudioPlay(bookIndex: number, audioIndex: number): void {
    console.log('▶️ PLAY', {
      bookIndex,
      audioIndex
    });
    this.isAllPaused = false
  }
  
  onAudioPause(bookIndex: number, audioIndex: number): void {
    console.log('⏸️ PAUSE', {
      bookIndex,
      audioIndex
    });
    this.isAllPaused = true
  }
}