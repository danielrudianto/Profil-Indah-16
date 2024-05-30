import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoodReceiptCreateComponent } from './good-receipt-create.component';

describe('GoodReceiptCreateComponent', () => {
  let component: GoodReceiptCreateComponent;
  let fixture: ComponentFixture<GoodReceiptCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GoodReceiptCreateComponent]
    });
    fixture = TestBed.createComponent(GoodReceiptCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
