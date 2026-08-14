import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepositViewComponent } from './deposit-view.component';

describe('DepositViewComponent', () => {
  let component: DepositViewComponent;
  let fixture: ComponentFixture<DepositViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [DepositViewComponent]
});
    fixture = TestBed.createComponent(DepositViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
