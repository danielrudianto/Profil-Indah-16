import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromotionCreateRuleComponent } from './promotion-create-rule.component';

describe('PromotionCreateRuleComponent', () => {
  let component: PromotionCreateRuleComponent;
  let fixture: ComponentFixture<PromotionCreateRuleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PromotionCreateRuleComponent]
    });
    fixture = TestBed.createComponent(PromotionCreateRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
