import { Component } from '@angular/core';

@Component({
  selector: 'psalter-page',
  templateUrl: './psalter-page.component.html',
  styleUrl: './psalter-page.component.css'
})
export class PsalterPageComponent {
  constructor() {
    for (let i = 1; i <= 434; i++)
      this.psalters.push(i);
  }
  psalters: number[] = [];
}
