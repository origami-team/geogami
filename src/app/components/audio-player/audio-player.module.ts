import { NgModule } from '@angular/core';
import { AudioPlayerComponent } from './audio-player.component';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';


@NgModule({
    imports: [
        CommonModule,
        IonicModule
    ],
    declarations: [AudioPlayerComponent],
    providers: [],
    exports: [AudioPlayerComponent]
})
export class AudioPlayerModule { }
