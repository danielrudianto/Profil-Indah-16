import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircleAvatarComponent } from './circle-avatar.component';

describe('CircleAvatarComponent', () => {
  let component: CircleAvatarComponent;
  let fixture: ComponentFixture<CircleAvatarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CircleAvatarComponent]
    });
    fixture = TestBed.createComponent(CircleAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
