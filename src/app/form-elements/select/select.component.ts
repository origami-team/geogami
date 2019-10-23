import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Field } from 'src/app/dynamic-form/models/field';
import { PopoverController } from '@ionic/angular';
import { PopoverComponent } from 'src/app/popover/popover.component';
import { DynamicFormComponent } from 'src/app/dynamic-form/container/dynamic-form.component';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
})
export class SelectComponent implements Field, OnInit, AfterViewInit, OnDestroy {
  config: import("../../dynamic-form/models/field-config").FieldConfig;
  group: import("@angular/forms").FormGroup;

  @ViewChild(DynamicFormComponent, { static: false }) form: DynamicFormComponent;

  selectedQuestionType: any

  constructor(public popoverController: PopoverController) {

  }

  ngOnInit(): void {
    this.selectedQuestionType = this.config.selectOptions[0]

  }

  ngAfterViewInit(): void {
    this.form.changes.subscribe(() => {
      this.group.patchValue({
        [`${this.config.name}`]: {
          ...this.selectedQuestionType,
          settings: this.form.value
        }
      }, { onlySelf: false });
    });

  }

  ngOnDestroy() {
    // this.group.patchValue({
    //   [`${this.config.name}`]: {
    //     ...this.selectedQuestionType,
    //     settings: this.form.value
    //   }
    // }, { onlySelf: false });
    // console.log(this.config, this.form.value, this.group)
  }

  async showPopover(ev: any, text: string) {
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      event: ev,
      translucent: true,
      componentProps: { text }
    });
    return await popover.present();
  }

}
