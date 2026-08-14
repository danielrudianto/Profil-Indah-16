import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesInvoiceArchiveComponent } from './sales-invoice-archive.component';

describe('SalesInvoiceArchiveComponent', () => {
  let component: SalesInvoiceArchiveComponent;
  let fixture: ComponentFixture<SalesInvoiceArchiveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [SalesInvoiceArchiveComponent]
});
    fixture = TestBed.createComponent(SalesInvoiceArchiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
