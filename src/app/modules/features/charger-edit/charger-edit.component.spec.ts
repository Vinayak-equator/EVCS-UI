import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargerEditComponent } from './charger-edit.component';

describe('ChargerEditComponent', () => {
  let component: ChargerEditComponent;
  let fixture: ComponentFixture<ChargerEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargerEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargerEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
