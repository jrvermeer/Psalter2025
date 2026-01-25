import { ApplicationRef, ChangeDetectorRef, Injectable } from '@angular/core';
import { PsalterService } from './psalter.service';
import { distinctUntilChanged } from 'rxjs';

@Injectable({
    providedIn: 'root',
    
})
export class AudioService {

    constructor(private service: PsalterService,
        private cdRef: ApplicationRef) {

        navigator.mediaSession?.setActionHandler('play', () => { this.toggleAudio(); this.cdRef.tick() })
        navigator.mediaSession?.setActionHandler('pause', () => { this.toggleAudio(); this.cdRef.tick() })
        navigator.mediaSession?.setActionHandler('stop', () => { this.cancelAudio(); this.cdRef.tick() })

        this.service.currentPsalter$
            .pipe(distinctUntilChanged())
            .subscribe(x => this.cancelAudio())
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
            this.updateMetadata();
            this.audio.onended = () => {
                this.currentVerse++;
                if (this.currentVerse > this.service.currentPsalter.verses.length)
                    this.cancelAudio()
                else {
                    this.isBetweenVerses = setTimeout(() => {
                        this.isBetweenVerses = null;
                        this.audio?.play()
                        this.updateMetadata();
                    }, 700)

                }
            }
        }
    }

    private updateMetadata() {
        if (!navigator.mediaSession)
            return;

        navigator.mediaSession.metadata = new MediaMetadata({
            title: `${this.service.currentPsalter.title} (${this.isPlaying})`,
            //album: this.service.currentPsalter.identifier,
            artist: `${this.service.currentPsalter.identifier} (${this.isPlaying})`,
            artwork: [
                {
                    src: 'icons/maskable_icon_x512.png',
                    sizes: '512x512',
                    type: 'image/png'
                }
            ]
        });
    }

    public cancelAudio() {
        this.audio?.pause();
        this.audio = null;
    }
}
