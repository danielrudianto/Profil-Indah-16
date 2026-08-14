import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesReturnCreateComponent } from './sales-return-create.component';

describe('SalesReturnCreateComponent', () => {
  let component: SalesReturnCreateComponent;
  let fixture: ComponentFixture<SalesReturnCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [SalesReturnCreateComponent]
});
    fixture = TestBed.createComponent(SalesReturnCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
