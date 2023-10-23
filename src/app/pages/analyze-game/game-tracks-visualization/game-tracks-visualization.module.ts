import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GameTracksVisualizationPageRoutingModule } from './game-tracks-visualization-routing.module';

import { GameTracksVisualizationPage } from './game-tracks-visualization.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GameTracksVisualizationPageRoutingModule
  ],
  declarations: [GameTracksVisualizationPage]
})
export class GameTracksVisualizationPageModule {}
