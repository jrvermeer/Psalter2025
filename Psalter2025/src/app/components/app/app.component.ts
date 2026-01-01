import { Component, DOCUMENT, Inject, Renderer2, HostListener, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Psalter, PsalterService, SearchResult, VerseSearchResult } from '../../services/psalter-service';
import { StorageService } from '../../services/storage-service';
import { PsalterPageComponent } from '../psalter-page/psalter-page.component';
import { FormControl } from '@angular/forms';
import { startWith, debounceTime } from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    standalone: false
})
export class AppComponent {
    constructor(
        public service: PsalterService,
        public storage: StorageService,
        private renderer: Renderer2,
        private cdRef: ChangeDetectorRef,
        @Inject(DOCUMENT) private document: Document) {

        this.toggleTheme(storage.darkTheme);
        this.togglePsalter(storage.oldPsalter);
        this.scaleTextSize(storage.textScale);

        this.searchTypeControl.valueChanges
            .pipe(startWith(this.searchTypeControl.value))
            .subscribe(x => {
                //this.searchInputLabel = x == 'number' ? 'Search by number' : 'Search by text'
                this.updateSearchResults();
                this.searchInputElement?.nativeElement.inputMode
                this.searchInputElement?.nativeElement.setSelectionRange(0, this.searchInputElement.nativeElement.value.length)
            })

        this.searchInputControl.valueChanges
            .pipe(debounceTime(200))
            .subscribe(x => this.updateSearchResults())

        window.addEventListener('beforeinstallprompt', (e: Event) => {
            e.preventDefault();
            this.installEvent = e
        });
    }
    
    installEvent: any;
    audio: HTMLAudioElement;
    currentVerse = 1;
    psalters: Psalter[]
    goToPsalter: Psalter;

    searching = false
    searchResults: SearchResult[]
    searchTypeControl = new FormControl<'number' | 'text'>('number')
    searchInputControl = new FormControl<string>(undefined)
    //searchInputLabel: string

    @ViewChild('searchInput')
    searchInputElement: ElementRef<HTMLInputElement>

    @ViewChild(PsalterPageComponent)
    psalterPage: PsalterPageComponent

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
            this.service.get1912().subscribe(x => this.psalters = x);
        else
            this.service.get2025().subscribe(x => this.psalters = x);

        this.storage.oldPsalter = oldPsalter;
    }

    get isPlaying() { return this.audio && !this.audio.paused }
    toggleAudio() {
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

    public toggleSearch(goToPsalter?: SearchResult) {
        this.searching = !this.searching
        this.goToPsalter = goToPsalter?.psalter
        this.updateSearchResults();
        this.searchInputControl.setValue('', { emitEvent: false })

        if (this.searching) {
            this.cdRef.detectChanges()
            this.searchInputElement?.nativeElement.focus()
        }
    }

    private updateSearchResults() {
        if (!this.searching) {
            this.searchResults = null;
            return;
        }
        const searchStart = Date.now();
        const searchText = this.searchInputControl.value?.toLowerCase();
        this.searchResults = [];
        for (let psalter of this.psalters) {
            let searchResult = new SearchResult({ psalter: psalter, preview: psalter.verses[0].split('\n')[0] });
            let add = true;
            if (searchText) {
                const isNumberMatch = `${psalter.number}${psalter.letter}`.toLowerCase().startsWith(searchText);
                const isPsalmMatch = psalter.psalm?.toString() == searchText;
                if (isNumberMatch || isPsalmMatch) {
                    add = true
                    searchResult.showPsalm = isPsalmMatch;
                }
                else if (searchText.length > 1) {
                    searchResult.textResults = [];
                    let verseNum = 1
                    for (let verse of psalter.verses) {
                        let i = verse.toLowerCase().indexOf(searchText)
                        if (i > -1)
                            searchResult.textResults.push(new VerseSearchResult({ verseNumber: verseNum, text: verse }))
                        verseNum++
                    }
                    add = !!searchResult.textResults.length
                }
            }

            if (add)
                this.searchResults.push(searchResult)
        }

        console.log(`Searched '${searchText}' in ${Date.now() - searchStart}ms (${this.searchResults.length} hits)`)
    }

    initialPinchTextScale: number;
    initialPinchDistance: number
    scaleFactor: number;

    @HostListener('touchstart', ['$event'])
    touchStart(evt: TouchEvent) {
        if (evt.touches.length === 2) {
            evt.preventDefault();
            this.initialPinchDistance = this.calculateDistance(evt.touches[0], evt.touches[1])
            this.initialPinchTextScale = this.storage.textScale;
        }
    }

    @HostListener('touchmove', ['$event'])
    touchMove(evt: TouchEvent) {
        if (evt.touches.length === 2 && this.initialPinchDistance > 0) {
            evt.preventDefault();

            const currentPinchDistance = this.calculateDistance(evt.touches[0], evt.touches[1]);

            this.scaleFactor = currentPinchDistance / this.initialPinchDistance;
            let newScale = this.initialPinchTextScale * this.scaleFactor;
            newScale = Math.max(newScale, 1);
            newScale = Math.min(newScale, 2);
            this.storage.textScale = newScale;
            this.scaleTextSize(newScale);
        }
    }

    @HostListener('touchend', ['$event'])
    touchEnd(evt: TouchEvent) {
        this.initialPinchDistance = null;
        this.scaleFactor = null;
        this.initialPinchTextScale = null
    }

    private calculateDistance(touch1: Touch, touch2: Touch) {
        return Math.hypot(
            touch1.pageX - touch2.pageX,
            touch1.pageY - touch2.pageY
        );
    };

    private scaleTextSize(scale: number) {
        this.renderer.setStyle(this.document.body, 'font-size', `${scale}em`)
        this.renderer.setStyle(this.document.body, 'line-height', `${scale + 0.25}rem`)
    }
}

