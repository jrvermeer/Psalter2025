import { Directive, DOCUMENT, HostListener, Inject, Renderer2 } from '@angular/core';
import { StorageService } from './storage-service';

const MIN_TEXT_SCALE = 1;
const MAX_TEXT_SCALE = 2;

const MIN_IMG_SCALE = 0.5;
const MAX_IMG_SCALE = 2.5;

@Directive({
    selector: '[appZoom]',
    standalone: false,
})
export class ZoomDirective {

    constructor(private storage: StorageService,
        private renderer: Renderer2,
        @Inject(DOCUMENT) private document: Document) {
        this.scaleTextSize(storage.textScale);
    }


    initialImgScale: number;
    initialPinchDistance: number
    scaleFactor: number;

    @HostListener('touchstart', ['$event'])
    touchStart(evt: TouchEvent) {
        if (evt.touches.length === 2) {
            evt.preventDefault();
            this.initialPinchDistance = this.calculateDistance(evt.touches[0], evt.touches[1])
            this.initialImgScale = Math.min(this.storage.imgScale);
        }
    }

    @HostListener('touchmove', ['$event'])
    @HostListener('wheel', ['$event'])
    touchMove(evt: Event) {
        let newScale: number;
        if (evt instanceof TouchEvent && evt.touches.length === 2 && this.initialPinchDistance > 0) {
            evt.preventDefault();

            const currentPinchDistance = this.calculateDistance(evt.touches[0], evt.touches[1]);

            this.scaleFactor = currentPinchDistance / this.initialPinchDistance;
            newScale = this.initialImgScale * this.scaleFactor;
        }
        else if (evt instanceof WheelEvent && evt.shiftKey) {
            const isScrollingUp = evt.deltaY < 0;
            newScale = this.storage.imgScale + (isScrollingUp ? 0.1 : -0.1);
        }

        if (newScale) {
            this.storage.textScale = Math.min(Math.max(newScale, MIN_TEXT_SCALE), MAX_TEXT_SCALE);
            this.storage.imgScale = Math.min(Math.max(newScale, MIN_IMG_SCALE), MAX_IMG_SCALE);
            console.log('textScale: ' + this.storage.textScale, 'imgScale: ' + this.storage.imgScale)
            this.scaleTextSize(this.storage.textScale);
        }
    }

    @HostListener('touchend', ['$event'])
    touchEnd(evt: TouchEvent) {
        this.initialPinchDistance = null;
        this.scaleFactor = null;
        this.initialImgScale = null
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
