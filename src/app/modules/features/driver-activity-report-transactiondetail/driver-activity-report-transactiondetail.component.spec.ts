import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverActivityReportTransactiondetailComponent } from './driver-activity-report-transactiondetail.component';

describe('DriverActivityReportTransactiondetailComponent', () => {
  let component: DriverActivityReportTransactiondetailComponent;
  let fixture: ComponentFixture<DriverActivityReportTransactiondetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DriverActivityReportTransactiondetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverActivityReportTransactiondetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
