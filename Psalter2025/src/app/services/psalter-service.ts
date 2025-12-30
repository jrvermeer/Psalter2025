import { HttpClient } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";
import { of, tap } from "rxjs";

@Injectable({providedIn: 'root'})
export class PsalterService {
  constructor(private http: HttpClient) {
    this.currentPsalter$.subscribe(x => this.currentPsalter = x)
  }

  currentPsalter$ = new EventEmitter<Psalter>()
  currentPsalter: Psalter

  private _1912: Psalter[];
  get1912() {
    return this._1912 ? of(this._1912) : this.http.get<Psalter[]>('assets/1912/psalter.json').pipe(tap(x => this._1912 = x));
  }

  private _2025: Psalter[];
  get2025() {
    return this._2025 ? of(this._2025) : this.http.get<Psalter[]>('assets/2025/psalter.json').pipe(tap(x => this._2025 = x));
  }
}

export class Psalter {
  constructor(c?: Partial<Psalter>) {
    Object.assign(this, c)
  }
  number: number
  letter: string // 2025
  title: string

  psalm: number
  psalmVerses: string // 2025
  isCompletePsalm: boolean // 2025

  verses: string[]
  chorus: string
  audioFile: string
  scoreFiles: string[]
  otherPsalterNumber: string

  secondTune: boolean // 1912
  numVersesInsideStaff: number // 1912
}
