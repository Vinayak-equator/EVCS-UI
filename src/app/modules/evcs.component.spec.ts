import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantUserComponent } from './evcs.component';

describe('TenantUserComponent', () => {
  let component: TenantUserComponent;
  let fixture: ComponentFixture<TenantUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TenantUserComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TenantUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
