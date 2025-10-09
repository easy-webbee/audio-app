import { Routes } from '@angular/router';
import { AppComponent } from './app.component';

export const routes: Routes = [
    {
        path: ':book',
        component: AppComponent,
    },
    {
        path: ':book/:part',
        component: AppComponent,
    },
];