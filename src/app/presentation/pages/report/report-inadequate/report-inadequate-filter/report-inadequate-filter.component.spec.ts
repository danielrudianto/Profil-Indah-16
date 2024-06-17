import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportInadequateFilterComponent } from './report-inadequate-filter.component';

describe('ReportInadequateFilterComponent', () => {
  let component: ReportInadequateFilterComponent;
  let fixture: ComponentFixture<ReportInadequateFilterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReportInadequateFilterComponent]
    });
    fixture = TestBed.createComponent(ReportInadequateFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
