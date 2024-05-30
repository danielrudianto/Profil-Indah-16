import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureHeaderComponent } from './feature-header.component';

describe('FeatureHeaderComponent', () => {
  let component: FeatureHeaderComponent;
  let fixture: ComponentFixture<FeatureHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FeatureHeaderComponent]
    });
    fixture = TestBed.createComponent(FeatureHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
