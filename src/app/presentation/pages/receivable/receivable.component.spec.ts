import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivableComponent } from './receivable.component';

describe('ReceivableComponent', () => {
  let component: ReceivableComponent;
  let fixture: ComponentFixture<ReceivableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReceivableComponent]
    });
    fixture = TestBed.createComponent(ReceivableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
