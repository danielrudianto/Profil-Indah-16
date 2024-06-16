import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesReturnArchiveFilterComponent } from './sales-return-archive-filter.component';

describe('SalesReturnArchiveFilterComponent', () => {
  let component: SalesReturnArchiveFilterComponent;
  let fixture: ComponentFixture<SalesReturnArchiveFilterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalesReturnArchiveFilterComponent]
    });
    fixture = TestBed.createComponent(SalesReturnArchiveFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
