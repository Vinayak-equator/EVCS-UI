import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartChargingComponent } from './smart-charging.component';

describe('SmartChargingComponent', () => {
  let component: SmartChargingComponent;
  let fixture: ComponentFixture<SmartChargingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmartChargingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartChargingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
