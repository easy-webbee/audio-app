import { Injectable } from '@angular/core';
import { File } from 'megajs';

@Injectable({ providedIn: 'root' })
export class MegaPlayerService {
  async getVideoBlobUrl(megaUrl: string): Promise<string> {
    const file = File.fromURL(megaUrl);
    await file.loadAttributes();

    // ✅ Pass an empty options object to satisfy TypeScript
    const data = await file.downloadBuffer({});

    // ✅ Create an object URL from the downloaded binary data
    return URL.createObjectURL(new Blob([data]));
  }
}
