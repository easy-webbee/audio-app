import { Pipe, PipeTransform, inject } from '@angular/core';
import {
  DomSanitizer,
  SafeResourceUrl
} from '@angular/platform-browser';

export interface MessagePart {
  type: 'text' | 'bold' | 'link' | 'iframe';
  text: string;
  url?: string;
  safeUrl?: SafeResourceUrl;
}

@Pipe({
  name: 'messageFormat',
  standalone: true
})
export class MessageFormatPipe implements PipeTransform {

  private sanitizer = inject(DomSanitizer);

  transform(message: string): MessagePart[] {

    const parts: MessagePart[] = [];

    const regex = /(\*[^*]+\*(?:[ \t]+\*[^*]+\*)*|<[^>]+>)/g;

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(message)) !== null) {

      // Normal text
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          text: message.substring(lastIndex, match.index)
        });
      }

      const value = match[0];

      // *AAL*
      if (value.startsWith('*') && value.endsWith('*')) {

        parts.push({
          type: 'bold',
          text: value
          .replace(/\*/g, '')
          .replace(/\s+/g, ' ')
          .trim()
        });

      }

      // <url|label>
      else if (value.startsWith('<') && value.endsWith('>')) {

        const link = value.slice(1, -1);

        const [url, label] = link.split('|');

        // prodUrl → iframe
        if (label === 'prodUrl'&&
            this.isAllowedIframeUrl(url)) {


          parts.push({
            type: 'link',
            text: label,
            url
          });
          parts.push({
            type: 'iframe',
            text: label,
            url,
            safeUrl: this.sanitizer.bypassSecurityTrustResourceUrl(url)
          });

        } else if(url!=='null'){

          parts.push({
            type: 'link',
            text: label || url,
            url
          });

        }
      }

      lastIndex = regex.lastIndex;
    }

    // Remaining text
    if (lastIndex < message.length) {
      parts.push({
        type: 'text',
        text: message.substring(lastIndex)
      });
    }

    return parts;
  }
  private isAllowedIframeUrl(url: string): boolean {
    return url.startsWith(
      'https://stockmarkets000.web.app/capture-target/'
    );
  }
}