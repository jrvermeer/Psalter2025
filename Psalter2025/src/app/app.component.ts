import { Component } from '@angular/core';
import { PsalterService } from './services/psalter-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(public dataService: PsalterService) {
  }

  toggleScore() {
    this.dataService.showScore = !this.dataService.showScore;
    sessionStorage.setItem('showScore', this.dataService.showScore.toString())
  }
}
