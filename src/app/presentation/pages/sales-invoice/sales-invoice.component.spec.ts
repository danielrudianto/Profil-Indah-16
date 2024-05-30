import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesInvoiceComponent } from './sales-invoice.component';

describe('SalesInvoiceComponent', () => {
  let component: SalesInvoiceComponent;
  let fixture: ComponentFixture<SalesInvoiceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalesInvoiceComponent]
    });
    fixture = TestBed.createComponent(SalesInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
