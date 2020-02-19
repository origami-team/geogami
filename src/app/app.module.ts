import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";

import { IonicModule, IonicRouteStrategy } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { HttpClientModule, HttpClient } from "@angular/common/http";

import { ServiceWorkerModule } from "@angular/service-worker";
import { environment } from "../environments/environment";

import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

import { PopoverComponent } from "./popover/popover.component";

// Modals
import { CreateTaskModalPage } from "./pages/create-game/create-task-modal/create-task-modal.page";
import { CreateModuleModalPage } from "./pages/create-game/create-module-modal/create-module-modal.page";
import { MapFeaturesModalPage } from "./pages/create-game/map-features-modal/map-features-modal.page";
import { CreateInfoModalComponent } from "./pages/create-game/create-info-modal/create-info-modal.component";

import { CameraComponent } from "./form-elements/camera/camera.component";

import { PhotoUploadComponent } from "./form-elements/photo-upload/photo-upload.component";

import { Geolocation } from "@ionic-native/geolocation/ngx";

import { Camera } from "@ionic-native/camera/ngx";

import { ReactiveFormsModule, FormsModule } from "@angular/forms";

import {
  DeviceOrientation,
} from "@ionic-native/device-orientation/ngx";

import { DynamicFormModule } from "./dynamic-form/dynamic-form.module";

import { Device } from "@ionic-native/device/ngx";

import { Insomnia } from "@ionic-native/insomnia/ngx";
import { Vibration } from "@ionic-native/vibration/ngx";
import { IonicStorageModule } from '@ionic/storage';


// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

@NgModule({
  declarations: [
    AppComponent,
    PopoverComponent,
    CreateTaskModalPage,
    MapFeaturesModalPage,
    CreateModuleModalPage,
    CreateInfoModalComponent,
    PhotoUploadComponent,
    // form components ⬇️
    // InfoComponent,
    // TextInputComponent,
    // MapComponent,
    CameraComponent
    // form components ⬆️
  ],
  entryComponents: [
    PopoverComponent,
    CreateTaskModalPage,
    MapFeaturesModalPage,
    CreateModuleModalPage,
    CreateInfoModalComponent
  ],
  imports: [
    DynamicFormModule,
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    ServiceWorkerModule.register("ngsw-worker.js", {
      enabled: environment.production
    }),
    IonicStorageModule.forRoot({
      driverOrder: ['localstorage', 'indexeddb']
    })
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    Geolocation,
    // Geofence,
    Camera,
    DeviceOrientation,
    Device,
    Insomnia,
    Vibration
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
