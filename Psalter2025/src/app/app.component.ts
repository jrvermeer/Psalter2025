import { Component, DOCUMENT, Inject, Renderer2 } from '@angular/core';
import { PsalterService } from './services/psalter-service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    standalone: false
})
export class AppComponent {
  constructor(public service: PsalterService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document) {

    let isDarkTheme = localStorage.getItem('dark-theme') == 'true'
    this.setDarkTheme(isDarkTheme);
  }

  darkTheme = false;
  setDarkTheme(darkTheme: boolean) {
    let darkThemeClass = 'ui-dark-theme';
    let lightThemeClass = 'ui-light-theme';

    this.renderer.removeClass(this.document.body, darkTheme ? lightThemeClass : darkThemeClass)
    this.renderer.addClass(this.document.body, darkTheme ? darkThemeClass : lightThemeClass)
    this.darkTheme = darkTheme;
    localStorage.setItem('dark-theme', darkTheme.toString())
  }

  audio: HTMLAudioElement;
  get isPlaying() { return this.audio && !this.audio.paused }
  playPause() {
    let src = `assets/1912/Audio/_${this.service.currentPsalter.number + (this.service.currentPsalter.secondTune ? '_2' : '')}.mp3`

    if (this.isPlaying)
      this.audio.pause();
    else {
      this.audio = new Audio(src);
      this.audio.play();
      this.service.currentPsalter$.subscribe(x => this.audio.pause())
    }
  }

}
