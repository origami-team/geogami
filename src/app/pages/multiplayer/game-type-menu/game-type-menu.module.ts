import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GameTypeMenuPageRoutingModule } from './game-type-menu-routing.module';

import { GameTypeMenuPage } from './game-type-menu.page';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GameTypeMenuPageRoutingModule,
    TranslateModule
  ],
  declarations: [GameTypeMenuPage]
})
export class GameTypeMenuPageModule {}
