import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportMoneyComponent } from './report-money.component';

describe('ReportMoneyComponent', () => {
  let component: ReportMoneyComponent;
  let fixture: ComponentFixture<ReportMoneyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [ReportMoneyComponent]
});
    fixture = TestBed.createComponent(ReportMoneyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
