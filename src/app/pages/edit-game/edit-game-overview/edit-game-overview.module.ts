import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { EditGameOverviewPage } from './edit-game-overview.page';
import { LottieDirectiveModule } from 'src/app/components/lottie/lottie.module';

import { TranslateModule } from '@ngx-translate/core';
import { EditorVisibilityModule } from 'src/app/components/editor-visibility/editor-visibility.module';


const routes: Routes = [
  {
    path: '',
    component: EditGameOverviewPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    LottieDirectiveModule,
    TranslateModule,
    EditorVisibilityModule
  ],
  declarations: [EditGameOverviewPage]
})
export class EditGameOverviewPageModule { }
