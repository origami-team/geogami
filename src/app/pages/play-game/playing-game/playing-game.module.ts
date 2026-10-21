import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PlayingGamePage } from './playing-game.page';
import { KeywordPipe } from 'src/app/pipes/keyword.pipe';
import { MarkdownPipe } from 'src/app/pipes/markdown.pipe';
import { ShufflePipe } from 'src/app/pipes/shuffle.pipe';

import { LottieDirectiveModule } from 'src/app/components/lottie/lottie.module';
import { FeedbackComponent } from 'src/app/components/feedback/feedback.component';
import { AudioPlayerModule } from 'src/app/components/audio-player/audio-player.module';


import { TranslateModule } from '@ngx-translate/core';

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
    LottieDirectiveModule,
    TranslateModule
  ],
  declarations: [PlayingGamePage, KeywordPipe, MarkdownPipe, ShufflePipe, FeedbackComponent],
  providers: []
})
export class PlayingGamePageModule { }
