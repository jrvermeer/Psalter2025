import { Component, ElementRef, HostListener, Input, SimpleChanges, ViewChild } from '@angular/core';
import { SwiperContainer, SwiperSlide } from 'swiper/element';
import { Psalter, PsalterService } from '../../services/psalter-service';
import { Swiper } from 'swiper/types';
import { StorageService } from '../../services/storage-service';
import { AppComponent } from '../../app.component';

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
    public app: AppComponent) {
      this.updateWindowSizeSettings()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.swiper && changes['psalters']) {
      this.resetSwiper();
    }
  }

  ngAfterViewInit() {
    if (this.psalters)
      this.resetSwiper();
  }

  enableNavArrows = false;

  @Input()
  psalters: Psalter[];

  @ViewChild('swiper')
  swiper: ElementRef<SwiperContainer>;

  numHiddenVerses = 0;
  getVerses(psalter: Psalter) {
    this.numHiddenVerses = 0;
    if (!this.storage.showScore)
      return psalter.verses;

    if (psalter.numVersesInsideStaff < psalter.verses.length) {
      this.numHiddenVerses = psalter.numVersesInsideStaff;
      return psalter.verses.slice(psalter.numVersesInsideStaff - 1);
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
    //sessionStorage.setItem('lastIndex', swiper.activeIndex.toString());
  }

  private resetSwiper() {
    // have to initialize after all slides are loaded for virtual swipers (needed w/ *ngFor even if not fetching over network)
    setTimeout(() => {
        this.swiper.nativeElement.initialize();
      //let lastIndex = sessionStorage.getItem('lastIndex')
      //if (lastIndex)
      //  this.swiper.nativeElement.swiper.slideTo(parseInt(lastIndex))
      //else
      this.service.currentPsalter$.next(this.psalters[0]);
    }, 1)
  }
}
