import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { Plugins, StatusBarStyle, registerWebPlugin } from '@capacitor/core';
import { OAuth2Client } from '@byteowls/capacitor-oauth2';
import { AuthService } from './services/auth-service.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent {
  constructor(private platform: Platform, private authService: AuthService) {
    this.initializeApp();

    if (window.localStorage.getItem('bg_refreshtoken'))
      this.authService.recoverSession(
        window.localStorage.getItem('bg_refreshtoken')
      );
  }

  initializeApp() {
    this.platform.ready().then(() => {
      Plugins.StatusBar.setStyle({ style: StatusBarStyle.Light }).catch((err) =>
        console.log(err)
      );
      if (this.platform.is('android')) {
        Plugins.StatusBar.setBackgroundColor({ color: 'white' });
      }

      registerWebPlugin(OAuth2Client);
    });
  }
}
