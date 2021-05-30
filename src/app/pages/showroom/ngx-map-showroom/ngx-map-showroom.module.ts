import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { NGXMapShowroomPage } from './ngx-map-showroom.page';

const routes: Routes = [
  {
    path: '',
    component: NGXMapShowroomPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [NGXMapShowroomPage]
})
export class NGXMapShowroomPageModule {}
