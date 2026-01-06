import { Directive, DOCUMENT, HostListener, Inject, Renderer2 } from '@angular/core';
import { StorageService } from './storage-service';

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
    @HostListener('wheel', ['$event'])
    touchMove(evt: Event) {
        let newScale: number;
        if (evt instanceof TouchEvent && evt.touches.length === 2 && this.initialPinchDistance > 0) {
            evt.preventDefault();

            const currentPinchDistance = this.calculateDistance(evt.touches[0], evt.touches[1]);

            this.scaleFactor = currentPinchDistance / this.initialPinchDistance;
            newScale = this.initialPinchTextScale * this.scaleFactor;
        }
        else if (evt instanceof WheelEvent && evt.shiftKey) {
            const isScrollingUp = evt.deltaY < 0;
            newScale = this.storage.textScale + (isScrollingUp ? 0.1 : -0.1);
        }

        if (newScale) {
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
    mousewheel(evt: WheelEvent) {
        if (!evt.shiftKey)
            return;

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
