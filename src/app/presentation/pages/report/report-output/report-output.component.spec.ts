import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportOutputComponent } from './report-output.component';

describe('ReportOutputComponent', () => {
  let component: ReportOutputComponent;
  let fixture: ComponentFixture<ReportOutputComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [ReportOutputComponent]
});
    fixture = TestBed.createComponent(ReportOutputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
