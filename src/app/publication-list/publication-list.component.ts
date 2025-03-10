import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

import { Publication } from '../publication';
import { PublicationService } from '../publication.service';

@Component({
  selector: 'app-publication-list',
  standalone: true,
  imports: [ NgFor, NgIf, FormsModule ],
  templateUrl: './publication-list.component.html',
  styleUrl: './publication-list.component.css'
})

export class PublicationListComponent implements OnInit {

  // source
  source: string;
  sourceTitle: string;

  // all publications
  publications: Publication[];
  // filtered publications
  filteredPublications: Publication[];

  // attribute values for the different facets
  facetsAuthor: string[] = [];
  facetsAuthorCount: Map<string, number> = new Map<string, number>();
  facetsType: string[] = [];
  facetsTypeCount: Map<string, number> = new Map<string, number>();
  facetsKeyword: string[] = [];
  facetsKeywordCount: Map<string, number> = new Map<string, number>();
  facetsYear: number[] = [];
  facetsYearCount: Map<number, number> = new Map<number, number>();

  constructor (private publicationService: PublicationService, private route: ActivatedRoute) {
    route.queryParams.subscribe(
      data => { 
        console.log("queryParams in constructor"); 
        console.log(data); 
        this.source = this.route.snapshot.queryParamMap.get('source');
        this.sourceTitle = this.route.snapshot.queryParamMap.get('sourcetitle');
	// default source from assets
	if (!this.source) {
          this.source = "https://webtech.cscwlab.de/publist-cscm.json";
	  this.sourceTitle = "Publications from HCI group at UniBwM";
          this.source = "athene-forschung-92555,chair=Koch,%20Michael";
	  this.sourceTitle = "Publications from INF2 at UniBwM";
          this.source = "orcid-0000-0002-9694-6946";
	  this.sourceTitle = "Publications from Michael Koch via ORCID";
        }
        console.log("source in OnInit: "+this.source);
        if (!this.sourceTitle) {
          this.sourceTitle = this.source;
        }
        this.getPublications();
      });
  }

  ngOnInit() {
  }

  // load publications from Web
  getPublications(): void {
    this.publicationService.getPublicationData(this.source)
      .subscribe(data => { 
         this.publications = this.publicationService.getPublicationsFromData(this.source, data);
	 console.log(this.publications);
         this.updateFilter(); 
         this.filteredPublications.sort((a, b) => b.year - a.year);
       });
  }

  public formatPublicationAuthors(authors : string[]): string {
    var result = "";
    if (!authors) { return result; }
    for (var author of authors) {
      if (result.length > 0) { result = result + ", "; }
      const pos: number = author.indexOf(",");
      if (pos >=0 ) {
        result = result + author.substring(0, pos);
      } else {
        result = result + author;
      }
    }
    return result;
  }

  public getPublicationDetails(id): string {
    let result = "no details";
    this.publications.forEach( (pub) => {
      if (pub.id == id) {
        if (pub.citation) { result = pub.citation; }
        let tmps : string = "";
        if (pub.bibtextype == "article") {
          if (tmps.length > 0) {
            tmps = tmps + ", ";
          }
          tmps = tmps + pub.journal;
        } else {
          if (tmps.length > 0) {
            tmps = tmps + ", ";
          }
          tmps = tmps + pub.booktitle 
        }
        if (pub.doi) {
          tmps = tmps + ", " + pub.doi;
        }
        pub.citation = tmps;
        result = tmps;
      }
    });
    return result;
  }

  filterByTitle : string = "";
  filterByAuthor : string = "";
  filterByYear : string = "";
  filterByType : string = "";
  filterByKeyword : string = "";

  updateFilter(): void {
    console.log("updateFilter "+this.filterByTitle+", "+this.filterByYear+", "+this.filterByAuthor+", "+
         this.filterByType+", "+this.filterByKeyword);
    // TBD - use filter function
    if (this.filterByTitle) {
      this.filteredPublications = this.publications.filter(p => p.title.includes(this.filterByTitle));
    } else {
      this.filteredPublications = this.publications.slice();
    }
    if (this.filterByYear) {
      this.filteredPublications = this.filteredPublications.filter(p => p.year === Number(this.filterByYear));
    } else {
      // this.filteredPublications = this.filteredPublications.slice();
    }
    if (this.filterByAuthor) {
      this.filteredPublications = this.filteredPublications.filter(p => p.author ? p.author.includes(this.filterByAuthor) : false);
    } else {
      this.filteredPublications = this.filteredPublications.slice();
    }
    if (this.filterByType) {
      this.filteredPublications = this.filteredPublications.filter(p => p.bibtextype === this.filterByType);
    } else {
      this.filteredPublications = this.filteredPublications.slice();
    }
    if (this.filterByKeyword) {
      this.filteredPublications = this.filteredPublications.filter(p => p.keywords.includes(this.filterByType));
    } else {
      this.filteredPublications = this.filteredPublications.slice();
    }
    // now update facets values
    this.facetsType = [];
    this.facetsTypeCount = new Map<string, number>();
    this.facetsYear = [];
    this.facetsYearCount = new Map<number, number>();
    this.facetsAuthor = [];
    this.facetsAuthorCount = new Map<string, number>();
    this.facetsKeyword = [];
    this.facetsKeywordCount = new Map<string, number>();
    this.filteredPublications.forEach( (pub) => {
        let year:number = pub.year;
        if (this.facetsYearCount.get(year)) {
          this.facetsYearCount.set(year, this.facetsYearCount.get(year)+1);
        } else {
          this.facetsYear.push(year);
          this.facetsYearCount.set(year, 1);
        }
        let type:string = pub.bibtextype;
        if (this.facetsTypeCount.get(type)) {
          this.facetsTypeCount.set(type, this.facetsTypeCount.get(type)+1);
        } else {
          this.facetsType.push(type);
          this.facetsTypeCount.set(type, 1);
        }
        let authors:string[] = pub.author;
        if (authors) {
          authors.forEach( (author) => {
            if (this.facetsAuthorCount.get(author)) {
              this.facetsAuthorCount.set(author, this.facetsAuthorCount.get(author)+1);
            } else {
              this.facetsAuthor.push(author);
              this.facetsAuthorCount.set(author, 1);
            }
          });
        }
        let keywords:string[] = pub.keywords;
        if (keywords) {
          keywords.forEach( (keyword) => {
            if (this.facetsKeywordCount.get(keyword)) {
              this.facetsKeywordCount.set(keyword, this.facetsKeywordCount.get(keyword)+1);
            } else {
              this.facetsKeyword.push(keyword);
              this.facetsKeywordCount.set(keyword, 1);
            }
          });
        }
    });
    this.facetsYear.sort((a, b) => b - a);
    this.facetsType.sort();
    this.facetsAuthor.sort();
    this.facetsKeyword.sort();

    this.facetsAuthorCount = new Map([...this.facetsAuthorCount.entries()].sort((a, b) => b[1] - a[1]));
    this.facetsAuthor = Array.from(this.facetsAuthorCount.keys());
    this.facetsKeywordCount = new Map([...this.facetsKeywordCount.entries()].sort((a, b) => b[1] - a[1]));
    this.facetsKeyword = Array.from(this.facetsKeywordCount.keys());
  }

  public filterBy(nameInput: HTMLInputElement) {
    if (nameInput.value) {
      this.filterByTitle = nameInput.value;
      this.updateFilter();
    }
  }

  // click on checkbox for an author value
  public onCheckboxAuthor(tmps) {
    console.log("onCheckboxAuthor "+tmps);
    if (this.filterByAuthor === tmps) {
      this.filterByAuthor = "";
    } else {
      this.filterByAuthor = tmps;
    }
    this.updateFilter();
  }
  // click on checkbox for a Type value
  public onCheckboxType(tmps) {
    console.log("onCheckboxType "+tmps);
    if (this.filterByType === tmps) {
      this.filterByType = "";
    } else {
      this.filterByType = tmps;
    }
    this.updateFilter();
  }
  // click on checkbox for a keyword value
  public onCheckboxKeyword(tmps) {
    console.log("onCheckboxKeyword "+tmps);
    if (this.filterByKeyword === tmps) {
      this.filterByKeyword = "";
    } else {
      this.filterByKeyword = tmps;
    }
    this.updateFilter();
  }
  // click on checkbox for a year value
  public onCheckboxYear(tmps) {
    console.log("onCheckboxYear "+tmps);
    if (this.filterByYear === tmps) {
      this.filterByYear = "";
    } else {
      this.filterByYear = tmps;
    }
    this.updateFilter();
  }

  public sortPublicationsDesc(): void {
    this.filteredPublications = this.filteredPublications.sort((a, b) => a.title > b.title ? -1 : 1);
  }
  public sortPublicationsAsc(): void {
    this.filteredPublications = this.filteredPublications.sort((a, b) => a.title < b.title ? -1 : 1);
  }


  selectedPublication: Publication;

  onSelect(publication: Publication): void {
    this.selectedPublication = publication;
    console.log('PublicationListComponent: Selected publication id={publication.id}');
  }

}
