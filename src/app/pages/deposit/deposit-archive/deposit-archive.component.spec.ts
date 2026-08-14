import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepositArchiveComponent } from './deposit-archive.component';

describe('DepositArchiveComponent', () => {
  let component: DepositArchiveComponent;
  let fixture: ComponentFixture<DepositArchiveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [DepositArchiveComponent]
});
    fixture = TestBed.createComponent(DepositArchiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
