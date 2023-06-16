import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedessocialesusuariosComponent } from './redessocialesusuarios.component';

describe('RedessocialesusuariosComponent', () => {
  let component: RedessocialesusuariosComponent;
  let fixture: ComponentFixture<RedessocialesusuariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RedessocialesusuariosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RedessocialesusuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
