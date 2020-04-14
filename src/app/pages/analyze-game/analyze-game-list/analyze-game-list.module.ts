import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AnalyzeGameListPage } from './analyze-game-list.page';

import { NgxJsonViewerModule } from 'ngx-json-viewer';

const routes: Routes = [
  {
    path: '',
    component: AnalyzeGameListPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    NgxJsonViewerModule
  ],
  declarations: [AnalyzeGameListPage]
})
export class AnalyzeGameListPageModule { }
