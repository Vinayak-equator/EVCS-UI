import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargepointUtilizationReportComponent } from './chargepoint-utilization-report.component';

describe('ChargepointUtilizationReportComponent', () => {
  let component: ChargepointUtilizationReportComponent;
  let fixture: ComponentFixture<ChargepointUtilizationReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargepointUtilizationReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargepointUtilizationReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
