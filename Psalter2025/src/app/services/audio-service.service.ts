import { Injectable } from '@angular/core';
import { PsalterService } from './psalter-service';

@Injectable({ providedIn: 'root' })
export class AudioService {

    constructor(private service: PsalterService) {

    }

    audio: HTMLAudioElement;
    currentVerse = 1;
    get isPlaying() {
        const isPlaying = this.audio && (!this.audio.paused || this.isBetweenVerses);
        return isPlaying ? `${this.currentVerse} / ${this.service.currentPsalter.verses.length}` : null;
    }

    private isBetweenVerses: any

    toggleAudio() {
        if (this.isBetweenVerses) {
            clearTimeout(this.isBetweenVerses);
            this.isBetweenVerses = null;
        }
        else if (this.isPlaying)
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
                else {
                    this.isBetweenVerses = setTimeout(() => {
                        this.isBetweenVerses = null;
                        this.audio?.play()
                    }, 700)

                }
            }
            this.service.currentPsalter$.subscribe(x => this.cancelAudio())
        }
    }

    public cancelAudio() {
        this.audio?.pause();
        this.audio = null;
    }
}
