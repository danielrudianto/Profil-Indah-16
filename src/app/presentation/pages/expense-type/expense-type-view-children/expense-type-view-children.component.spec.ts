import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseTypeViewChildrenComponent } from './expense-type-view-children.component';

describe('ExpenseTypeViewChildrenComponent', () => {
  let component: ExpenseTypeViewChildrenComponent;
  let fixture: ComponentFixture<ExpenseTypeViewChildrenComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [ExpenseTypeViewChildrenComponent]
});
    fixture = TestBed.createComponent(ExpenseTypeViewChildrenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
