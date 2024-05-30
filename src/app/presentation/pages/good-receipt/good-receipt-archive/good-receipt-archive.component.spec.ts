import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoodReceiptArchiveComponent } from './good-receipt-archive.component';

describe('GoodReceiptArchiveComponent', () => {
  let component: GoodReceiptArchiveComponent;
  let fixture: ComponentFixture<GoodReceiptArchiveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GoodReceiptArchiveComponent]
    });
    fixture = TestBed.createComponent(GoodReceiptArchiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
