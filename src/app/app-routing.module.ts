import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: './start/start.module#StartPageModule' },
  { path: 'play-game/games-overview', loadChildren: './pages/play-game/games-overview/games-overview.module#GamesOverviewPageModule' },
  { path: 'create-game', loadChildren: './pages/create-game/create-game/create-game.module#CreateGamePageModule' },
  { path: 'create-game/create-game-meta', loadChildren: './pages/create-game/create-game-meta/create-game-meta.module#CreateGameMetaPageModule' },
  { path: 'create-game/create-game-list', loadChildren: './pages/create-game/create-game-list/create-game-list.module#CreateGameListPageModule' },
  { path: 'create-game/create-game-map', loadChildren: './pages/create-game/create-game-map/create-game-map.module#CreateGameMapPageModule' },
  // older stuff
  { path: 'add-game', loadChildren: './add-game/add-game.module#AddGamePageModule' },
  { path: 'game-detail/:id', loadChildren: './game-detail/game-detail.module#GameDetailPageModule' },
  { path: 'map-scale', loadChildren: './map-scale/map-scale.module#MapScalePageModule' },
  { path: 'map-swipe', loadChildren: './map-swipe/map-swipe.module#MapSwipePageModule' },
  { path: 'start', loadChildren: './start/start.module#StartPageModule' },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
