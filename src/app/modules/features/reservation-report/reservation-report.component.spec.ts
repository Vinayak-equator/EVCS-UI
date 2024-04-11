import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationReportComponent } from './reservation-report.component';

describe('ReservationReportComponent', () => {
  let component: ReservationReportComponent;
  let fixture: ComponentFixture<ReservationReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReservationReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReservationReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
