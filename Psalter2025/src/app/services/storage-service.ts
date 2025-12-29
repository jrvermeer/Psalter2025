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
}
