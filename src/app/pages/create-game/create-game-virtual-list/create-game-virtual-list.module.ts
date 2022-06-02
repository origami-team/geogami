import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { CreateGameVirtualListPage } from './create-game-virtual-list.page';

import { TranslateModule } from '@ngx-translate/core';



const routes: Routes = [
  {
    path: '',
    component: CreateGameVirtualListPage
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
  declarations: [CreateGameVirtualListPage]
})
export class CreateGameVirtualListPageModule {}