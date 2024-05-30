import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromotionViewActionComponent } from './promotion-view-action.component';

describe('PromotionViewActionComponent', () => {
  let component: PromotionViewActionComponent;
  let fixture: ComponentFixture<PromotionViewActionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PromotionViewActionComponent]
    });
    fixture = TestBed.createComponent(PromotionViewActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
