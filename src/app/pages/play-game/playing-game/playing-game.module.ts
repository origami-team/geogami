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

import { TranslateModule } from '@ngx-translate/core';

// Note we need a separate function as it's required
// by the AOT compiler.
export function playerFactory() {
  return player;
}

const routes: Routes = [
  {
    path: '',
    component: PlayingGamePage
  }
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
    TranslateModule
  ],
  declarations: [PlayingGamePage, KeywordPipe, FeedbackComponent],
  providers: []
})
export class PlayingGamePageModule { }
