import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { CreateGameListPage } from './create-game-list.page';

import { TranslateModule } from '@ngx-translate/core';
import { EnvTypeQuestionTextModule } from 'src/app/components/env-type-question-text/env-type-question-text.module';


const routes: Routes = [
  {
    path: '',
    component: CreateGameListPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    EnvTypeQuestionTextModule
  ],
  declarations: [CreateGameListPage],
  providers: []
})
export class CreateGameListPageModule { }
