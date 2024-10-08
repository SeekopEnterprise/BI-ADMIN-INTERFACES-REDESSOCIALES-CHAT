import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbTooltipModule, NgbDropdownModule, NgbAccordionModule, NgbModalModule, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

import { LightboxModule } from 'ngx-lightbox';


import { ChatRoutingModule } from './chat-routing.module';

import {DatePipe} from '@angular/common';

// Emoji Picker
import { PickerModule } from '@ctrl/ngx-emoji-mart';

// Simplebar
import { SimplebarAngularModule } from 'simplebar-angular';

import { IndexComponent } from './index/index.component';
import { TranslateModule } from '@ngx-translate/core';
import { NotificacionesComponent } from './notificaciones/notificaciones/notificaciones.component';

import { NotificacionesService } from '../chat/notificaciones/notificaciones.service';
import { MatDatepickerModule, MatDatepicker } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
@NgModule({
  declarations: [IndexComponent, NotificacionesComponent],
  imports: [
    PerfectScrollbarModule,
    LightboxModule,
    NgbAccordionModule,
    NgbModalModule,
    NgbCollapseModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ChatRoutingModule,
    NgbTooltipModule,
    NgbDropdownModule,
    TranslateModule,
    SimplebarAngularModule,
    PickerModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [
    DatePipe,
    NotificacionesService
  ],
  exports: []
})
export class ChatModule { }
