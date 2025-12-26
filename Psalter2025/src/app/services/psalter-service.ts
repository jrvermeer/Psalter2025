import { HttpClient } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";

@Injectable({providedIn: 'root'})
export class PsalterService {
  constructor(private http: HttpClient) {
    this.currentPsalter$.subscribe(x => this.currentPsalter = x)
  }

  currentPsalter$ = new EventEmitter<Psalter>()
  currentPsalter: Psalter
  showScore = (sessionStorage.getItem('showScore') ?? 'true') == 'true';

  getPsalters() {
    return this.http.get<Psalter[]>('assets/1912/psalter.json');
  }

  toggleScore() {
    this.showScore = !this.showScore;
    sessionStorage.setItem('showScore', this.showScore.toString())
  }
}

export class Psalter {
  constructor(c?: Partial<Psalter>) {
    Object.assign(this, c)
  }
  number: string
  title: string
  psalm: string
  verses: string[]
  chorus: string

  // 1912
  secondTune: boolean
  numVersesInsideStaff: number
}
