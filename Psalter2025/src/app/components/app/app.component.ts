import { Component, DOCUMENT, Inject, Renderer2, HostListener, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Psalter, PsalterService, PsalterSearchResult, StartEndIndex, VerseSearchResult } from '../../services/psalter-service';
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
        this.togglePsalter(undefined, storage.oldPsalter);

        this.searchInputModeControl.valueChanges
            .pipe(startWith(this.searchInputModeControl.value))
            .subscribe(x => {
                this.updateSearchResults();
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

    ngOnInit() {
        navigator.wakeLock?.request();
    }
    
    installEvent: any;
    audio: HTMLAudioElement;
    currentVerse = 1;
    psalters: Psalter[]
    goToPsalter: Psalter;

    searching = false
    searchResults: PsalterSearchResult[]
    searchInputModeControl = new FormControl<'numeric' | undefined>('numeric')
    searchInputControl = new FormControl<string>(undefined)
    searchMaxResultsMessage: string;

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

    togglePsalter(otherPsalterIdentifier?: string, oldPsalter?: boolean) {
        if (oldPsalter == undefined)
            oldPsalter = !this.storage.oldPsalter;

        this.cancelAudio();

        let obs = oldPsalter ? this.service.get1912() : this.service.get2025();
        obs.subscribe(x => {
            this.psalters = x;
            if (otherPsalterIdentifier)
                this.goToPsalter = x.find(x => x.identifier == otherPsalterIdentifier);
            else if (this.service.currentPsalter.otherPsalterIdentifiers?.length)
                this.goToPsalter = x.find(x => x.identifier == this.service.currentPsalter.otherPsalterIdentifiers[0])
            else if (this.service.currentPsalter.psalm)
                this.goToPsalter = x.find(x => x.psalm == this.service.currentPsalter.psalm)
                
        })

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
                    setTimeout(() => this.audio?.play(), 700)
            }
            this.service.currentPsalter$.subscribe(x => this.cancelAudio())
        }
    }

    private cancelAudio() {
        this.audio?.pause();
        this.audio = null;
    }

    public toggleSearch(goToPsalter?: PsalterSearchResult) {
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
        this.service.clearHighlights();
        const searchStart = Date.now();
        const searchText = this.searchInputControl.value?.toLowerCase();
        this.searchResults = [];
        for (let psalter of this.psalters) {
            let searchResult = new PsalterSearchResult({ psalter: psalter, preview: psalter.verses[0].split('\n')[0] });
            let add = !searchText;
            if (searchText) {
                if (psalter.identifier.toLowerCase().startsWith(searchText)) {
                    add = true
                }
                else if (psalter.psalm?.toString() == searchText) {
                    add = searchResult.showPsalm = true
                }
                else {
                    let otherIdentifier = psalter.otherPsalterIdentifiers?.find(x => x.toLowerCase() == searchText);
                    if (otherIdentifier) {
                        add = true;
                        searchResult.otherPsalterIdentifier = otherIdentifier
                    }
                    else if (searchText.length > 1) {
                        searchResult.verseResults = [];
                        let verseNum = 1
                        for (let verse of psalter.verses)
                            this.addVerseSearchHits(searchResult, `${verseNum++}.`, verse, searchText)

                        if (psalter.chorus)
                            this.addVerseSearchHits(searchResult, 'chorus', psalter.chorus, searchText)

                        add = !!searchResult.verseResults.length
                    }

                }
            }

            if (add) 
                this.searchResults.push(searchResult)
        }

        // rendering too many verses causes UI lag (switch to virtual vertical swiper?)
        this.searchMaxResultsMessage = undefined;
        let numHidden = this.searchResults.length - AppComponent.MAX_PSALTER_RESULTS;
        if (numHidden > 1 && this.searchResults[0].verseResults?.length) { // not applicable to number matches (preview is small)
            this.searchResults.splice(AppComponent.MAX_PSALTER_RESULTS, numHidden)
            this.searchMaxResultsMessage = `${numHidden} results hidden`
        }

        console.log(`Searched '${searchText}' in ${Date.now() - searchStart}ms (${this.searchResults.length} hits)`)
    }

    private static IGNORE_CHARS = [',', '?', ':', ';', '\n', '\'', '"', '.']
    private static MAX_PSALTER_RESULTS = 100;

    addVerseSearchHits(psalterResult: PsalterSearchResult, verseIdentifier: string, verse: string, query: string) {
        const verseResult = new VerseSearchResult({ verseIdentifier: verseIdentifier, text: verse })
        verse = verse.toLowerCase();
        let iQuery = 0;
        let iHitStart = -1;
        for (let iVerse = 0; iVerse < verse.length; iVerse++) {
            let verseChar = verse[iVerse];
            let queryChar = query[iQuery];

            // ignore special characters, allow query space to match verse '\n' 
            if (AppComponent.IGNORE_CHARS.includes(verseChar)) {
                if (AppComponent.IGNORE_CHARS.includes(queryChar) || (verseChar === '\n' && queryChar == ' '))
                    iQuery++

                continue;
            }

            if (queryChar === verseChar) {
                iQuery++;
                if (iHitStart == -1)
                    iHitStart = iVerse;

                if (iQuery == query.length) {
                    verseResult.highlightRanges.push([iHitStart, iVerse+1])
                    iHitStart = -1;
                    iQuery = 0;
                }
            }
            else {
                iQuery = 0;
                iHitStart = -1
            }
        }

        if (verseResult.highlightRanges.length)
            psalterResult.verseResults.push(verseResult);
        return verseResult;
    }
}

