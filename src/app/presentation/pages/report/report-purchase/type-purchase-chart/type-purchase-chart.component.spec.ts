import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypePurchaseChartComponent } from './type-purchase-chart.component';

describe('TypePurchaseChartComponent', () => {
  let component: TypePurchaseChartComponent;
  let fixture: ComponentFixture<TypePurchaseChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [TypePurchaseChartComponent]
});
    fixture = TestBed.createComponent(TypePurchaseChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
