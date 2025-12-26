import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({providedIn: 'root'})
export class PsalterService {
  constructor(private http: HttpClient) {

  }

  getPsalters() {
    return this.http.get<Psalter[]>('assets/psalter_updated.json')
      ;
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

  // 1912
  secondTune: boolean
  numVersesInsideStaff: number
}
