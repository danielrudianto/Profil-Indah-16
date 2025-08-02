import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoodReceiptViewComponent } from './good-receipt-view.component';

describe('GoodReceiptViewComponent', () => {
  let component: GoodReceiptViewComponent;
  let fixture: ComponentFixture<GoodReceiptViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GoodReceiptViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoodReceiptViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
