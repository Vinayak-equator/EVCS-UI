import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargerCreationComponent } from './charger-creation.component';

describe('ChargerCreationComponent', () => {
  let component: ChargerCreationComponent;
  let fixture: ComponentFixture<ChargerCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargerCreationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargerCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
