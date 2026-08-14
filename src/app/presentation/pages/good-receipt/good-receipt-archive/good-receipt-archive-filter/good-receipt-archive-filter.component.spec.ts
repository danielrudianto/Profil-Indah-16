import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoodReceiptArchiveFilterComponent } from './good-receipt-archive-filter.component';

describe('GoodReceiptArchiveFilterComponent', () => {
  let component: GoodReceiptArchiveFilterComponent;
  let fixture: ComponentFixture<GoodReceiptArchiveFilterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [GoodReceiptArchiveFilterComponent]
});
    fixture = TestBed.createComponent(GoodReceiptArchiveFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
