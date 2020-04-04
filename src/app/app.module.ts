import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";

import { IonicModule, IonicRouteStrategy } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
// import { StatusBar } from "@ionic-native/status-bar/ngx";

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

import { PhotoUploadComponent } from "./form-elements/photo-upload/photo-upload.component";

import { ReactiveFormsModule, FormsModule } from "@angular/forms";

import {
  DeviceOrientation,
} from "@ionic-native/device-orientation/ngx";

import { DynamicFormModule } from "./dynamic-form/dynamic-form.module";

import { Device } from "@ionic-native/device/ngx";

import { Insomnia } from "@ionic-native/insomnia/ngx";
import { IonicStorageModule } from '@ionic/storage';
import { QuestionTypeComponent } from './pages/create-game/form-elements/question-types/question-type.component'
import { AnswerTypeComponent } from './pages/create-game/form-elements/question-types/answer-type.component'
import { MapComponent } from './pages/create-game/form-elements/map/map.component'


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
    MapComponent,
    // form components ⬆️
    QuestionTypeComponent,
    AnswerTypeComponent
  ],
  exports: [
    
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
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    DeviceOrientation,
    Device,
    Insomnia,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
