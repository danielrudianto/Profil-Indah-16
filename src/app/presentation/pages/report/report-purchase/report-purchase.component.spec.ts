import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportPurchaseComponent } from './report-purchase.component';

describe('ReportPurchaseComponent', () => {
  let component: ReportPurchaseComponent;
  let fixture: ComponentFixture<ReportPurchaseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReportPurchaseComponent]
    });
    fixture = TestBed.createComponent(ReportPurchaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
