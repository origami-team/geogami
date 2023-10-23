import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GameTracksVisualizationPage } from './game-tracks-visualization.page';

const routes: Routes = [
  {
    path: '',
    component: GameTracksVisualizationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GameTracksVisualizationPageRoutingModule {}
