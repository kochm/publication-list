export interface Publication {
  id: number;
  bibtextype: string;
  title: string;
  author: string[];
  keywords: string[];
  year: number;
  doi: string;
  url: string;
  citation: string;
  abstract: string;
}
