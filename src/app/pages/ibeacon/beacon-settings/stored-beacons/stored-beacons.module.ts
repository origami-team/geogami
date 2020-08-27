import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { StoredBeaconsPage } from './stored-beacons.page';

const routes: Routes = [
  {
    path: '',
    component: StoredBeaconsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [StoredBeaconsPage]
})
export class StoredBeaconsPageModule {}
