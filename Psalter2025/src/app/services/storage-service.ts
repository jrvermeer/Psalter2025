import { HttpClient } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class StorageService {

  get showScore() { return localStorage.getItem('showScore') == 'true'; }
  set showScore(val: boolean) { localStorage.setItem('showScore', val.toString()) }

  get darkTheme() { return localStorage.getItem('darkTheme') == 'true'; }
  set darkTheme(val: boolean) { localStorage.setItem('darkTheme', val.toString()) }

  get oldPsalter() { return localStorage.getItem('oldPsalter') == 'true'; }
  set oldPsalter(val: boolean) { localStorage.setItem('oldPsalter', val.toString()) }

  get textScale() { return this.getFloat('textScale', 1) }
  set textScale(val: number) { localStorage.setItem('textScale', val.toString()) }

  get lastIndex() { return this.getInt('lastIndex') }
  set lastIndex(val: number) { localStorage.setItem('lastIndex', val.toString()) }

  private getFloat(key: string, defaultIfEmpty?: number) {

    let val = localStorage.getItem(key)
    return val ? parseFloat(val) : defaultIfEmpty;
  }

  private getInt(key: string, defaultIfEmpty?: number) {

    let val = localStorage.getItem(key)
    return val ? parseInt(val) : defaultIfEmpty;
  }
}
