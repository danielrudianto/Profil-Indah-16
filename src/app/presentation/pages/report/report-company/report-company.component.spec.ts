import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportCompanyComponent } from './report-company.component';

describe('ReportCompanyComponent', () => {
  let component: ReportCompanyComponent;
  let fixture: ComponentFixture<ReportCompanyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [ReportCompanyComponent]
});
    fixture = TestBed.createComponent(ReportCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
