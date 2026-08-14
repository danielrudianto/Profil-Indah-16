import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardBottomComponent } from './dashboard-bottom.component';

describe('DashboardBottomComponent', () => {
  let component: DashboardBottomComponent;
  let fixture: ComponentFixture<DashboardBottomComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [DashboardBottomComponent]
});
    fixture = TestBed.createComponent(DashboardBottomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
