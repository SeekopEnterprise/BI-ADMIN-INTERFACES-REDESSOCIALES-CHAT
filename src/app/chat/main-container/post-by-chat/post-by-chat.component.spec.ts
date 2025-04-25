import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostByChatComponent } from './post-by-chat.component';

describe('PostByChatComponent', () => {
  let component: PostByChatComponent;
  let fixture: ComponentFixture<PostByChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostByChatComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostByChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
