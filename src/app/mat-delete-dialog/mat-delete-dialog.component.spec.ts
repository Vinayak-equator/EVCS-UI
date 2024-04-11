import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatDeleteDialogComponent } from './mat-delete-dialog.component';

describe('MatDeleteDialogComponent', () => {
  let component: MatDeleteDialogComponent;
  let fixture: ComponentFixture<MatDeleteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MatDeleteDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MatDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
