import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';


import { DynamicFieldDirective } from './../form-elements/dynamic-field.directive'
import { DynamicFormComponent } from './container/dynamic-form.component';
import { MapComponent } from './../form-elements/map/map.component'
import { TextInputComponent } from './../form-elements/text-input/text-input.component'

import { InfoComponent } from './../form-elements/info/info.component'


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule
  ],
  declarations: [
    DynamicFieldDirective,
    DynamicFormComponent,
    MapComponent,
    TextInputComponent,
    InfoComponent
  ],
  exports: [
    DynamicFormComponent
  ],
  entryComponents: [
    MapComponent,
    TextInputComponent
  ]
})
export class DynamicFormModule { }
