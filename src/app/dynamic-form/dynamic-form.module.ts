import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { DynamicFieldDirective } from './../form-elements/dynamic-field.directive'
import { DynamicFormComponent } from './container/dynamic-form.component';
// import { FormButtonComponent } from './components/form-button/form-button.component';
// import { FormInputComponent } from './components/form-input/form-input.component';
import { MapComponent } from './../form-elements/map/map.component'
import { TextInputComponent } from './../form-elements/text-input/text-input.component'


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  declarations: [
    DynamicFieldDirective,
    DynamicFormComponent,
    MapComponent,
    TextInputComponent
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
