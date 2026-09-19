import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface MessagePart {
  type: 'text' | 'bold' | 'link' | 'iframe' | 'image';
  text: string;
  url?: string;
  safeUrl?: SafeResourceUrl;

  // Image loading state
  imageLoading?: boolean;
}

export interface FormattedMessage {
  parts: MessagePart[];
  borderClass: 'sell' | 'buy' | '';
}
@Pipe({
  name: 'messageFormat',
  standalone: true,
})
export class MessageFormatPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(message: string): FormattedMessage {
    const parts: MessagePart[] = [];

    const regex = /(\*[^*]+\*(?:[ \t]+\*[^*]+\*)*|<[^>]+>)/g;

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(message)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          text: message.substring(lastIndex, match.index),
        });
      }

      const value = match[0];

      if (value.startsWith('*') && value.endsWith('*')) {
        parts.push({
          type: 'bold',
          text: value.replace(/\*/g, '').replace(/\s+/g, ' ').trim(),
        });
      } else if (value.startsWith('<') && value.endsWith('>')) {
        const link = value.slice(1, -1);
        const [originalUrl, label] = link.split('|');

        // Replace old Koyeb Slack image URL with Vercel URL
        const url = this.replaceSlackImageUrl(originalUrl);

        if (label === 'prodUrl' && this.isAllowedIframeUrl(url)) {
          parts.push({
            type: 'link',
            text: label,
            url,
          });

          parts.push({
            type: 'iframe',
            text: label,
            url,
            safeUrl: this.sanitizer.bypassSecurityTrustResourceUrl(url),
          });
        } else if (label?.toLowerCase().includes('image')) {
          parts.push({
            type: 'link',
            text: label,
            url,
          });
          parts.push({
            type: 'image',
            text: label || url,
            url,
            imageLoading: true,
          });
        } else if (url !== 'null') {
          parts.push({
            type: 'link',
            text: label || url,
            url,
          });
        }
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < message.length) {
      parts.push({
        type: 'text',
        text: message.substring(lastIndex),
      });
    }
    const textall = parts
      .filter((item) => item.type === 'text' || item.type === 'bold')
      .map((item) => item.text)
      .join('');

    const borderClass = textall.toUpperCase().includes('BUY_KEY')
      ? 'buy'
      : textall.toUpperCase().includes('SELL_KEY')
      ? 'sell'
      : '';
    return {
      parts,
      borderClass,
    };
  }

  private isAllowedIframeUrl(url: string): boolean {
    return url.startsWith('https://stockmarkets000.web.app/capture-target/');
  }

  private replaceSlackImageUrl(url: string): string {
    return url.replace(
      'https://nestjs-api.koyeb.app/slack/slack-image/',
      'https://my-top-nest.vercel.app/slack/slack-image/'
    );
  }
}
