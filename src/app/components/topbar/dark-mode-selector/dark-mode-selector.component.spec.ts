import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DarkModeSelectorComponent } from './dark-mode-selector.component';

describe('DarkModeSelectorComponent', () => {
  let component: DarkModeSelectorComponent;
  let fixture: ComponentFixture<DarkModeSelectorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [DarkModeSelectorComponent]
});
    fixture = TestBed.createComponent(DarkModeSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
