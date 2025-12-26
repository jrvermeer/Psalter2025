import { Injectable } from "@angular/core";

@Injectable({providedIn: 'root'})
export class PsalterService {
  constructor() {

    for (let i = 1; i <= 434; i++)
      this.psalters.push(i);
  
  }


  psalters: number[] = [];
}
