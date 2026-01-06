import { ChangeDetectorRef, Component, ElementRef, HostListener, Input, SimpleChanges, ViewChild } from '@angular/core';
import { SwiperContainer, SwiperSlide } from 'swiper/element';
import { Psalter, PsalterService } from '../../services/psalter-service';
import { Swiper } from 'swiper/types';
import { StorageService } from '../../services/storage-service';
import { AppComponent } from '../app/app.component';

@Component({
    selector: 'psalter-page',
    templateUrl: './psalter-page.component.html',
    styleUrl: './psalter-page.component.css',
    standalone: false
})
export class PsalterPageComponent {
    constructor(
        public service: PsalterService,
        public storage: StorageService,
        public app: AppComponent,
        private cdRef: ChangeDetectorRef) {
        this.updateWindowSizeSettings()
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.swiper && changes['psalters']) {
            let goToIndex: number
            let isFirstInitialization = !changes['psalters'].previousValue;
            if (!isFirstInitialization && this.service.currentPsalter?.otherPsalterNumber)
                goToIndex = this.psalters.findIndex(x => `${x.number}${x.letter ?? ''}` == this.service.currentPsalter.otherPsalterNumber)

            this.resetSwiper();

            if (goToIndex)
                this.swiper.nativeElement.swiper.slideTo(goToIndex, 0);
        }
    }

    ngAfterViewInit() {
        this.resetSwiper();

        if (this.initial)
            this.goToPsalter(this.initial);
        else if (this.storage.lastIndex)
            this.goToIndex(this.storage.lastIndex, false);
    }

    enableNavArrows = false;
    get containerWidth() { return 500 * this.storage.textScale; }

    @Input()
    psalters: Psalter[];

    @Input()
    initial: Psalter;

    @ViewChild('swiper')
    swiper: ElementRef<SwiperContainer>;

    numHiddenVerses = 0;
    getVerses(psalter: Psalter) {
        this.numHiddenVerses = 0;
        if (!this.storage.showScore)
            return psalter.verses;

        if (psalter.numVersesInsideStaff < psalter.verses.length) {
            this.numHiddenVerses = psalter.numVersesInsideStaff;
            return psalter.verses.slice(psalter.numVersesInsideStaff);
        }

        return null
    }

    @HostListener('window:resize')
    updateWindowSizeSettings() {
        console.log('resize', window.innerWidth)
        this.enableNavArrows = window.innerWidth > 1000;
    }

    slideChange(evt: Event) {
        var swiper = (evt as CustomEvent).detail[0] as Swiper;
        let psalter = this.psalters[swiper.activeIndex];
        this.service.currentPsalter$.next(psalter);
        this.storage.lastIndex = swiper.activeIndex;
    }

    goToRandom() {
        const i = Math.floor(Math.random() * this.psalters.length)
        this.goToIndex(i);
    }

    goToPsalter(psalter: Psalter) {
        const i = this.psalters.indexOf(psalter);
        this.goToIndex(i)
    }

    goToIndex(i: number, animate = true) {
        if (i > -1)
            this.swiper.nativeElement.swiper.slideTo(i, animate ? undefined : 0);
    }

    public getPsalmDisplayText(psalter: Psalter) {
        if (!psalter.psalm)
            return null;
        if (psalter.isCompletePsalm)
            return 'complete';
        if (psalter.isCompletePsalm === false)
            return `partial (vv. ${psalter.psalmVerses})`

        return `Psalm ${psalter.psalm}`;
    }

    public getPsalmSearchText(psalter: Psalter) {
        if (!psalter.psalm)
            return null;

        let search = `Psalm ${psalter.psalm}`
        if (psalter.psalmVerses)
            search += `:${psalter.psalmVerses}`

        return search;
    }

    private resetSwiper() {
        if (this.swiper.nativeElement.swiper) {
            this.swiper.nativeElement.swiper?.destroy(true, true)

            // have to clear angular DOM so swiper doesn't keep the old psalter slides
            let psalters = this.psalters;
            this.psalters = [];
            this.cdRef.detectChanges();
            this.psalters = psalters
        }

        // have to initialize after all slides are loaded for virtual swipers (needed w/ *ngFor even if not fetching over network)
        this.cdRef.detectChanges();
        this.swiper.nativeElement.initialize();
        this.service.currentPsalter$.next(this.psalters[0]);
    }
}
