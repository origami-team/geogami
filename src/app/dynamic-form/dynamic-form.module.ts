import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';


import { DynamicFieldDirective } from './../form-elements/dynamic-field.directive'
import { DynamicFormComponent } from './container/dynamic-form.component';
import { MapComponent } from './../form-elements/map/map.component'
import { TextInputComponent } from './../form-elements/text-input/text-input.component'

import { InfoComponent } from './../form-elements/info/info.component'

import { FormsModule } from '@angular/forms';
import { SelectComponent } from '../form-elements/select/select.component';
import { PhotoUploadComponent } from '../form-elements/photo-upload/photo-upload.component';
import { PhotoUploadMultipleChoiceComponent } from '../form-elements/photo-upload-multiple-choice/photo-upload-multiple-choice.component';

import { File } from '@ionic-native/file/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    FormsModule
  ],
  declarations: [
    DynamicFieldDirective,
    DynamicFormComponent,
    MapComponent,
    TextInputComponent,
    InfoComponent,
    SelectComponent,
    // PhotoUploadComponent,
    PhotoUploadMultipleChoiceComponent
  ],
  exports: [
    DynamicFormComponent
  ],
  entryComponents: [
    MapComponent,
    TextInputComponent,
    SelectComponent,
    PhotoUploadComponent,
    PhotoUploadMultipleChoiceComponent
  ],
  providers: [
    File, FileTransfer, WebView
  ]
})
export class DynamicFormModule { }
