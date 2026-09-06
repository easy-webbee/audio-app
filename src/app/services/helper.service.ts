import { Injectable, signal } from '@angular/core';
import { Message } from '../models/message.model';
import * as Timer from '../models/compareTime';
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

  checktimeMinutesEST(ticker: string, date:any, time: number) {
    const isWithinRange = Timer.checkIfWithin5MinutesEST(date, time);
    if (isWithinRange) {
      console.log(ticker, `✅ Within ±${time} minutes of EST time`,isWithinRange);
      // check one
      return true;
    } else {
      console.log(ticker, `❌ Outside  ±${time} minutes of EST time: `, isWithinRange,date);
      return false;
    }
  }

  checktimeMinutesCST(ticker: string, date:any, time: number) {
    const isWithinRange = Timer.checkIfWithin5MinutesCST(date, time);
    if (isWithinRange) {
      console.log(ticker, `✅ Within ±${time} minutes of CST time`,isWithinRange);
      // check one
      return true;
    } else {
      console.log(ticker, `❌ Outside  ±${time} minutes of CST time: `, isWithinRange,date);
      return false;
    }
  }
}
