import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseTypeCreateComponent } from './expense-type-create.component';

describe('ExpenseTypeCreateComponent', () => {
  let component: ExpenseTypeCreateComponent;
  let fixture: ComponentFixture<ExpenseTypeCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExpenseTypeCreateComponent]
    });
    fixture = TestBed.createComponent(ExpenseTypeCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
