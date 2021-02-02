import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { Plugins, StatusBarStyle } from '@capacitor/core';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import { AuthService } from './services/auth-service.service';
import { PlayingGamePage } from './pages/play-game/playing-game/playing-game.page';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent {
  constructor(private platform: Platform, private authService: AuthService, private deeplinks: Deeplinks) {
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


      this.deeplinks.route({
        '/play-game/playing-game/:gameID/': PlayingGamePage
      }).subscribe(match => {
        // match.$route - the route we matched, which is the matched entry from the arguments to route()
        // match.$args - the args passed in the link
        // match.$link - the full link data
        console.log('Successfully matched route', match);
      }, nomatch => {
        // nomatch.$link - the full link data
        console.log('Got a deeplink that didn\'t match', nomatch);
      });
    });
  }
}
