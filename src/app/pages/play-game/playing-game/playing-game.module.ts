import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { PlayingGamePage } from "./playing-game.page";
import { LottieAnimationViewModule } from "ng-lottie";
import { NativeAudio } from '@ionic-native/native-audio/ngx';

import { NgShufflePipeModule } from "angular-pipes";

import { File } from '@ionic-native/file/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { KeywordPipe } from 'src/app/pipes/keyword.pipe';

const routes: Routes = [
  {
    path: "",
    component: PlayingGamePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    LottieAnimationViewModule.forRoot(),
    NgShufflePipeModule
  ],
  declarations: [PlayingGamePage, KeywordPipe],
  providers: [
    File, FileTransfer, WebView, NativeAudio
  ]
})
export class PlayingGamePageModule { }
