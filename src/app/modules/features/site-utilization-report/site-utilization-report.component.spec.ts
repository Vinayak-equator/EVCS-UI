import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteUtilizationReportComponent } from './site-utilization-report.component';

describe('SiteUtilizationReportComponent', () => {
  let component: SiteUtilizationReportComponent;
  let fixture: ComponentFixture<SiteUtilizationReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteUtilizationReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteUtilizationReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
