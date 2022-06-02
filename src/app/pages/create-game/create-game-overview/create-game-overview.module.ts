import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { CreateGameOverviewPage } from './create-game-overview.page';
import { LottieModule } from 'ngx-lottie';
import player from 'lottie-web';

import { TranslateModule } from '@ngx-translate/core';


// Note we need a separate function as it's required
// by the AOT compiler.
export function playerFactory() {
  return player;
}

const routes: Routes = [
  {
    path: '',
    component: CreateGameOverviewPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    LottieModule.forRoot({ player: playerFactory }),
    TranslateModule
  ],
  declarations: [CreateGameOverviewPage]
})
export class CreateGameOverviewPageModule { }
