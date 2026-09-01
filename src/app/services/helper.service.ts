import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

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
