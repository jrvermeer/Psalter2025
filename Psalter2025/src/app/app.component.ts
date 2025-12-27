import { Component, ElementRef, ViewChild } from '@angular/core';
import { PsalterService } from './services/psalter-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(public service: PsalterService) {
  }

  ngAfterViewInit() {
    this.service.currentPsalter$.subscribe(x => this.audio?.nativeElement.load())
  }

  @ViewChild('player')
  audio: ElementRef<HTMLAudioElement>;
}
