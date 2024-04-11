import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignUpInvitationComponent } from './sign-up-invitation.component';

describe('SignUpInvitationComponent', () => {
  let component: SignUpInvitationComponent;
  let fixture: ComponentFixture<SignUpInvitationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignUpInvitationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignUpInvitationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
