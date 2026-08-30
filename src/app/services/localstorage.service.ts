import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

    setUid(){
     localStorage.setItem('uid', 'n90Q4DYyzQc8Ibv9Xw5xTmT1G5F3');
     return 'n90Q4DYyzQc8Ibv9Xw5xTmT1G5F3'
    }
    getUid(){
        return localStorage.getItem('uid');
    }
}
