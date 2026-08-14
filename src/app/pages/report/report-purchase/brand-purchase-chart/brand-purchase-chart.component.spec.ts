import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandPurchaseChartComponent } from './brand-purchase-chart.component';

describe('BrandPurchaseChartComponent', () => {
  let component: BrandPurchaseChartComponent;
  let fixture: ComponentFixture<BrandPurchaseChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [BrandPurchaseChartComponent]
});
    fixture = TestBed.createComponent(BrandPurchaseChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
