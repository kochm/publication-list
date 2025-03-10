import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Publication } from './publication';

@Injectable({ providedIn: 'root' })
export class PublicationService {


  constructor(
    public http: HttpClient) { }

  /*
   * Get publication data from different types of sources - 
   *    orcid-xxxxxx
   *    athene-forschung-xxxxx,query
   *    otherwise URL to json file
   * return an observable that can be subscribed to -
   * the calling service will later (in subscribe) call getPublicationsFromData to retrieve an
   * array of Publication objects from the returned data
   */
  getPublicationData(source: string): Observable<any> {
    console.log("fetch publication data from "+source);
    if (source.startsWith("athene-forschung-")) {
      var id = source.substring(17);
      var query = '';
      var queryindex = id.indexOf(",");
      if (queryindex > 0) {
        query = id.substring(queryindex+1);
        id = id.substring(0, queryindex);
      }
      console.log("fetching from AtheneForschung "+id+" q="+query);
      var url = "https://athene-forschung.rz.unibw-muenchen.de/services/export/node/"+id+"/allchildren?format=json&attrspec=all";
      if (query) { url = url + "&q=" + query; }
      return this.http.get(url)
      .pipe(
        tap(data => console.log(data)),
        catchError(this.handleError<Publication[]>('getPublications', []))
       );
    } else if (source.startsWith("orcid-")) {
      console.log("fetching from ORCID");
      const httpHeaders: HttpHeaders = new HttpHeaders({
        Accept: 'application/json'
      });
      var id = source.substring(6);
      var url = "https://pub.orcid.org/v3.0/"+id+"/works/";
      return this.http.get(url, { headers: httpHeaders })
      .pipe(
        tap(data => console.log(data)),
        catchError(this.handleError<Publication[]>('getPublications', []))
       );
    } 
    // just an url ...
    console.log("fetching from url");
    var url = source;
    return this.http.get<Publication[]>(url)
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
      console.log("${operation} failed: ${error.message}");
      return of(result as T);
    };
  }

  /*
   * Parse data retrieved from source to internal data format
   */
  public getPublicationsFromData(source: string, data: any) : Publication[] {
    console.log("get publication data from "+source);

    // convert data returned from AtheneForschung server
    if (source.startsWith("athene-forschung-")) {
      var result : Publication[] = [];
      console.log("retrieved "+data.nodelist_count+" elements (max: "+data.nodelist_limit+")");
      for (const item of data.nodelist) {

        var pub: Publication = new Publication(item[0].id);

        if (item[0].attributes.year) {
          pub.year = Number((item[0].attributes.year as string).substring(0,4)); 
        } else if (item[0].attributes['year-month']) {
          pub.year = Number((item[0].attributes['year-month'] as string).substring(0,4));
        } else { console.log(item[0].attributes); }
        pub.title = item[0].attributes.title;
        if (item[0].attributes.author) {
          pub.author = item[0].attributes.author.split(';');
        }
        pub.abstract = item[0].attributes.abstract;
        pub.doi = item[0].attributes.doi;
        pub.url = item[0].attributes.url;
        pub.booktitle = item[0].attributes.title_publ;
        if (!pub.booktitle) {
          pub.booktitle = item[0].attributes.title_conf_publ;
        }

        const type = item[0].attributes.typ;
        var bibtextype = "misc";
        if (!type) {
          // anything to do for missing type information?
        } else if (type.startsWith("Zeitschriftenartikel")) {
          bibtextype = "article";
          pub.journal = item[0].attributes.journal;
          if (!pub.journal) {
            pub.journal = item[0].attributes.title_publ;
          }
        } else if (type.startsWith("Konferenzbeitrag")) {
          bibtextype = "inconference";
        } else if (type.startsWith("Sammelbandbeitrag")) {
          bibtextype = "incollection";
        } else if (type.startsWith("Monografie")) {
          bibtextype = "book";
        } else if (type.startsWith("Patent")) {
          bibtextype = "patent";
          if (item[0].attributes.inventor) {
            pub.author = item[0].attributes.inventor.split(';');
          }
        }

        // TBD: convert missing attributes
        // attributes in response: issue, volume, journal, pages, place_publ, publisher, typ, title_publ (=series, journal), title_conf_publ

        result.push(pub);
      }
      return result;
    } 

    // convert data returned from ORCID server
    if (source.startsWith("orcid-")) {
      var result : Publication[] = [];
      console.log("retrieved "+data.group.length+" elements");
      for (const item of data.group) {

        var pub: Publication = new Publication(item['work-summary'][0]['put-code']);

        pub.title = item['work-summary'][0].title.title.value;

        if (item['work-summary'][0]['publication-date']) {
          pub.year = Number(item['work-summary'][0]['publication-date'].year.value); 
        }

        if (item['work-summary'][0]['external-ids']) {
          pub.doi = item['work-summary'][0]['external-ids']['external-id'][0]['external-id-value'];
        }

        const type = item['work-summary'][0].type;
        var bibtextype = "misc";
        if (!type) {
          // anything to do for missing type information?
        } else if (type.startsWith("journal-article")) {
          bibtextype = "article";
          pub.journal = item['work-summary'][0]['journal-title'].value;
        } else if (type.startsWith("conference-paper")) {
          bibtextype = "inconference";
        } else if (type.startsWith("book-chapter")) {
          bibtextype = "incollection";
        } else if (type.startsWith("report")) {
          bibtextype = "report";
        } 
        result.push(pub);
      }
      return result;
    }

    // just an url ... no conversion needed
    console.log("converting from url - no conversion needed");
    return data as Publication[];
  }

}
