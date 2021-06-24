import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { NGXMapShowroomPage } from './ngx-map-showroom.page';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';
import { environment } from 'src/environments/environment';
import {GeolocateControlComponent} from 'src/app/mapControllers/geolocate-control';
import {MapImageControlComponent} from 'src/app/mapControllers/image-control';

const routes: Routes = [
  {
    path: '',
    component: NGXMapShowroomPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    NgxMapboxGLModule.withConfig({
      accessToken: environment.mapboxAccessToken, // Optional, can also be set per map (accessToken input of mgl-map)
      //geocoderAccessToken: 'TOKEN' // Optional, specify if different from the map access token, can also be set per mgl-geocoder (accessToken input of mgl-geocoder)
    })
  ],
  declarations: [NGXMapShowroomPage,GeolocateControlComponent, MapImageControlComponent]
})
export class NGXMapShowroomPageModule {}
