import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeSalesChartComponent } from './type-sales-chart.component';

describe('TypeSalesChartComponent', () => {
  let component: TypeSalesChartComponent;
  let fixture: ComponentFixture<TypeSalesChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TypeSalesChartComponent]
    });
    fixture = TestBed.createComponent(TypeSalesChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
