import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { GameDetailPage } from './game-detail.page';

import { TranslateModule } from '@ngx-translate/core';

import { QrCodeModule } from 'src/app/components/qr-code/qr-code.module';


const routes: Routes = [
  {
    path: '',
    component: GameDetailPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    QrCodeModule
  ],
  declarations: [GameDetailPage]
})
export class GameDetailPageModule {}
