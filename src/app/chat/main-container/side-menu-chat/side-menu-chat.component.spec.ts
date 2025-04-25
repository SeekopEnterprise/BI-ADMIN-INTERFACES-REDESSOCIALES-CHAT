import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideMenuChatComponent } from './side-menu-chat.component';

describe('SideMenuChatComponent', () => {
  let component: SideMenuChatComponent;
  let fixture: ComponentFixture<SideMenuChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SideMenuChatComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SideMenuChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
