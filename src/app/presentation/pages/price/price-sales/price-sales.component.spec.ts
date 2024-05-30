import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceSalesComponent } from './price-sales.component';

describe('PriceSalesComponent', () => {
  let component: PriceSalesComponent;
  let fixture: ComponentFixture<PriceSalesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PriceSalesComponent]
    });
    fixture = TestBed.createComponent(PriceSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
