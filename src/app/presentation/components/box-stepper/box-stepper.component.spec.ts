import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxStepperComponent } from './box-stepper.component';

describe('BoxStepperComponent', () => {
  let component: BoxStepperComponent;
  let fixture: ComponentFixture<BoxStepperComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [BoxStepperComponent]
});
    fixture = TestBed.createComponent(BoxStepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
