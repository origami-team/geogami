import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PlayingGamePage } from './playing-game.page';
import { LottieAnimationViewModule } from 'ng-lottie';

const routes: Routes = [
  {
    path: '',
    component: PlayingGamePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    LottieAnimationViewModule.forRoot()
  ],
  declarations: [PlayingGamePage]
})
export class PlayingGamePageModule { }
