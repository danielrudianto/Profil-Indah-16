import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesInvoiceCreateComponent } from './sales-invoice-create.component';

describe('SalesInvoiceCreateComponent', () => {
  let component: SalesInvoiceCreateComponent;
  let fixture: ComponentFixture<SalesInvoiceCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalesInvoiceCreateComponent]
    });
    fixture = TestBed.createComponent(SalesInvoiceCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
