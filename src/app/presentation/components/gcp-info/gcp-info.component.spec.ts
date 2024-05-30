import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GcpInfoComponent } from './gcp-info.component';

describe('GcpInfoComponent', () => {
  let component: GcpInfoComponent;
  let fixture: ComponentFixture<GcpInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GcpInfoComponent]
    });
    fixture = TestBed.createComponent(GcpInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
