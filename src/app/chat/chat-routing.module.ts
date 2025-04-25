import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IndexComponent } from './index/index.component';
import { MainContainerComponent } from './main-container/main-container.component';

const routes: Routes = [
  {
    path: '',
    component: IndexComponent,
    pathMatch: 'full'
  },
  {
    path: 'refactor',
    component: MainContainerComponent,
    pathMatch: 'full'
  },
  {
    path: ':tab',
    component: MainContainerComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes),
    FormsModule, ReactiveFormsModule],
  exports: [RouterModule]
})

export class ChatRoutingModule { }
