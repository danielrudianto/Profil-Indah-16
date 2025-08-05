import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockCardViewComponent } from './stock-card-view.component';

describe('StockCardViewComponent', () => {
  let component: StockCardViewComponent;
  let fixture: ComponentFixture<StockCardViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StockCardViewComponent]
    });
    fixture = TestBed.createComponent(StockCardViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
