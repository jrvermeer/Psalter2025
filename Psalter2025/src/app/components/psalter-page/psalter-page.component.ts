import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { SwiperContainer } from 'swiper/element';
import { Psalter, PsalterService } from '../../services/psalter-service';

@Component({
  selector: 'psalter-page',
  templateUrl: './psalter-page.component.html',
  styleUrl: './psalter-page.component.css'
})
export class PsalterPageComponent {
  constructor(public dataService: PsalterService) {
    this.updateWindowSizeSettings()
  }

  ngAfterViewInit() {
    console.log('swiper:', this.swiper)

    //Object.assign(this.swiper.nativeElement, swiperParams);

    // have to initialize after all slides are loaded for virtual swipers (needed w/ *ngFor even if not fetching over network)
    this.dataService.getPsalters().subscribe(x => {
      this.psalters = x
      setTimeout(() => this.swiper.nativeElement.initialize(), 1);
    })
  }

  enableNavArrows = false;
  psalters: Psalter[];

  getVersesOutsideStaff(psalter: Psalter) {
    if (psalter.numVersesInsideStaff < psalter.verses.length)
      return psalter.verses.slice(psalter.numVersesInsideStaff - 1);

    return null
  }

  @HostListener('window:resize', ['$event'])
  updateWindowSizeSettings() {
    console.log('resize', window.innerWidth)
    this.enableNavArrows = window.innerWidth > 1000;
  }


  @ViewChild('swiper')
  swiper: ElementRef<SwiperContainer>;
}
