import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustmentCaseArchiveFilterComponent } from './adjustment-case-archive-filter.component';

describe('AdjustmentCaseArchiveFilterComponent', () => {
  let component: AdjustmentCaseArchiveFilterComponent;
  let fixture: ComponentFixture<AdjustmentCaseArchiveFilterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [AdjustmentCaseArchiveFilterComponent]
});
    fixture = TestBed.createComponent(AdjustmentCaseArchiveFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
