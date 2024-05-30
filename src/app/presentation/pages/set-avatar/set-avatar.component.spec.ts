import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetAvatarComponent } from './set-avatar.component';

describe('SetAvatarComponent', () => {
  let component: SetAvatarComponent;
  let fixture: ComponentFixture<SetAvatarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SetAvatarComponent]
    });
    fixture = TestBed.createComponent(SetAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
