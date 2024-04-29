import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PlayingVirenvPageRoutingModule } from './playing-virenv-routing.module';

import { PlayingVirenvPage } from './playing-virenv.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PlayingVirenvPageRoutingModule
  ],
  declarations: [PlayingVirenvPage]
})
export class PlayingVirenvPageModule {}
