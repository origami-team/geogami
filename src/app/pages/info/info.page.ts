import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';

import {
  Plugins,
  StatusBarStyle,
} from '@capacitor/core';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-info',
  templateUrl: './info.page.html',
  styleUrls: ['./info.page.scss'],
})
export class InfoPage implements OnInit {

  dark = false;

  constructor(private platform: Platform, public translate: TranslateService) {
    if(translate.getDefaultLang() == undefined)
      translate.setDefaultLang('en');
  }

  ngOnInit() {
    this.dark = document.body.classList.contains('dark');
  }

  onDarkThemeChange() {
    document.body.classList.toggle('dark');
    this.dark = !this.dark;

    // change status bar
    if (this.dark) {
      Plugins.StatusBar.setStyle({ style: StatusBarStyle.Dark });
      if (this.platform.is('android')) {
        Plugins.StatusBar.setBackgroundColor({ color: 'black' });
      }
    } else {
      Plugins.StatusBar.setStyle({ style: StatusBarStyle.Light });
      if (this.platform.is('android')) {
        Plugins.StatusBar.setBackgroundColor({ color: 'white' });
      }
    }
  }

}
