import { Routes } from '@angular/router';
import { PublicationListComponent } from './publication-list/publication-list.component';

export const routes: Routes = [
  { path: 'list', component: PublicationListComponent },
  { path: '', redirectTo: '/list', pathMatch: 'full' },
];
