import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbTooltipModule, NgbDropdownModule, NgbAccordionModule, NgbModalModule, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

import { LightboxModule } from 'ngx-lightbox';


import { ChatRoutingModule } from './chat-routing.module';

import { DatePipe } from '@angular/common';

// Emoji Picker
import { PickerModule } from '@ctrl/ngx-emoji-mart';

// Simplebar

import { IndexComponent } from './index/index.component';
import { TranslateModule } from '@ngx-translate/core';
import { NotificacionesComponent } from './notificaciones/notificaciones/notificaciones.component';

import { NotificacionesService } from '../chat/notificaciones/notificaciones.service';
import { MatDatepickerModule, MatDatepicker } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MainContainerComponent } from './main-container/main-container.component';
import { SideMenuChatComponent } from './main-container/side-menu-chat/side-menu-chat.component';
import { ChatContentComponent } from './main-container/chat-content/chat-content.component';
import { PostByChatComponent } from './main-container/post-by-chat/post-by-chat.component';
import { NbAccordionModule, NbActionsModule, NbCardModule, NbIconModule, NbThemeModule } from '@nebular/theme';
import { CoreModule } from '../core/core.module';
@NgModule({
  declarations: [IndexComponent, NotificacionesComponent, MainContainerComponent, SideMenuChatComponent, ChatContentComponent, PostByChatComponent],
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
    NbIconModule,
    PickerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NbCardModule,
    NbAccordionModule,
    NbActionsModule,
    NbThemeModule.forRoot({ name: 'default' }),
    CoreModule
  ],
  providers: [
    DatePipe,
    NotificacionesService
  ],
  exports: []
})
export class ChatModule { }
