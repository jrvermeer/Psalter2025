import { HttpClient } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";

@Injectable({providedIn: 'root'})
export class PsalterService {
  constructor(private http: HttpClient) {
  }

  getPsalters() {
    return this.http.get<Psalter[]>('assets/1912/psalter.json');
  }

  currentPsalter: Psalter
  showScore = (sessionStorage.getItem('showScore') ?? 'true') == 'true';
}

export class Psalter {
  constructor(c?: Partial<Psalter>) {
    Object.assign(this, c)
  }
  number: string
  title: string
  psalm: string
  verses: string[]

  // 1912
  secondTune: boolean
  numVersesInsideStaff: number
}
