import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasingDashboardComponent } from './purchasing-dashboard.component';

describe('PurchasingDashboardComponent', () => {
  let component: PurchasingDashboardComponent;
  let fixture: ComponentFixture<PurchasingDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PurchasingDashboardComponent]
    });
    fixture = TestBed.createComponent(PurchasingDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
