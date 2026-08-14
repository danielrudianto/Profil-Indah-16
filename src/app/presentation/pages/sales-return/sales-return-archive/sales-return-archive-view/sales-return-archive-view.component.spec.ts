import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesReturnArchiveViewComponent } from './sales-return-archive-view.component';

describe('SalesReturnArchiveViewComponent', () => {
  let component: SalesReturnArchiveViewComponent;
  let fixture: ComponentFixture<SalesReturnArchiveViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [SalesReturnArchiveViewComponent]
});
    fixture = TestBed.createComponent(SalesReturnArchiveViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
