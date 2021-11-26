import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { CreateGameVirtualPage } from './create-game-virtual.page';

import { TranslateModule } from '@ngx-translate/core';


const routes: Routes = [
  {
    path: '',
    component: CreateGameVirtualPage
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
  declarations: [CreateGameVirtualPage]
})
export class CreateGameVirtualPageModule {}