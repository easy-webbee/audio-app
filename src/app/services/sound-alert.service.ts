import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoundAlertService {

  playSound(filePath: string): void {
    const audio = new Audio(filePath);

    audio.volume = 0.5;

    audio.play().catch(err => {
      console.warn('Unable to play sound:', err);
    });
  }

  playAlert(soundName: string = 'bullish.mp3'): void {
    // this.playSound(`./assets/${soundName}`);
  }
}
/**
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoundAlertService {

  private audio?: HTMLAudioElement;

  playSound(filePath: string): void {

    this.audio?.pause();

    this.audio = new Audio(filePath);
    this.audio.volume = 0.5;

    this.audio.play().catch(err => {
      console.warn('Unable to play sound:', err);
    });
  }

  playAlert(soundName: string = 'bullish.mp3'): void {
    this.playSound(`./assets/${soundName}`);
  }
}
 */