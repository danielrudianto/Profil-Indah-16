import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerSalesChartComponent } from './customer-sales-chart.component';

describe('CustomerSalesChartComponent', () => {
  let component: CustomerSalesChartComponent;
  let fixture: ComponentFixture<CustomerSalesChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomerSalesChartComponent]
    });
    fixture = TestBed.createComponent(CustomerSalesChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
