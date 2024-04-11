import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintainaceComponent } from './maintainace.component';

describe('MaintainaceComponent', () => {
  let component: MaintainaceComponent;
  let fixture: ComponentFixture<MaintainaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaintainaceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaintainaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
