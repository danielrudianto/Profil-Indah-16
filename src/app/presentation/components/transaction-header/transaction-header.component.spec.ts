import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionHeaderComponent } from './transaction-header.component';

describe('TransactionHeaderComponent', () => {
  let component: TransactionHeaderComponent;
  let fixture: ComponentFixture<TransactionHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TransactionHeaderComponent]
    });
    fixture = TestBed.createComponent(TransactionHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
