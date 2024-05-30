import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralDashboardComponent } from './general-dashboard.component';

describe('GeneralDashboardComponent', () => {
  let component: GeneralDashboardComponent;
  let fixture: ComponentFixture<GeneralDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GeneralDashboardComponent]
    });
    fixture = TestBed.createComponent(GeneralDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
