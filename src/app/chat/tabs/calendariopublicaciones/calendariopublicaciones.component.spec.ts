import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendariopublicacionesComponent } from './calendariopublicaciones.component';

describe('CalendariopublicacionesComponent', () => {
  let component: CalendariopublicacionesComponent;
  let fixture: ComponentFixture<CalendariopublicacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalendariopublicacionesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendariopublicacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
