import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandSalesChartComponent } from './brand-sales-chart.component';

describe('BrandSalesChartComponent', () => {
  let component: BrandSalesChartComponent;
  let fixture: ComponentFixture<BrandSalesChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [BrandSalesChartComponent]
});
    fixture = TestBed.createComponent(BrandSalesChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
