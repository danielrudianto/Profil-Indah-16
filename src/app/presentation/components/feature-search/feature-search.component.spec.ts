import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureSearchComponent } from './feature-search.component';

describe('FeatureSearchComponent', () => {
  let component: FeatureSearchComponent;
  let fixture: ComponentFixture<FeatureSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [FeatureSearchComponent]
});
    fixture = TestBed.createComponent(FeatureSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
