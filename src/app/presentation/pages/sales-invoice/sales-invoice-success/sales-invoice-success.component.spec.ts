import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesInvoiceSuccessComponent } from './sales-invoice-success.component';

describe('SalesInvoiceSuccessComponent', () => {
  let component: SalesInvoiceSuccessComponent;
  let fixture: ComponentFixture<SalesInvoiceSuccessComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalesInvoiceSuccessComponent]
    });
    fixture = TestBed.createComponent(SalesInvoiceSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
