import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverpaymentArchiveComponent } from './overpayment-archive.component';

describe('OverpaymentArchiveComponent', () => {
  let component: OverpaymentArchiveComponent;
  let fixture: ComponentFixture<OverpaymentArchiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OverpaymentArchiveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverpaymentArchiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
