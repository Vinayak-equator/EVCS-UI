import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import {
  FormControl,
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import Helper from '@app/shared/utility/Helper';
import { GridFilterService } from '@app/shared/utility/grid-filter.service';
import { AppConstants } from 'src/app/constants';
import { Tenant } from '@app/models/tenant.model';
import { Site } from '@app/models/site.model';
import { ChargePoint } from '@app/models/chargepoint.model';
import { HttpDataService } from '@app/shared/services/http-data.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDeleteDialogComponent } from '@app/mat-delete-dialog/mat-delete-dialog.component';
import{MatLogDialogComponent} from'@app/mat-log-dialog/mat-log-dialog.component';
import { DataService } from '../../../shared/services/data.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TranslateConfigService } from '@app/shared/services/translate-config.service';

@Component({
  selector: 'app-log-management',
  templateUrl: './log-management.component.html',
  styleUrls: ['./log-management.component.css']
})
export class LogManagementComponent implements OnInit {

  logManagementForm: UntypedFormGroup;
  showDeleted = false;
  promoExistErr = false;
  viewRecord = false;
  process = true;
  promocodeId = '';
  promocodeForm: UntypedFormGroup;
  promocodeObj: any = {};
  today = new Date();
  tenantList: any;
  siteList: any;
  pageNumber: number = 0;
  pageSize: number = 10;
  totalCount: number = 0;
  filterPromocode = '';
  chnageicon = 'keyboard_arrow_right';
  tenants: Tenant[];
  sites: Site[];
  chargePoints: ChargePoint[];
  dataSource = new MatTableDataSource();
  selectedValue: string = 'Percentage';
  values: string[] = ['Percentage', 'Flat'];
  displayedColumns: string[] = [
    'chargePointId',
    'connectorId',
    'transactionId',
    'errorMessage',
    // 'errorDescription',
    'errorType',
    'errorDate',
    'severity',
    'errorSource',
    'action' 
  ];
  allTenantSelected = false;
  tenantId: any[];
  routerExtService: any;
  userRole: string;
  tenantName: any;
  isFiltered: any = false;
  isDatepickerDisabled: boolean = false;
  maxDate = new Date();
  selected = 'custom';

  get hasTenantAdmin(): boolean {
    return this.userRole == 'Tenant_Admin';
  }

  // @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatPaginator, { static: true })
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
  errors: string[];
  dialogRef: MatDialogRef<any>;

  constructor(
    public filterService: GridFilterService,
    private cdref: ChangeDetectorRef,
    private readonly formBuilder: UntypedFormBuilder,
    private httpDataService: HttpDataService,
    public dialog: MatDialog,
    public dataService: DataService,
    public router: Router
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.dataSource.filterPredicate = this.filterService.createFilter();
    this.buildFinancialRevenueForm();
    const today = new Date();
    today.setDate(today.getDate());
    this.maxDate = today;
    this.selectDuration('custom');
    this.getTenantNames();
    this.getLogManagement();
  }

  buildFinancialRevenueForm() {
    this.logManagementForm = this.formBuilder.group({
      tenants: [null, [Validators.required]],
      sites: [null, [Validators.required]],
      chargePoints: [null, [Validators.required]],
      selectedErrorType: ['', [Validators.required]],
      selectedSeverity: ['', [Validators.required]],
      selectedSource: ['', [Validators.required]],
      date: [null, [Validators.required]],
      enddate: [null, [Validators.required]],
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageNumber = event.pageIndex;
    this.getLogManagement();
  }

  togglechnage() {
    this.chnageicon =
      this.chnageicon == 'keyboard_arrow_right'
        ? 'keyboard_arrow_down'
        : 'keyboard_arrow_right';
  }

  getFilterLogs() {
    this.isFiltered = true
    this.getLogManagement()
  }

  getLogManagement() {
    this.process = true;
    this.dataSource.data = [];
    let URL = '';
    let startDate = this.logManagementForm.get('date')?.value
        ? Helper.getFormattedDate(this.logManagementForm.get('date')?.value)
        : null;
     let endDate = this.logManagementForm.get('enddate')?.value
        ? Helper.getFormattedDate(this.logManagementForm.get('enddate')?.value)
        : null;
    if (this.isFiltered) {
     let tenant = this.logManagementForm.get('tenants')?.value?.tenantId ? this.logManagementForm.get('tenants')?.value?.tenantId : ''
     let site = this.logManagementForm.get('sites')?.value?.siteId ? this.logManagementForm.get('sites')?.value?.siteId : ''
     let chargePoint = this.logManagementForm.get('chargePoints')?.value?.id ? this.logManagementForm.get('chargePoints')?.value?.id : ''
     this.isFiltered = false
      URL = AppConstants.APIUrlLogManagement + '/' + Number(this.pageNumber + 1) + '/' + this.pageSize + 
            '/' + startDate +
            '/' + endDate +
            '?tenantId=' + tenant + 
            '&siteId=' + site + 
            '&chargePointId=' + chargePoint +
            '&errorType=' +  this.logManagementForm.get('selectedErrorType')?.value +
            '&severity=' +  this.logManagementForm.get('selectedSeverity')?.value +
            '&source=' +  this.logManagementForm.get('selectedSource')?.value +
            '&startDate=' + startDate +
            '&endDate=' + endDate
    } else {
      URL = AppConstants.APIUrlLogManagement + '/' + Number(this.pageNumber + 1) + '/' + this.pageSize +
            '/' + startDate +
            '/' + endDate
    }

    this.httpDataService.get(URL).subscribe((res) => {
      let data: any = [];
      data = res.result 
      this.dataSource.data = data   
      this.totalCount = data[0]?.totalCount
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.cdref.detectChanges();
      this.process = false;
    });
  }

  SortArray(a: Tenant, b: Tenant) {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  }

  resetFilters() {
    this.showDeleted = false;
    this.isFiltered = false; 
    this.logManagementForm.get('selectedErrorType')?.setValue('');
    this.logManagementForm.get('selectedSeverity')?.setValue('');
    this.logManagementForm.get('selectedSource')?.setValue('');
    this.logManagementForm.get('tenants')?.setValue('');
    this.logManagementForm.get('sites')?.setValue('');
    this.logManagementForm.get('chargePoints')?.setValue('');
    this.getLogManagement();
    this.buildFinancialRevenueForm();
    this.selectDuration('custom');
  }

  getTenantNames() {
    return this.httpDataService
      .get(AppConstants.APIUrlTenantNameListtUrl)
      .subscribe((res: Tenant[]) => {
        this.tenants = res.sort(this.SortArray);
        if (this.tenants.length === 1) {
          this.logManagementForm.get('tenants')?.setValue(this.tenants[0]);
          this.tenantSelection();
        }
      });
  }

  tenantSelection() {
    this.sites = [];
    this.getSitesFromTenants();
  }

  getSitesFromTenants() {
    this.sites = [];
    this.httpDataService
      .get(
        AppConstants.APIUrlGetSites +
          this.logManagementForm.get('tenants')?.value.tenantId +
          '/false/1/1000'
      )
      .subscribe((res) => {
        this.sites = res;
        this.logManagementForm.controls['sites'].reset();
        if (this.sites.length === 1) {
          this.logManagementForm.get('sites')?.setValue(this.sites[0]);
          this.siteSelection();
        }
      });
  }

  siteSelection() {
    this.chargePoints = [];
    this.getChargePointsFromSite();
  }

  getChargePointsFromSite() {
    this.chargePoints = [];
      this.httpDataService
      .post(AppConstants.APIUrlSiteToChargePointList ,{
        'tenantId':this.logManagementForm.get('tenants')?.value.tenantId.toString(),
        'siteId':this.logManagementForm.get('sites')?.value.siteId.toString()
      })
      .subscribe((res) => {
        this.chargePoints = res;
        this.logManagementForm.controls['chargePoints'].reset();
        if (this.chargePoints.length === 1) {
          this.logManagementForm.get('chargePoints')?.setValue(this.chargePoints[0]);
        }
      });
  }

  selectErrorType(event: any) {
    this.logManagementForm.get('selectedErrorType')?.setValue(event.value);
  }

  selectSeverity(event: any) {
    this.logManagementForm.get('selectedSeverity')?.setValue(event.value);
  }

  selectSource(event: any) {
    this.logManagementForm.get('selectedSource')?.setValue(event.value);
  }

  selectDuration(event: any) {
    const selectedValue = event.value;
    const currentDate = new Date();
    let startDate: Date;
  
    switch (selectedValue) {
      case 'last30Days':
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 30);
        this.isDatepickerDisabled = true;
        break;
  
      case 'last2Weeks':
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 14);
        this.isDatepickerDisabled = true;
        break;
  
      case 'lastWeek':
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 6);
        this.isDatepickerDisabled = true;
        break;
  
      case 'monthToDate':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        this.isDatepickerDisabled = true;
        break;
  
      case 'yearToDate':
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        this.isDatepickerDisabled = true;
        break;
  
      case 'custom':
        this.logManagementForm.get('date')?.setValue(currentDate);  
        this.isDatepickerDisabled = false;     
        break;

      default :
        this.logManagementForm.get('date')?.setValue(currentDate);  
        this.logManagementForm.get('enddate')?.setValue(currentDate);
        this.isDatepickerDisabled = false;     
        break;
    }
  
    if (startDate) {
      this.logManagementForm.get('date')?.setValue(startDate);
      this.logManagementForm.get('enddate')?.setValue(currentDate);
    }
  }

  getErrDescription(element:any) {
    var error =  element.errorDescription
    this.dialogRef = this.dialog.open(MatLogDialogComponent, {
      width: '450px',
      panelClass: 'confirm-dialog-container',
      data: {
        title: error,
      },
    });
    this.dialogRef.afterClosed().subscribe((result: any) => {
    
      
    });
  }
}
