import { Component } from '@angular/core';
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

export class PublicationListComponent {

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

  constructor (private publicationService: PublicationService) {}

  ngOnInit() {
    this.getPublications();
  }

  // load publications from Web
  getPublications(): void {
    this.publicationService.getPublications()
      .subscribe(publications => { 
         this.publications = publications; 
         this.updateFilter(); });
  }

  filterByTitle : string = "";
  filterByYear : string = "";
  filterByType : string = "";

  updateFilter(): void {
console.log("updateFilter");
    // TBD - use filter function
    // currently just copy array
    if (this.filterByTitle) {
    this.filteredPublications = this.publications.filter(p => p.title.includes(this.filterByTitle));
    } else {
    this.filteredPublications = this.publications.slice();
    }
    if (this.filterByYear) {
    this.filteredPublications = this.filteredPublications.filter(p => p.year === Number(this.filterByYear));
    } else {
    this.filteredPublications = this.filteredPublications.slice();
    }
    if (this.filterByType) {
    this.filteredPublications = this.filteredPublications.filter(p => p.bibtextype === this.filterByType);
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
