import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { EditGameListPage } from './edit-game-list.page';

import { FileTransfer } from '@ionic-native/file-transfer/ngx';
// import { WebView } from '@ionic-native/ionic-webview/ngx';

const routes: Routes = [
  {
    path: '',
    component: EditGameListPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [EditGameListPage],
  providers: [
    FileTransfer,
    // WebView
  ]
})
export class EditGameListPageModule { }
