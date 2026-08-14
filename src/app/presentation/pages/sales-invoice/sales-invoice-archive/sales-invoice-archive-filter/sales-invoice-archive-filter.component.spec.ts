import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesInvoiceArchiveFilterComponent } from './sales-invoice-archive-filter.component';

describe('SalesInvoiceArchiveFilterComponent', () => {
  let component: SalesInvoiceArchiveFilterComponent;
  let fixture: ComponentFixture<SalesInvoiceArchiveFilterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [SalesInvoiceArchiveFilterComponent]
});
    fixture = TestBed.createComponent(SalesInvoiceArchiveFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
