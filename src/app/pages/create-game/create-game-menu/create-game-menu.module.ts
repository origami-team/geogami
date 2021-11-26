import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { CreateGameMenuPage } from './create-game-menu.page';

import { TranslateModule } from '@ngx-translate/core';


const routes: Routes = [
  {
    path: '',
    component: CreateGameMenuPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule
  ],
  declarations: [CreateGameMenuPage]
})
export class CreateGameMenuPageModule {}
