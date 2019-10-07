import { Component, Input, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../dynamic-form/models/field';
import { FieldConfig } from '../../dynamic-form/models/field-config';


@Component({
  selector: 'app-text-input',
  templateUrl: './text-input.component.html',
  styleUrls: ['./text-input.component.scss'],
})
export class TextInputComponent implements Field {
  config: FieldConfig;
  group: FormGroup;

  constructor() { }
}
