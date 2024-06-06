import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Publication } from './publication';

@Injectable({ providedIn: 'root' })
export class PublicationService {

  private publicationsUrl = 
    'https://webtech.cscwlab.de/publist-cscm.json';

  constructor(
    public http: HttpClient) { }

  getPublications(): Observable<Publication[]> {
    this.log('PublicationService: fetched publications');
    return this.http.get<Publication[]>(this.publicationsUrl)
      .pipe(
        tap(publications => console.log(publications)),
        // add index
        map(publications => publications.map((pub,index) => ({...pub, id:index}))),
        catchError(this.handleError<Publication[]>('getPublications', []))
       );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      this.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  private log(message: string) {
    console.log('PublicationService ${message}');
  }

}
