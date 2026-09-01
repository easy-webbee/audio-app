import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);

  getCurrentPrice(tickername: string): Observable<any> {
    return this.http.get<any>(`${environment.url}/stock/fh/realtimeprice`, {
      params: {
        stockTicker: tickername,
      },
    });
  }
}
