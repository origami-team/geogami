import { Component, OnInit } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-tracking-popover',
  templateUrl: './tracking-popover.component.html',
  styleUrls: ['./tracking-popover.component.scss'],
})
export class TrackingPopoverComponent implements OnInit {

  gameTrackingDescription: String

  constructor(private _translate: TranslateService) { }

  ngOnInit() {
    this._translate.get('gameTrackingDescription').subscribe((res: string) => {
      this.gameTrackingDescription = res;
    });
  }

}
