import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesmanSelectorComponent } from './salesman-selector.component';

describe('SalesmanSelectorComponent', () => {
  let component: SalesmanSelectorComponent;
  let fixture: ComponentFixture<SalesmanSelectorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalesmanSelectorComponent]
    });
    fixture = TestBed.createComponent(SalesmanSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
