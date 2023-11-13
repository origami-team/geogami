import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { GameTracksVisualizationPage } from './game-tracks-visualization.page';

const routes: Routes = [
  {
    path: '',
    component: GameTracksVisualizationPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
    ],
  declarations: [GameTracksVisualizationPage]
})
export class GameTracksVisualizationPageModule {}
