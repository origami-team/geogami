import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: './tabs/tabs.module#TabsPageModule' },
  { path: 'add-game', loadChildren: './add-game/add-game.module#AddGamePageModule' },
  { path: 'game-detail/:id', loadChildren: './game-detail/game-detail.module#GameDetailPageModule' },
  { path: 'map-scale', loadChildren: './map-scale/map-scale.module#MapScalePageModule' },
  { path: 'map-swipe', loadChildren: './map-swipe/map-swipe.module#MapSwipePageModule' },
  { path: 'start', loadChildren: './start/start.module#StartPageModule' },
  { path: 'create-game', loadChildren: './create-game/create-game.module#CreateGamePageModule' },
  { path: 'create-game-meta', loadChildren: './create-game-meta/create-game-meta.module#CreateGameMetaPageModule' },
  { path: 'create-game-map', loadChildren: './create-game-map/create-game-map.module#CreateGameMapPageModule' }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
