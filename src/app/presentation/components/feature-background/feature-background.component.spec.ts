import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureBackgroundComponent } from './feature-background.component';

describe('FeatureBackgroundComponent', () => {
  let component: FeatureBackgroundComponent;
  let fixture: ComponentFixture<FeatureBackgroundComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FeatureBackgroundComponent]
    });
    fixture = TestBed.createComponent(FeatureBackgroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
