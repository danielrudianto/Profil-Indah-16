import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportMoneyDorComponent } from './report-money-dor.component';

describe('ReportMoneyDorComponent', () => {
  let component: ReportMoneyDorComponent;
  let fixture: ComponentFixture<ReportMoneyDorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportMoneyDorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportMoneyDorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
