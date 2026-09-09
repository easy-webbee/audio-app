import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';

import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-lazy-iframe-ipad',
  standalone: true,
  template: `
    <div
      #container
      class="iframe-container"
      [class.fullscreen]="fullscreen"
      (click)="toggleZoom($event)"
    >
      @if (shouldLoad && iframeUrl) {
      <div
        class="iframe-wrapper"
        [style.transform]="
          'translate(' + imageX + 'px, ' + imageY + 'px) scale(' + scale + ')'
        "
        [class.zoomed]="zoomed"
        (mousedown)="startDrag($event)"
        (mousemove)="drag($event)"
        (mouseup)="stopDrag()"
        (mouseleave)="stopDrag()"
      >
        <iframe [src]="iframeUrl" class="stock-iframe" frameborder="0"></iframe>
      </div>
      } @if (fullscreen) {
      <button
        type="button"
        class="close-button"
        (click)="closeFullscreen($event)"
      >
        ×
      </button>
      }
    </div>
  `,
  styles: [
    `
      .iframe-container {
        width: 800px;
        height: 370px;

        overflow: hidden;

        position: relative;

        cursor: zoom-in;
      }

      .iframe-container.fullscreen {
        position: fixed;
        inset: 0;

        width: 100vw;
        height: 100vh;

        z-index: 99999;

        background: rgba(0, 0, 0, 0.88);

        display: flex;
        align-items: center;
        justify-content: center;

        cursor: zoom-out;
      }

      .iframe-wrapper {
        width: 1920px;
        height: 1000px;

        transform-origin: top left;

        transition: transform 0.25s ease;

        flex-shrink: 0;
      }

      .iframe-wrapper.zoomed {
        transition: none;
        cursor: grab;
      }

      .iframe-wrapper.zoomed:active {
        cursor: grabbing;
      }

      .stock-iframe {
        width: 1920px;
        height: 1000px;

        border: 0;

        display: block;

        pointer-events: none;
      }

      .fullscreen .iframe-wrapper {
        transform-origin: center center;
      }

      .close-button {
        position: fixed;

        top: 20px;
        right: 25px;

        width: 45px;
        height: 45px;

        border: none;
        border-radius: 50%;

        background: white;
        color: #222;

        font-size: 30px;
        line-height: 45px;

        cursor: pointer;

        z-index: 100000;
      }

      .close-button:hover {
        background: #eee;
      }
    `,
  ],
})
export class LazyIframeIpadComponent implements AfterViewInit, OnDestroy {
  @Input() iframeUrl?: SafeResourceUrl;

  @ViewChild('container')
  container!: ElementRef<HTMLDivElement>;

  shouldLoad = false;

  zoomed = false;
  fullscreen = false;

  // Original iframe scale
  scale = 0.33;

  imageX = 0;
  imageY = 0;

  private dragging = false;

  private dragStartX = 0;
  private dragStartY = 0;

  private startX = 0;
  private startY = 0;

  private observer?: IntersectionObserver;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    const element = this.container.nativeElement;

    const scrollContainer = element.closest('.messages');

    this.observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry.isIntersecting) {
          this.shouldLoad = true;

          this.cdr.detectChanges();

          this.observer?.disconnect();
        }
      },
      {
        root: scrollContainer,
        rootMargin: '0px',
        threshold: 0.01,
      }
    );

    this.observer.observe(element);
  }

  toggleZoom(event: MouseEvent): void {
    event.stopPropagation();

    if (this.dragging) {
      return;
    }

    if (!this.fullscreen) {
      // First click:
      // Open iframe fullscreen
      this.fullscreen = true;

      this.zoomed = true;

      // 1920px iframe -> approximately 2x larger
      this.scale = 0.72;

      this.imageX = 0;
      this.imageY = 0;

      document.body.style.overflow = 'hidden';

      return;
    }

    // Second click:
    // Zoom in more
    if (this.scale === 0.72) {
      this.scale = 1;
      return;
    }

    // Third click:
    // Return to original fullscreen size
    this.scale = 0.72;
  }

  startDrag(event: MouseEvent): void {
    if (!this.fullscreen || !this.zoomed) {
      return;
    }

    this.dragging = true;

    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;

    this.startX = this.imageX;
    this.startY = this.imageY;

    event.preventDefault();
    event.stopPropagation();
  }

  drag(event: MouseEvent): void {
    if (!this.dragging) {
      return;
    }

    this.imageX = this.startX + (event.clientX - this.dragStartX);

    this.imageY = this.startY + (event.clientY - this.dragStartY);

    event.preventDefault();
  }

  stopDrag(): void {
    this.dragging = false;
  }

  closeFullscreen(event: MouseEvent): void {
    event.stopPropagation();

    this.fullscreen = false;
    this.zoomed = false;

    this.scale = 0.36;

    this.imageX = 0;
    this.imageY = 0;

    document.body.style.overflow = '';
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();

    document.body.style.overflow = '';
  }
}
