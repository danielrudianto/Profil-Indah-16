import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesSalesChartComponent } from './sales-sales-chart.component';

describe('SalesSalesChartComponent', () => {
  let component: SalesSalesChartComponent;
  let fixture: ComponentFixture<SalesSalesChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalesSalesChartComponent]
    });
    fixture = TestBed.createComponent(SalesSalesChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
