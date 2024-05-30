import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustmentCaseCreateComponent } from './adjustment-case-create.component';

describe('AdjustmentCaseCreateComponent', () => {
  let component: AdjustmentCaseCreateComponent;
  let fixture: ComponentFixture<AdjustmentCaseCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdjustmentCaseCreateComponent]
    });
    fixture = TestBed.createComponent(AdjustmentCaseCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
