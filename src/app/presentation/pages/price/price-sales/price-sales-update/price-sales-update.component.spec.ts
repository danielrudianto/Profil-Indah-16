import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceSalesUpdateComponent } from './price-sales-update.component';

describe('PriceSalesUpdateComponent', () => {
  let component: PriceSalesUpdateComponent;
  let fixture: ComponentFixture<PriceSalesUpdateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PriceSalesUpdateComponent]
    });
    fixture = TestBed.createComponent(PriceSalesUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
