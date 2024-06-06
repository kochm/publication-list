import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PublicationListComponent } from './publication-list/publication-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ RouterOutlet, PublicationListComponent ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Publication List';
}
