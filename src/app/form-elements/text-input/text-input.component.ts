import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../dynamic-form/models/field';
import { FieldConfig } from '../../dynamic-form/models/field-config';
import { PopoverController } from '@ionic/angular';
import { PopoverComponent } from 'src/app/popover/popover.component';


@Component({
  selector: 'app-text-input',
  templateUrl: './text-input.component.html',
  styleUrls: ['./text-input.component.scss'],
})
export class TextInputComponent implements Field {
  config: FieldConfig;
  group: FormGroup;

  constructor(public popoverController: PopoverController) { }

  async showPopover(ev: any, text: string) {
    console.log(ev);
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      event: ev,
      translucent: true,
      componentProps: { text }
    });
    return await popover.present();
  }
}
