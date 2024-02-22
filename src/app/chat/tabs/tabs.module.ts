import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { NgbDropdownModule, NgbAccordionModule, NgbModalModule, NgbCollapseModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { CarouselModule } from 'ngx-owl-carousel-o';

import { ProfileComponent } from './profile/profile.component';
import { RedesSocialesComponent } from './redessociales/redessociales.component';
import { SettingsComponent } from './settings/settings.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RedessocialesusuariosComponent } from './redessocialesusuarios/redessocialesusuarios.component';
import { MetodosComponent } from './metodos/metodos.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PublicacionesComponent } from './publicaciones/publicaciones.component';
import { CalendariopublicacionesComponent } from './calendariopublicaciones/calendariopublicaciones.component';

import { MatDatepickerModule, MatDatepicker } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  declarations: [ProfileComponent, RedesSocialesComponent, SettingsComponent, RedessocialesusuariosComponent, MetodosComponent, PublicacionesComponent, CalendariopublicacionesComponent],
  imports: [
    CarouselModule,
    CommonModule,
    NgbDropdownModule,
    NgbAccordionModule,
    PerfectScrollbarModule,
    NgbTooltipModule,
    NgbModalModule,
    NgbCollapseModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    MatDatepickerModule,
    MatNativeDateModule

  ],
  exports: [ProfileComponent, RedesSocialesComponent, SettingsComponent,RedessocialesusuariosComponent,MetodosComponent,PublicacionesComponent,CalendariopublicacionesComponent],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ]
})
export class TabsModule { }
