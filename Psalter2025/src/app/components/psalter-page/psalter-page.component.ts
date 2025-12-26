import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { SwiperContainer } from 'swiper/element';
import { PsalterService } from '../../services/psalter-service';

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

    // have to initialize here for virtual swipers, else it initializes before the *ngFor finishes building the view and nothing works
    this.swiper.nativeElement.initialize();
  }

  enableNavArrows = false;

  @HostListener('window:resize', ['$event'])
  updateWindowSizeSettings() {
    console.log('resize', window.innerWidth)
    this.enableNavArrows = window.innerWidth > 1000;
  }


  @ViewChild('swiper')
  swiper: ElementRef<SwiperContainer>;
}
