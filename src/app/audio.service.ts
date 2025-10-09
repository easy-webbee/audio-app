import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  constructor(private http: HttpClient) {}

  getData() {
    return this.http.get('https://smarttoy-c8fd4.firebaseio.com/audio.json');
  }
}