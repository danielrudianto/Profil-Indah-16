import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesDashboardComponent } from './sales-dashboard.component';

describe('SalesDashboardComponent', () => {
  let component: SalesDashboardComponent;
  let fixture: ComponentFixture<SalesDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [SalesDashboardComponent]
});
    fixture = TestBed.createComponent(SalesDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
