import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { TrackingPopoverComponent } from './tracking-popover/tracking-popover.component';
import { CreateTaskModalPage } from './pages/create-game/create-task-modal/create-task-modal.page'

import { CreateModuleModalPage } from './pages/create-game/create-module-modal/create-module-modal.page'

import { InfoComponent } from './form-elements/info/info.component'
import { TextInputComponent } from './form-elements/text-input/text-input.component'
import { MapComponent } from './form-elements/map/map.component'


import { Geolocation } from '@ionic-native/geolocation/ngx';
// import { Geofence } from '@ionic-native/geofence/ngx';


import { Camera } from '@ionic-native/camera/ngx';

import { FormsModule } from '@angular/forms';



// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}


@NgModule({
  declarations: [
    AppComponent,
    TrackingPopoverComponent,
    CreateTaskModalPage,
    CreateModuleModalPage,
    // form components ⬇️
    InfoComponent,
    TextInputComponent,
    MapComponent,
    // form components ⬆️
  ],
  entryComponents: [TrackingPopoverComponent, CreateTaskModalPage, CreateModuleModalPage],
  imports: [BrowserModule,
    HttpClientModule,
    FormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    IonicModule.forRoot(), AppRoutingModule, HttpClientModule, ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    Geolocation,
    // Geofence,
    Camera
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
