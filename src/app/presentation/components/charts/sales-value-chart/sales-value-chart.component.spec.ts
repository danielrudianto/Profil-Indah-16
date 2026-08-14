import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesValueChartComponent } from './sales-value-chart.component';

describe('SalesValueChartComponent', () => {
  let component: SalesValueChartComponent;
  let fixture: ComponentFixture<SalesValueChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [SalesValueChartComponent]
});
    fixture = TestBed.createComponent(SalesValueChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
