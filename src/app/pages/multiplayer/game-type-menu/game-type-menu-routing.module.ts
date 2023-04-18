import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GameTypeMenuPage } from './game-type-menu.page';

const routes: Routes = [
  {
    path: '',
    component: GameTypeMenuPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GameTypeMenuPageRoutingModule {}
