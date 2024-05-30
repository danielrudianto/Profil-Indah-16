import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustmentCaseComponent } from './adjustment-case.component';

describe('AdjustmentCaseComponent', () => {
  let component: AdjustmentCaseComponent;
  let fixture: ComponentFixture<AdjustmentCaseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdjustmentCaseComponent]
    });
    fixture = TestBed.createComponent(AdjustmentCaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
