import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierUpdateComponent } from './supplier-update.component';

describe('SupplierUpdateComponent', () => {
  let component: SupplierUpdateComponent;
  let fixture: ComponentFixture<SupplierUpdateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SupplierUpdateComponent]
    });
    fixture = TestBed.createComponent(SupplierUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
