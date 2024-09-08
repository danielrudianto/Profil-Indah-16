import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitConfirmationComponent } from './submit-confirmation.component';

describe('SubmitConfirmationComponent', () => {
  let component: SubmitConfirmationComponent;
  let fixture: ComponentFixture<SubmitConfirmationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubmitConfirmationComponent]
    });
    fixture = TestBed.createComponent(SubmitConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
