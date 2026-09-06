import { Injectable, signal } from '@angular/core';
import { Message } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class HelperService {
  unreadCounts = signal<Message[]>([]);

  copied = false;
  copyText(text: any): void {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 2000); // Change back after 2 seconds
      })
      .catch((err) => {
        alert('Failed to copy: ' + text);
      });
  }
}
