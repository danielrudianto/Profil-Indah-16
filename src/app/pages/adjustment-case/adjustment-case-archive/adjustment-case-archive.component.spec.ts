import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustmentCaseArchiveComponent } from './adjustment-case-archive.component';

describe('AdjustmentCaseArchiveComponent', () => {
  let component: AdjustmentCaseArchiveComponent;
  let fixture: ComponentFixture<AdjustmentCaseArchiveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [AdjustmentCaseArchiveComponent]
});
    fixture = TestBed.createComponent(AdjustmentCaseArchiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
