import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesInvoiceSearchComponent } from './sales-invoice-search.component';

describe('SalesInvoiceSearchComponent', () => {
  let component: SalesInvoiceSearchComponent;
  let fixture: ComponentFixture<SalesInvoiceSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalesInvoiceSearchComponent]
    });
    fixture = TestBed.createComponent(SalesInvoiceSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
