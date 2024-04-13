import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AppConstants } from '@app/constants';
import { HttpDataService } from '@app/shared/services/http-data.service';
import { RouterExtService } from '@app/shared/services/routerExt.service';
import { TranslateConfigService } from '@app/shared/services/translate-config.service';
import { GridFilterService } from '@app/shared/utility/grid-filter.service';
import { PopUpService } from '@app/shared/utility/popup.service';
import { Location } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import Helper from '@app/shared/utility/Helper';

@Component({
  selector: 'app-driver-activity-report-transactiondetail',
  templateUrl: './driver-activity-report-transactiondetail.component.html',
  styleUrls: ['./driver-activity-report-transactiondetail.component.css']
})
export class DriverActivityReportTransactiondetailComponent implements OnInit {

  dataSource = new MatTableDataSource();
  displayedColumns: string[] = [
    'uniquetransactionid',
    'chargepointid',
    'sitelocation',
    'chargertype',
    'connectorid',
    'connectortype',
    'date',
    'starttime',
    'endtime',
    'meterstart',
    'meterend',
    'unitconsumed',
    //'duration',
    'amount',
  ];
  email: any;
  reporttype: any;
  startDate : any;
  endDate:any;
  process = false;

  @ViewChild(MatPaginator, { static: false })
  set paginator(value: MatPaginator) {
    if (this.dataSource) {
      this.dataSource.paginator = value;
    }
  }
  @ViewChild(MatSort, { static: false })
  set sort(value: MatSort) {
    if (this.dataSource) {
      this.dataSource.sort = value;
    }
  }

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly httpDataService: HttpDataService,
    public translateConfigService: TranslateConfigService,
    public filterService: GridFilterService,
    private router: Router,
    private popUpService: PopUpService,
    public dialog: MatDialog,
    private routerExtService: RouterExtService,
    private location: Location,
    private cdref: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.email = this.routerExtService.getRouteValue(AppConstants.email);
    this.reporttype = this.routerExtService.getRouteValue(AppConstants.reportType);
    this.startDate = this.routerExtService.getRouteValue(AppConstants.startdate);
    this.endDate = this.routerExtService.getRouteValue(AppConstants.enddate);
    this.getReport();
  }

  navigateBack() {
    this.location.back();
  }

  getReport() {
    this.process = true;
    this.dataSource.data = [];

    // Driver Activity Report List API
    this.httpDataService
      .post(AppConstants.APIUrlGetDriverActivityReportTransactionDetail, {
        ReportType: this.reporttype,
        email: this.email,
        startDate: Helper.getFormattedDate(this.startDate),
        endDate: Helper.getFormattedDate(this.endDate),
      })
      .subscribe(
        (res) => {
          this.process = false;
          this.dataSource.data = res.data;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.cdref.detectChanges();        
        },
        (error) => {
          this.process = false;
          console.log(error);
        }
      );

  }
}
