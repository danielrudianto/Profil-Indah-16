import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseMutationComponent } from './expense-mutation.component';

describe('ExpenseMutationComponent', () => {
  let component: ExpenseMutationComponent;
  let fixture: ComponentFixture<ExpenseMutationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExpenseMutationComponent]
    });
    fixture = TestBed.createComponent(ExpenseMutationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
