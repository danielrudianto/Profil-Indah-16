import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivableListComponent } from './receivable-list.component';

describe('ReceivableListComponent', () => {
  let component: ReceivableListComponent;
  let fixture: ComponentFixture<ReceivableListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReceivableListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceivableListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
