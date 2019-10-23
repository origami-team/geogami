import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';


@Component({
  selector: 'app-info',
  templateUrl: './info.page.html',
  styleUrls: ['./info.page.scss'],
})
export class InfoPage implements OnInit {

  dark: boolean = false

  constructor(private platform: Platform, private statusBar: StatusBar) {
  }

  ngOnInit() {
    this.dark = document.body.classList.contains('dark')
  }

  onDarkThemeChange() {
    document.body.classList.toggle('dark')
    this.dark = !this.dark

    // change status bar
    if (this.dark) {
      this.statusBar.backgroundColorByName('black');
      this.statusBar.styleLightContent();
    } else {
      if (this.platform.is("android")) {
        this.statusBar.backgroundColorByName('white');
      }
      this.statusBar.styleDefault();
    }
  }

}
