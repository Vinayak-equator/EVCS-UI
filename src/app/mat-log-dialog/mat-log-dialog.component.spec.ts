import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatLogDialogComponent } from './mat-log-dialog.component';

describe('MatLogDialogComponent', () => {
  let component: MatLogDialogComponent;
  let fixture: ComponentFixture<MatLogDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MatLogDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MatLogDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
