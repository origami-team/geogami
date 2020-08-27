import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { BeaconSettingsTabsPage } from './beacon-settings-tabs.page';

const routes: Routes = [
  {
    path: '',
    component: BeaconSettingsTabsPage,
    children: [
      {
        path: '',
        redirectTo: 'stored-beacons',
        pathMatch: 'full'
      },
      {
        path: 'stored-beacons',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../stored-beacons/stored-beacons.module').then(m => m.StoredBeaconsPageModule)
          }
        ]
      },
      {
        path: 'add-beacon',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../add-beacon/add-beacon.module').then(m => m.AddBeaconPageModule)
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [BeaconSettingsTabsPage]
})
export class BeaconSettingsTabsPageModule {}
