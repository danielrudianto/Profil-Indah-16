import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepositArchiveFilterComponent } from './deposit-archive-filter.component';

describe('DepositArchiveFilterComponent', () => {
  let component: DepositArchiveFilterComponent;
  let fixture: ComponentFixture<DepositArchiveFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DepositArchiveFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepositArchiveFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
