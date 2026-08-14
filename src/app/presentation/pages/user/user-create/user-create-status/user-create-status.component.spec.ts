import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCreateStatusComponent } from './user-create-status.component';

describe('UserCreateStatusComponent', () => {
  let component: UserCreateStatusComponent;
  let fixture: ComponentFixture<UserCreateStatusComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [UserCreateStatusComponent]
});
    fixture = TestBed.createComponent(UserCreateStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
