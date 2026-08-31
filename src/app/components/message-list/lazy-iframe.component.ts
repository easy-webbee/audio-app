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
  selector: 'app-lazy-iframe',
  standalone: true,
  template: `
    <div #container class="iframe-container">
      @if (shouldLoad && iframeUrl) {
      <iframe [src]="iframeUrl" class="stock-iframe" frameborder="0"></iframe>
      }
    </div>
  `,
  styles: [
    `
      .iframe-container {
        width: 900px;
        height: 422px;
        overflow: hidden;
      }

      .stock-iframe {
        width: 1920px;
        height: 900px;
        border: 0;
        transform: scale(0.46875);
        transform-origin: top left;
        display: block;
      }
    `,
  ],
})
export class LazyIframeComponent implements AfterViewInit, OnDestroy {
  @Input() iframeUrl?: SafeResourceUrl;

  @ViewChild('container')
  container!: ElementRef<HTMLDivElement>;

  shouldLoad = false;

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

          // IntersectionObserver runs outside Angular
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

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
