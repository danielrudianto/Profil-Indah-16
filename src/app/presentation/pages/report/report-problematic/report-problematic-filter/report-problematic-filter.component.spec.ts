import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportProblematicFilterComponent } from './report-problematic-filter.component';

describe('ReportProblematicFilterComponent', () => {
  let component: ReportProblematicFilterComponent;
  let fixture: ComponentFixture<ReportProblematicFilterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReportProblematicFilterComponent]
    });
    fixture = TestBed.createComponent(ReportProblematicFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
