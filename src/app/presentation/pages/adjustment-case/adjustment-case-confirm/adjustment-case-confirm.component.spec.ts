import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustmentCaseConfirmComponent } from './adjustment-case-confirm.component';

describe('AdjustmentCaseConfirmComponent', () => {
  let component: AdjustmentCaseConfirmComponent;
  let fixture: ComponentFixture<AdjustmentCaseConfirmComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdjustmentCaseConfirmComponent]
    });
    fixture = TestBed.createComponent(AdjustmentCaseConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
