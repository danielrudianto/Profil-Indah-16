import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierPurchaseChartComponent } from './supplier-purchase-chart.component';

describe('SupplierPurchaseChartComponent', () => {
  let component: SupplierPurchaseChartComponent;
  let fixture: ComponentFixture<SupplierPurchaseChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [SupplierPurchaseChartComponent]
});
    fixture = TestBed.createComponent(SupplierPurchaseChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
