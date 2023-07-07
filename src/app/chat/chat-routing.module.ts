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
    path: 'perfil',
    component: IndexComponent
  },
  {
    path: 'conversaciones',
    component: IndexComponent
  },
  {
    path: 'distribuidores',
    component: IndexComponent
  },
  {
    path: 'redes-sociales',
    component: IndexComponent
  },
  {
    path: 'distribuidores-redes-sociales',
    component: IndexComponent
  },
  {
    path: 'metodos',
    component: IndexComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes),
    FormsModule, ReactiveFormsModule],
  exports: [RouterModule]
})

export class ChatRoutingModule { }
