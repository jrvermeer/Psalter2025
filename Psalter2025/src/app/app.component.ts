import { Component, DOCUMENT, Inject, Renderer2 } from '@angular/core';
import { Psalter, PsalterService } from './services/psalter-service';
import { StorageService } from './services/storage-service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    standalone: false
})
export class AppComponent {
  constructor(
    public service: PsalterService,
    public storage: StorageService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document) {

    this.toggleTheme(storage.darkTheme);

    this.service.get1912().subscribe(x => this.oldPsalters = x);
    this.service.get2025().subscribe(x => this.newPsalters = x);
  }
   
  toggleTheme(darkTheme?: boolean) {
    if (darkTheme == undefined)
      darkTheme = !this.storage.darkTheme;

    let darkThemeClass = 'ui-dark-theme';
    let lightThemeClass = 'ui-light-theme';

    this.renderer.removeClass(this.document.body, darkTheme ? lightThemeClass : darkThemeClass)
    this.renderer.addClass(this.document.body, darkTheme ? darkThemeClass : lightThemeClass)
    this.storage.darkTheme = darkTheme;
  }

  togglePsalter(oldPsalter?: boolean) {
    if (oldPsalter == undefined)
      oldPsalter = !this.storage.oldPsalter;

    this.cancelAudio();

    if (oldPsalter)
      this.service.get1912().subscribe(x => this.oldPsalters = x);
    else
      this.service.get2025().subscribe(x => this.newPsalters = x);

    this.storage.oldPsalter = oldPsalter;
  }

  audio: HTMLAudioElement;
  currentVerse = 1;

  oldPsalters: Psalter[]
  newPsalters: Psalter[];

  get isPlaying() { return this.audio && !this.audio.paused }
  playPause() {
    if (this.isPlaying)
      this.audio?.pause();
    else if (this.audio) 
      this.audio.play();
    else {
      this.audio = new Audio(this.service.currentPsalter.audioFile);
      this.currentVerse = 1;
      this.audio.play();
      this.audio.onended = () => {
        this.currentVerse++;
        if (this.currentVerse > this.service.currentPsalter.verses.length)
          this.cancelAudio()
        else
          setTimeout(() => this.audio?.play(), 1000)
      }
      this.service.currentPsalter$.subscribe(x => this.cancelAudio())
    }
  }

  private cancelAudio() {
    this.audio?.pause();
    this.audio = null;
  }

}
