import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
// import { SplashScreen } from '@ionic-native/splash-screen/ngx';
// import { StatusBar } from '@ionic-native/status-bar/ngx';
import {
  Plugins,
  StatusBarStyle,
} from '@capacitor/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    // private splashScreen: SplashScreen,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      
      Plugins.StatusBar.setStyle({ style: StatusBarStyle.Light })
      if (this.platform.is("android")) {
        Plugins.StatusBar.setBackgroundColor({ color: 'white' });
      }
      
      // if (this.platform.is("android")) {
      //   Plugins.StatusBar.setStyle({style: StatusBarStyle.Dark})
      //   this.statusBar.styleDefault();
      // } else {
      //   this.statusBar.styleDefault();
      // }
      // this.splashScreen.hide();
    });
  }
}
