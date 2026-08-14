import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverpaymentArchiveViewComponent } from './overpayment-archive-view.component';

describe('OverpaymentArchiveViewComponent', () => {
  let component: OverpaymentArchiveViewComponent;
  let fixture: ComponentFixture<OverpaymentArchiveViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [OverpaymentArchiveViewComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(OverpaymentArchiveViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
