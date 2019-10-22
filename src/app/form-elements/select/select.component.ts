import { Component, OnInit, ViewChild, AfterViewInit, AfterViewChecked } from '@angular/core';
import { Field } from 'src/app/dynamic-form/models/field';
import { PopoverController } from '@ionic/angular';
import { PopoverComponent } from 'src/app/popover/popover.component';
import { DynamicFormComponent } from 'src/app/dynamic-form/container/dynamic-form.component';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
})
export class SelectComponent implements Field, AfterViewInit {
  config: import("../../dynamic-form/models/field-config").FieldConfig;
  group: import("@angular/forms").FormGroup;

  @ViewChild(DynamicFormComponent, { static: false }) form: DynamicFormComponent;

  selectedQuestionType: any

  constructor(public popoverController: PopoverController) {
    // this.config = this.group.
    // console.log(this.config)
  }

  ngAfterViewInit(): void {
    this.form.changes.subscribe(x => {
      console.log(x);
    })
  }

  async showPopover(ev: any, text: string) {
    this.group.patchValue({ [`${this.config.name}-selection`]: this.form.value });
    console.log(this.form.value, this.group)
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      event: ev,
      translucent: true,
      componentProps: { text }
    });
    return await popover.present();
  }

}
