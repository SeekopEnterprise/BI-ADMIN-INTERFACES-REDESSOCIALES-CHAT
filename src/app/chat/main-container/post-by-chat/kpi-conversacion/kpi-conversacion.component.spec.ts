import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiConversacionComponent } from './kpi-conversacion.component';

describe('KpiConversacionComponent', () => {
  let component: KpiConversacionComponent;
  let fixture: ComponentFixture<KpiConversacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KpiConversacionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KpiConversacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
