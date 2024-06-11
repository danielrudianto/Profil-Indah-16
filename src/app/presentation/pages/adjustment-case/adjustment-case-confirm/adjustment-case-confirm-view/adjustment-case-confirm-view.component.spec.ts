import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustmentCaseConfirmViewComponent } from './adjustment-case-confirm-view.component';

describe('AdjustmentCaseConfirmViewComponent', () => {
  let component: AdjustmentCaseConfirmViewComponent;
  let fixture: ComponentFixture<AdjustmentCaseConfirmViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdjustmentCaseConfirmViewComponent]
    });
    fixture = TestBed.createComponent(AdjustmentCaseConfirmViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
