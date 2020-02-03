import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TaskShowroomPage } from './task-showroom.page';

const routes: Routes = [
  {
    path: '',
    component: TaskShowroomPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [TaskShowroomPage]
})
export class TaskShowroomPageModule {}
