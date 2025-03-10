export class Publication {
  id: number;
  bibtextype?: string;
  title?: string;
  author?: string[];
  keywords?: string[];
  year?: number;
  doi?: string;
  url?: string;
  citation?: string;
  abstract?: string;
  booktitle?: string;
  journal?: string;

  constructor(id:number) {
    this.id=id
  }
}
