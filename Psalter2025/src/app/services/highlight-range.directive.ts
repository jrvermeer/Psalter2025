import { ChangeDetectorRef, Directive, ElementRef, Input } from '@angular/core';
import { PsalterService, StartEndIndex } from './psalter.service';

@Directive({
  selector: '[highlightRange]',
  standalone: false,
})
export class HighlightRangeDirective {

    constructor(private el: ElementRef<HTMLElement>,
        private service: PsalterService) {
        
    }

    ngAfterViewInit() {
        if (!(this.highlightRange.length && this.el.nativeElement.firstChild?.textContent?.length)) // cya
            return;

        const ranges: Range[] = [];
        for (let [iStart, iEnd] of this.highlightRange) {
            if (iStart >= iEnd || iEnd > this.el.nativeElement.firstChild.textContent.length) // cya
                continue;

            let r = new Range();
            ranges.push(r);
            r.setStart(this.el.nativeElement.firstChild, iStart)
            r.setEnd(this.el.nativeElement.firstChild, iEnd)
        }
        this.service.highlightRanges(ranges);
    }

    @Input()
    highlightRange: StartEndIndex[]
}

