import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
// Import Firebase App dependencies
import { initializeApp, provideFirebaseApp, getApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { initializeFirestore, } from '@angular/fire/firestore';
import { routes } from './app.routes';
import { environment } from '../environments/environment';


export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),   

    provideFirebaseApp(() =>
    initializeApp(environment.firebase)
  ),

  provideFirestore(() => initializeFirestore(initializeApp(environment.firebase), {}))
]
};
