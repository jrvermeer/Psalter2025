import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { SwiperContainer, SwiperSlide } from 'swiper/element';
import { Psalter, PsalterService } from '../../services/psalter-service';
import { Swiper, SwiperEvents } from 'swiper/types';

@Component({
  selector: 'psalter-page',
  templateUrl: './psalter-page.component.html',
  styleUrl: './psalter-page.component.css'
})
export class PsalterPageComponent {
  constructor(public service: PsalterService) {
    this.updateWindowSizeSettings()
    console.log('page showScore', this.service.showScore)
  }

  ngAfterViewInit() {
    console.log('swiper:', this.swiper)

    //Object.assign(this.swiper.nativeElement, swiperParams);

    // have to initialize after all slides are loaded for virtual swipers (needed w/ *ngFor even if not fetching over network)
    this.service.getPsalters().subscribe(x => {
      this.psalters = x
      setTimeout(() => {
        this.swiper.nativeElement.initialize();
        let lastIndex = sessionStorage.getItem('lastIndex')
        if (lastIndex)
          this.swiper.nativeElement.swiper.slideTo(parseInt(lastIndex))
      }, 1);
    })
  }

  enableNavArrows = false;
  psalters: Psalter[];

  @ViewChild('swiper')
  swiper: ElementRef<SwiperContainer>;

  numHiddenVerses = 0;
  getVerses(psalter: Psalter) {
    this.numHiddenVerses = 0;
    if (!this.service.showScore)
      return psalter.verses;

    if (psalter.numVersesInsideStaff < psalter.verses.length) {
      this.numHiddenVerses = psalter.numVersesInsideStaff;
      return psalter.verses.slice(psalter.numVersesInsideStaff - 1);
    }

    return null
  }

  @HostListener('window:resize', ['$event'])
  updateWindowSizeSettings() {
    console.log('resize', window.innerWidth)
    this.enableNavArrows = window.innerWidth > 1000;
  }

  slideChange(evt: Event) {
    var swiper = (evt as CustomEvent).detail[0] as Swiper;
    let psalter = this.psalters[swiper.activeIndex];
    this.service.currentPsalter$.next(psalter);
    sessionStorage.setItem('lastIndex', swiper.activeIndex.toString());
  }
}
