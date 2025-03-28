import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';

import { PublicationListComponent } from './publication-list/publication-list.component';

@NgModule({
  imports: [
    HttpClientModule,
    BrowserModule,
    FormsModule
  ],
  providers: [ ],
  declarations: [
    AppComponent,
    PublicationListComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
