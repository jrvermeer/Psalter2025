import { NgModule, CUSTOM_ELEMENTS_SCHEMA, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

//import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { PsalterPageComponent } from './components/psalter-page/psalter-page.component';
import { PsalterSeparatorComponent } from './components/psalter-separator/psalter-separator.component';
import { provideHttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms'

import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatDividerModule } from '@angular/material/divider';
import { ServiceWorkerModule } from '@angular/service-worker';
import { HighlightRangeDirective } from './services/highlight-range.directive';
import { ZoomDirective } from './services/zoom.directive';

@NgModule({
    declarations: [
        AppComponent,
        PsalterPageComponent,
        HighlightRangeDirective,
        ZoomDirective,
        PsalterSeparatorComponent,
    ],
    imports: [
        BrowserModule,
        //AppRoutingModule,
        ReactiveFormsModule,

        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatDividerModule,
        
      ServiceWorkerModule.register('ngsw-worker.js', {
        enabled: !isDevMode(),
        // Register the ServiceWorker as soon as the application is stable
        // or after 30 seconds (whichever comes first).
        registrationStrategy: 'registerWhenStable:30000'
      })
    
    ],
    providers: [provideHttpClient()],
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
