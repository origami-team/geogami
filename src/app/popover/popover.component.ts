import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-popover',
  template: `
  <ion-content>
    <ng-content></ng-content>
    <p class="ion-padding">
      {{ text }}
    </p>
  </ion-content>
  `,
})
export class PopoverComponent implements OnInit {

  text: string

  constructor() { }

  ngOnInit() {

  }

}
