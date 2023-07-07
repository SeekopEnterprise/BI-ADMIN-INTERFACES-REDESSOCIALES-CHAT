import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IndexComponent } from './index/index.component';

const routes: Routes = [
  {
    path: '',
    component: IndexComponent
  },
  {
    path: ':tabId',
    component: IndexComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes),
    FormsModule, ReactiveFormsModule],
  exports: [RouterModule]
})

export class ChatRoutingModule { }
