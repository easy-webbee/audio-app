import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { File } from 'megajs';
@Injectable({
  providedIn: 'root'
})
export class AudioService {

  constructor(private http: HttpClient) {}

  getData() {
    return this.http.get('https://smarttoy-c8fd4.firebaseio.com/audio.json');
  }

  async getText(token: string): Promise<string> {
    const url = `https://mega.nz/file/${token}`;
  
    const file = File.fromURL(url);
  
    const data = await file.downloadBuffer({});
  
    return data.toString('utf-8');
  }
}
