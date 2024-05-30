import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoodReceiptComponent } from './good-receipt.component';

describe('GoodReceiptComponent', () => {
  let component: GoodReceiptComponent;
  let fixture: ComponentFixture<GoodReceiptComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GoodReceiptComponent]
    });
    fixture = TestBed.createComponent(GoodReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
