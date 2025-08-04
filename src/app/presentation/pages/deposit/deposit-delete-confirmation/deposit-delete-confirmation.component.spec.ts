import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepositDeleteConfirmationComponent } from './deposit-delete-confirmation.component';

describe('DepositDeleteConfirmationComponent', () => {
  let component: DepositDeleteConfirmationComponent;
  let fixture: ComponentFixture<DepositDeleteConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DepositDeleteConfirmationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepositDeleteConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
