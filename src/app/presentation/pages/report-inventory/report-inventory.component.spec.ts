import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportInventoryComponent } from './report-inventory.component';

describe('ReportInventoryComponent', () => {
  let component: ReportInventoryComponent;
  let fixture: ComponentFixture<ReportInventoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReportInventoryComponent]
    });
    fixture = TestBed.createComponent(ReportInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
