import { HttpClient } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";
import { of, tap, map } from "rxjs";

@Injectable({ providedIn: 'root' })
export class PsalterService {
    constructor(private http: HttpClient) {
        this.currentPsalter$.subscribe(x => this.currentPsalter = x)
    }

    currentPsalter$ = new EventEmitter<Psalter>()
    currentPsalter: Psalter

    private _1912: Psalter[];
    get1912() {
        return this._1912 ? of(this._1912) : this.http.get<Psalter[]>('1912/psalter.json').pipe(
            map(x => x.map(x => new Psalter(x))),
            tap(x => this._1912 = x));
    }

    private _2025: Psalter[];
    get2025() {
        return this._2025 ? of(this._2025) : this.http.get<Psalter[]>('2025/psalter.json').pipe(
            map(x => x.map(x => new Psalter(x))),
            tap(x => this._2025 = x));
    }

    private _ranges: Range[] = [];

    clearHighlights() {
        this._ranges = [];
        CSS.highlights.clear()
    }

    // have to have one highlight obj for all directives, else last one overwrites all others
    highlightRanges(ranges: Range[]) {
        this._ranges.push(...ranges);
        const highlight = new Highlight(...this._ranges)
        CSS.highlights.set('ui-search-hit', highlight)
    }
}

export class Psalter {
    constructor(c?: Partial<Psalter>) {
        Object.assign(this, c)
    }
    identifier: string
    secondTune: boolean // 1912 (make part of identifier so it's unique?)

    title: string
    psalm: number
    psalmVerses: string // 2025
    isCompletePsalm: boolean // 2025

    verses: string[]
    chorus: string
    audioFile: string
    scoreFiles: string[]
    otherPsalterIdentifiers: string[]

    numVersesInsideStaff: number // 1912

    get mainIdentifier() { // number
        return this.identifier.substring(0, this.identifier.length - this.subIdentifier.length)
    }
    get subIdentifier() { // letter
        let l = this.identifier[this.identifier.length - 1];
        return isNaN(parseInt(l)) ? l : '';
    }
}

export class PsalterSearchResult {
    constructor(c?: Partial<PsalterSearchResult>) {
        Object.assign(this, c)
    }
    psalter: Psalter
    preview: string
    showPsalm: boolean
    otherPsalterIdentifier: string;
    verseResults: VerseSearchResult[]
}

export class VerseSearchResult {
    constructor(c?: Partial<VerseSearchResult>) {
        Object.assign(this, c);
    }

    verseIdentifier: string
    text: string
    highlightRanges: StartEndIndex[] = [];
}

export type StartEndIndex = [number, number];


