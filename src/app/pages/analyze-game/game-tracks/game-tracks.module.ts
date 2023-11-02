import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { GameTracksPageRoutingModule } from "./game-tracks-routing.module";

import { GameTracksPage } from "./game-tracks.page";
import { TranslateModule } from "@ngx-translate/core";
import { MaterialModule } from "src/app/material.module";
import { downloadTrackDialog } from "../../../components/download-track-dialog/download-track-dialog";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GameTracksPageRoutingModule,
    TranslateModule,
    MaterialModule,
  ],
  declarations: [GameTracksPage, downloadTrackDialog],
})
export class GameTracksPageModule {}
