import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from '@angular/router';


import { IonicModule } from "@ionic/angular";

import { GameTracksPage } from "./game-tracks.page";
import { TranslateModule } from "@ngx-translate/core";
import { MaterialModule } from "src/app/material.module";
import { downloadTrackDialog } from "../../../components/download-track-dialog/download-track-dialog";

const routes: Routes = [
  {
    path: '',
    component: GameTracksPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    MaterialModule,
  ],
  declarations: [GameTracksPage, downloadTrackDialog],
})
export class GameTracksPageModule {}
