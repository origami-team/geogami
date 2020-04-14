import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: './start/start.module#StartPageModule' },
  { path: 'play-game/games-overview', loadChildren: './pages/play-game/games-overview/games-overview.module#GamesOverviewPageModule' },
  { path: 'play-game/play-game-list', loadChildren: './pages/play-game/play-game-list/play-game-list.module#PlayGameListPageModule' },
  { path: 'play-game/game-detail/:id', loadChildren: './pages/play-game/game-detail/game-detail.module#GameDetailPageModule' },
  { path: 'play-game/playing-game/:id', loadChildren: './pages/play-game/playing-game/playing-game.module#PlayingGamePageModule' },
  { path: 'create-game', loadChildren: './pages/create-game/create-game/create-game.module#CreateGamePageModule' },
  { path: 'create-game/create-game-overview', loadChildren: './pages/create-game/create-game-overview/create-game-overview.module#CreateGameOverviewPageModule' },
  { path: 'create-game/create-game-list', loadChildren: './pages/create-game/create-game-list/create-game-list.module#CreateGameListPageModule' },
  { path: 'create-game/create-game-map', loadChildren: './pages/create-game/create-game-map/create-game-map.module#CreateGameMapPageModule' },
  { path: 'edit-game', loadChildren: './pages/edit-game/edit-game-list/edit-game-list.module#EditGameListPageModule' },
  { path: 'edit-game/:id', loadChildren: './pages/edit-game/edit-game-overview/edit-game-list.module#EditGameListPageModule' },
  { path: 'analyze', loadChildren: './pages/analyze-game/analyze-game-list/analyze-game-list.module#AnalyzeGameListPageModule' },
  // older stuff
  // { path: 'map-swipe', loadChildren: './map-swipe/map-swipe.module#MapSwipePageModule' },
  { path: 'start', loadChildren: './start/start.module#StartPageModule' },
  { path: 'map-showroom', loadChildren: './pages/showroom/map-showroom/map-showroom.module#MapShowroomPageModule' },
  { path: 'info', loadChildren: './pages/info/info.module#InfoPageModule' },
  { path: 'showroom', loadChildren: './pages/showroom/showroom/showroom.module#ShowroomPageModule' },
  { path: 'task-showroom', loadChildren: './pages/showroom/task-showroom/task-showroom.module#TaskShowroomPageModule' },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
