import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportInadequateComponent } from './report-inadequate.component';

describe('ReportInadequateComponent', () => {
  let component: ReportInadequateComponent;
  let fixture: ComponentFixture<ReportInadequateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [ReportInadequateComponent]
});
    fixture = TestBed.createComponent(ReportInadequateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
