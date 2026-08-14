import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustmentCaseViewComponent } from './adjustment-case-view.component';

describe('AdjustmentCaseViewComponent', () => {
  let component: AdjustmentCaseViewComponent;
  let fixture: ComponentFixture<AdjustmentCaseViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [AdjustmentCaseViewComponent]
});
    fixture = TestBed.createComponent(AdjustmentCaseViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
