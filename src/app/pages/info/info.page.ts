import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';

import {
  Plugins,
  StatusBarStyle,
} from '@capacitor/core';


@Component({
  selector: 'app-info',
  templateUrl: './info.page.html',
  styleUrls: ['./info.page.scss'],
})
export class InfoPage implements OnInit {

  dark: boolean = false

  constructor(private platform: Platform) {
  }

  ngOnInit() {
    this.dark = document.body.classList.contains('dark')
  }

  onDarkThemeChange() {
    document.body.classList.toggle('dark')
    this.dark = !this.dark

    // change status bar
    if (this.dark) {
      Plugins.StatusBar.setStyle({ style: StatusBarStyle.Dark })
    } else {
      Plugins.StatusBar.setStyle({ style: StatusBarStyle.Light })
      if (this.platform.is("android")) {
        Plugins.StatusBar.setBackgroundColor({ color: 'white' });
      }
    }
  }

}
