import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportProblematicComponent } from './report-problematic.component';

describe('ReportProblematicComponent', () => {
  let component: ReportProblematicComponent;
  let fixture: ComponentFixture<ReportProblematicComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [ReportProblematicComponent]
});
    fixture = TestBed.createComponent(ReportProblematicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
