import { Injectable, signal } from '@angular/core';
import { Message } from '../models/message.model';
import * as Timer from '../models/compareTime';
@Injectable({
  providedIn: 'root',
})
export class HelperService {
  unreadCounts = signal<Message[]>([]);
  alertChannelId = signal<any[]>([]);

  copied = false;

  copyText(text: any): void {
    const value = String(text ?? '');
  
    // Modern Clipboard API (requires HTTPS or localhost)
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      navigator.clipboard
        .writeText(value)
        .then(() => {
          this.copied = true;
  
          setTimeout(() => {
            this.copied = false;
          }, 2000);
        })
        .catch((err) => {
          console.error('Clipboard API failed:', err);
          this.copyTextFallback(value);
        });
  
      return;
    }
  
    // HTTP / older browser fallback
    this.copyTextFallback(value);
  }
  
  private copyTextFallback(text: string): void {
    const textarea = document.createElement('textarea');
  
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    textarea.style.opacity = '0';
  
    document.body.appendChild(textarea);
  
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
  
    try {
      const success = document.execCommand('copy');
  
      if (success) {
        this.copied = true;
  
        setTimeout(() => {
          this.copied = false;
        }, 2000);
      } else {
        alert('Failed to copy: ' + text);
      }
    } catch (err) {
      console.error('Copy fallback failed:', err);
      alert('Failed to copy: ' + text);
    } finally {
      document.body.removeChild(textarea);
    }
  }

  checktimeMinutesEST(ticker: string, date: any, time: number) {
    const isWithinRange = Timer.checkIfWithin5MinutesEST(date, time);
    if (isWithinRange) {
      console.log(
        ticker,
        `✅ Within ±${time} minutes of EST time`,
        isWithinRange
      );
      // check one
      return true;
    } else {
      console.log(
        ticker,
        `❌ Outside  ±${time} minutes of EST time: `,
        isWithinRange,
        date
      );
      return false;
    }
  }

  checktimeMinutesCST(ticker: string, date: any, time: number) {
    const isWithinRange = Timer.checkIfWithin5MinutesCST(date, time);
    if (isWithinRange) {
      console.log(
        ticker,
        `✅ Within ±${time} minutes of CST time`,
        isWithinRange
      );
      // check one
      return true;
    } else {
      console.log(
        ticker,
        `❌ Outside  ±${time} minutes of CST time: `,
        isWithinRange,
        date
      );
      return false;
    }
  }
}
