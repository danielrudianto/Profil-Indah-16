import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivableViewComponent } from './receivable-view.component';

describe('ReceivableViewComponent', () => {
  let component: ReceivableViewComponent;
  let fixture: ComponentFixture<ReceivableViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReceivableViewComponent]
    });
    fixture = TestBed.createComponent(ReceivableViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
