import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PlayingGamePage } from './playing-game.page';
import { NgShufflePipeModule } from 'angular-pipes';
import { KeywordPipe } from 'src/app/pipes/keyword.pipe';

import { LottieModule } from 'ngx-lottie';
import player from 'lottie-web';
import { FeedbackComponent } from 'src/app/components/feedback/feedback.component';
import { AudioPlayerModule } from 'src/app/components/audio-player/audio-player.module';

import { MarkdownModule } from 'ngx-markdown';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';
import { environment } from 'src/environments/environment';
import { MapImageControlComponent } from 'src/app/mapControllers/image-control';
import { ViewDirectionControlComponent } from 'src/app/mapControllers/view-direction-control';
import { GeolocateControlComponent } from 'src/app/mapControllers/geolocate-control';
import { LandmarkControlComponent } from 'src/app/mapControllers/landmark-control';
import { BBoxControlComponent } from 'src/app/mapControllers/bbox-control';
import { TrackControlComponent } from 'src/app/mapControllers/track-control';
import { StreetSectionControlComponent } from 'src/app/mapControllers/street-section-control';

// Note we need a separate function as it's required
// by the AOT compiler.
export function playerFactory() {
  return player;
}

const routes: Routes = [
  {
    path: '',
    component: PlayingGamePage,
  },
];

@NgModule({
  imports: [
    AudioPlayerModule,
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    LottieModule.forRoot({ player: playerFactory }),
    NgShufflePipeModule,
    MarkdownModule.forRoot(),
    NgxMapboxGLModule.withConfig({
      accessToken: environment.mapboxAccessToken,
    }),
  ],
  declarations: [
    PlayingGamePage,
    KeywordPipe,
    FeedbackComponent,
    MapImageControlComponent,
    ViewDirectionControlComponent,
    GeolocateControlComponent,
    LandmarkControlComponent,
    BBoxControlComponent,
    TrackControlComponent,
    StreetSectionControlComponent
  ],
  providers: [],
})
export class PlayingGamePageModule { }
