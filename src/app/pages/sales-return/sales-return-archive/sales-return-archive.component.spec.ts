import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesReturnArchiveComponent } from './sales-return-archive.component';

describe('SalesReturnArchiveComponent', () => {
  let component: SalesReturnArchiveComponent;
  let fixture: ComponentFixture<SalesReturnArchiveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [SalesReturnArchiveComponent]
});
    fixture = TestBed.createComponent(SalesReturnArchiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
