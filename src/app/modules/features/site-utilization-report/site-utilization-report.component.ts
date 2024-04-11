import { HttpDataService } from '@app/shared/services/http-data.service';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { MatSort } from '@angular/material/sort';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ChartDataset as ChartDataSets, ChartOptions,Color } from 'chart.js';
//import { Color, Label } from 'ng2-charts';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';



import {  ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';

import { Router } from '@angular/router';
import { Tenant } from '@app/models/tenant.model';

import { PopUpService } from '@app/shared/utility/popup.service';
import { SiteList } from '@app/models/sitelist.model';
import { ChargePoint } from '@app/models/chargepoint.model';
import { Transaction } from '@app/models/transaction.model';
import { TranslateService } from '@ngx-translate/core';
import { TranslateConfigService } from '@app/shared/services/translate-config.service';
import { GridFilterService } from '@app/shared/utility/grid-filter.service';
import { map, startWith } from 'rxjs/operators';
import { RouterExtService } from '@app/shared/services/routerExt.service';
import Helper from '@app/shared/utility/Helper';
import { AppConstants } from '@app/constants';
type Label = string;
@Component({
  selector: 'app-site-utilization-report',
  templateUrl: './site-utilization-report.component.html',
  styleUrls: ['./site-utilization-report.component.css']
})
export class SiteUtilizationReportComponent implements OnInit {

  SiteUtilizationForm: UntypedFormGroup;
  userRole: string;
  process = false;
  process1 = true
  maxDate = new Date();
  userCount: any = '';
  totalUserCount: any = '';
  startDate: any = '';
  endDate: any = '';
  dataSource = new MatTableDataSource();
  isDatepickerDisabled: boolean = false;
  selected = 'custom';
  FilterType: any = 'Daily';
  hideDaily: boolean = false;
  showsection = false
  hideWeekly: boolean = false;
  hideMonthly: boolean = false;
  hideQuarterly: boolean = false;
  ShowChart: boolean = true;
  tenantName: any;

  statewiseSiteUtilizationchartData: ChartDataSets[] = [];
  statewiseSiteUtilizationchartLabel: Label[] = [];
  statewiseSiteUtilizationchartLegend = true;
  statewiseSiteUtilizationOptions: ChartOptions = {
    responsive: true,
  };
  statewiseSiteUtilizationchartColors: Color[] = [
   
  ];
  statewiseSiteUtilizationchartPlugins: any = [];

  citywiseSiteUtilizationchartData: ChartDataSets[] = [];
  citywiseSiteUtilizationchartLabel: Label[] = [];
  citywiseSiteUtilizationchartLegend = true;
  citywiseSiteUtilizationOptions: ChartOptions = {
    responsive: true,
  };
  citywiseSiteUtilizationchartColors: Color[] = [
    
  ];
  citywiseSiteUtilizationchartPlugins: any = [];

  tenantCount: number; 
  sitesCount: number;
  chargePointsCount: number;
  tenantId: any;
  siteId: any;
  chargePointId: any;
  tenants: Tenant[];
  sites: SiteList[];
  chargePoints: ChargePoint[];
  transactionList: Transaction[];
  transactionData: Transaction;
  data: {};
  panelOpenState = true;
  popUpData: string;
  selectedTenant: string = '';
  selectedSite: string = '';
  tenantList: any;
  siteList: any;
  @Input() max: any;
  allTenantSelected = false;
  allSiteSelected = false;
  allChargePointSelected = false;
  //Grid columns
  filterSelectObj = [
    {
      name: 'transactionId',
      columnProp: 'transactionId',
      type: 'text',
      options: [] as string[],
      modelValue: ''
    },
    {
      name: 'id',
      columnProp: 'id',
      type: 'text',
      options: [] as string[],
      modelValue: ''
    }, {
      name: 'status',
      columnProp: 'status',
      type: 'text',
      options: [] as string[],
      modelValue: ''
    }, {
      name: 'start Time',
      columnProp: 'startTime',
      type: 'number',
      options: [] as string[],
      modelValue: ''
    }, {
      name: 'stop Time',
      columnProp: 'stopTime',
      type: 'number',
      options: [] as string[],
      modelValue: ''
    }, {
      name: 'meter Start',
      columnProp: 'meterStart',
      type: 'text',
      options: [] as string[],
      modelValue: ''
    }, {
      name: 'meter Stop',
      columnProp: 'meterStop',
      type: 'text',
      options: [] as string[],
      modelValue: ''
    }, {
      name: 'amount',
      columnProp: 'amount',
      type: 'text',
      options: [] as string[],
      modelValue: ''
    }
  ];
  selectedTenantId: any = '';
  selectedSiteId: any = '';
  selectedDate: any;
  selectedendDate: any;
  
  filterValues: any = {};

  transactionIdControl = new UntypedFormControl();
  filteredByTransactionId: Observable<string[]>;
  transactionId: any[];
  transactionIdValues: any[];

  transactionLogIdControl = new UntypedFormControl();
  filteredByTransactionLogId: Observable<string[]>;
  transactionLogId: any[];
  transactionLogIdValues: any[];

  statusControl = new UntypedFormControl();
  filteredByStatus: Observable<string[]>;
  statusValues: any[];
  status: any[];

  startTimeControl = new UntypedFormControl();
  filteredByStartTime: Observable<string[]>;
  startTimeValues: any[];
  startTime: any[];

  stopTimeControl = new UntypedFormControl();
  filteredByStopTime: Observable<string[]>;
  stopTimeValues: any[];
  stopTime: any[];

  meterStartControl = new UntypedFormControl();
  filteredByMeterStart: Observable<string[]>;
  meterStartValues: any[];
  meterStart: any[];

  meterStopControl = new UntypedFormControl();
  filteredByMeterStop: Observable<string[]>;
  meterStopValues: any[];
  meterStop: any[];


  get hasTenantAdmin(): boolean {
    return this.userRole == 'Tenant_Admin';
  }

  private _filter(value: string, input: string[]): string[] {
    const filterValue = value.toString().toLowerCase();

    return input?.filter(v => v?.toString().toLowerCase().indexOf(filterValue) === 0);
  }




  
  displayedColumns: string[] = ['customerId', 'siteAddress', 'chargePointId', 'chargerType', 'chargingRate','nooftransactions','totalUtilization','totalAmount','totalFailedTransactions'];

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

  



  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }



  
  constructor(private readonly formBuilder: UntypedFormBuilder, private httpDataService: HttpDataService,
    private translate: TranslateService, public translateConfigService: TranslateConfigService, public filterService: GridFilterService,
    private router: Router, private popUpService: PopUpService,    private cdref: ChangeDetectorRef,

    private routerExtService: RouterExtService) {

    this.transactionList = new Array<Transaction>()
  }

  Genratechart(){
    this.getReport();
    //this.selectDuration(this.selected)
        // console.log(this.selected)
  }
  ngOnInit(): void {
     if (this.selected === 'custom') {
       const currentDate = new Date();
       let startDate = new Date(currentDate);
       startDate.setDate(currentDate.getDate() - 1);
       this.FilterType = 'Daily';
       this.startDate = startDate;
       this.endDate = new Date(currentDate);      
       //this.getReport();
    }
    this.maxDate.setDate(this.maxDate.getDate());
    this.dataSource.data = [];
    this.buildTransactionForm();
    this.getTenantNames();
    this.translateConfigService.localEvent.subscribe(data => {
      this.translator();
    });
    
    // Retain the previous result.
    this.restoreTransactionList();

  }

  translator() {
    this.translate.get('singleBinding.itemPage').subscribe(data => {
      this.paginator._intl.itemsPerPageLabel = data;
      this.paginator.ngOnInit();
    });
  }

  Clear(){
    this.SiteUtilizationForm.controls['tenantName'].reset();
    this.SiteUtilizationForm.controls['siteName'].reset();
    this.SiteUtilizationForm.controls['chargePointName'].reset();
  }


  getTenantNames() {
    return this.httpDataService.get(AppConstants.APIUrlTenantNameListtUrl).subscribe((res: Tenant[]) => {
      this.tenants = res.sort(this.SortArray);
    });
  }


  SortArray(a: Tenant, b: Tenant) {
    if (a.name < b.name) { return -1; }
    if (a.name > b.name) { return 1; }

    return 0;
  }

  restoreTransactionList() {
    // if (!Helper.isNullOrEmpty(this.routerExtService.getRouteValue(AppConstants.TenantID))
    //   && !Helper.isNullOrEmpty(this.routerExtService.getRouteValue(AppConstants.SiteID))
    //   && !Helper.isNullOrEmpty(this.routerExtService.getRouteValue('TransactionDate'))) {
        //commented by SK
      //this.selectedTenantId = this.routerExtService.getRouteValue(AppConstants.TenantID);
      //this.tenantSelection(this.selectedTenantId);
      //this.selectedSiteId = this.routerExtService.getRouteValue(AppConstants.SiteID);
      this.selectedDate = this.routerExtService.getRouteValue('TransactionDate') ? this.routerExtService.getRouteValue('TransactionDate') : new Date();
      this.selectedendDate = this.routerExtService.getRouteValue('TransactionEndDate') ? this.routerExtService.getRouteValue('TransactionEndDate') : new Date();
      var tenantnames=this.routerExtService.getRouteValue(AppConstants.TenantID);
      this.tenantList = tenantnames.split(',');
      // this.transactionForm.get('date')?.setValue(this.selectedDate);
      // this.transactionForm.get('enddate')?.setValue(this.selectedendDate);
      var sitename= this.routerExtService.getRouteValue(AppConstants.SiteID);
      var sitearray=sitename.split(',');
      this.siteId = sitearray;
      this.siteList = sitename.split(',');

      var chargePointname= this.routerExtService.getRouteValue(AppConstants.ChargePointID);     
      var chargePointarray=chargePointname.split(',');    
      this.chargePointId = chargePointarray;

      const sindex = sitearray.indexOf('select-all');
      if (sindex > -1) {
        sitearray.splice(sindex, 1);
      }
      const cindex = chargePointarray.indexOf('select-all');
      if (cindex > -1) {
        chargePointarray.splice(cindex, 1);
      }
      this.SiteUtilizationForm.patchValue({
        date: this.selectedDate ? new Date(this.selectedDate) : '',
        enddate: this.selectedendDate ? new Date(this.selectedendDate) : '',
        tenantName: this.tenantList ? this.tenantList : '',
        siteName: this.siteList ? this.siteList : '',
        chargePointname: chargePointarray ? chargePointarray : ''
      });
      if (this.tenantList) {
        this.tenantSelection();
      }
      if (this.siteList) {
        this.siteSelection();
      }
     
      //this.getsitesbytenants(tenantarray);
     //this.siteSelection(sitearray);

     //Syspro SK 2022_10_10
     //tenantarray.forEach((tenantObj: any) => {
      //this.getsitesbytenants(tenantObj);
     //});
     
      //commented by SK
      //this.tenantId = this.selectedTenantId;
      //this.siteId = this.selectedSiteId;
    // }
  }

  toggleAllTenantSelection() {
    this.allTenantSelected = !this.allTenantSelected;
    let tenantArray: any[] = [];
    if (this.allTenantSelected) {
      tenantArray.push('select-all');
      for (let index = 0; index < this.tenants.length; index++) {
        tenantArray.push(this.tenants[index].tenantId);
        if (this.tenants.length - 1 === index) {
          this.SiteUtilizationForm.controls['tenantName'].setValue(tenantArray);
          this.tenantId = tenantArray;
          this.routerExtService.setRouteValue(AppConstants.TenantID, this.tenantList.toString());
          this.getsitesbytenants(tenantArray);
        }
      }
    } else {
      this.sites = [];
      this.SiteUtilizationForm.controls['tenantName'].setValue([]);
      this.SiteUtilizationForm.controls['siteName'].reset();
    }
  }

  toggleAllSiteSelection() {    
    this.allSiteSelected = !this.allSiteSelected;
    let tenantArray: string[] = this.SiteUtilizationForm.get('tenantName')?.value;
    let siteArray: any[] = [];
    if (this.allSiteSelected) {
      siteArray.push('select-all');
      for (let index = 0; index < this.sites.length; index++) {
        siteArray.push(this.sites[index].siteId);
        if (this.sites.length - 1 === index) {
          this.SiteUtilizationForm.controls['siteName'].setValue(siteArray);
          this.siteId = siteArray;
          this.siteList = siteArray;
          this.routerExtService.setRouteValue(AppConstants.SiteID, this.siteList.toString());
          this.getchargepointbysites(siteArray, tenantArray);
        }
      }
    } else {
      this.SiteUtilizationForm.controls['siteName'].setValue([]);
    }
  }


  charPointSelection() {    
    let chargePointArray: string[] = this.SiteUtilizationForm.get('chargePointName')?.value;
    const index = chargePointArray.indexOf('select-all');
    if (index > -1) {
      chargePointArray.splice(index, 1);
      this.allChargePointSelected = !this.allChargePointSelected;
    }
    this.SiteUtilizationForm.controls['chargePointName'].setValue(chargePointArray);
    this.chargePointId = chargePointArray;
    this.routerExtService.setRouteValue(AppConstants.ChargePointID, this.chargePointId.toString());
  }

  toggleAllCharPointSelection() {   
    this.allChargePointSelected = !this.allChargePointSelected;
    let chargePointArray: any[] = [];
    if (this.allChargePointSelected) {
      chargePointArray.push('select-all');
      for (let index = 0; index < this.chargePoints.length; index++) {
        chargePointArray.push(this.chargePoints[index].chargePointId);
        if (this.chargePoints.length - 1 === index) {
          this.SiteUtilizationForm.controls['chargePointName'].setValue(chargePointArray);
          this.chargePointId = chargePointArray;
          this.routerExtService.setRouteValue(AppConstants.ChargePointID, this.chargePointId.toString());
        }
      }
    } else {
      this.SiteUtilizationForm.controls['chargePointName'].setValue([]);
    }
  }



  siteSelection() {    
    let siteArray: string[] = this.SiteUtilizationForm.get('siteName')?.value;
    let tenantArray: string[] = this.SiteUtilizationForm.get('tenantName')?.value;
    const index = siteArray.indexOf('select-all');
    if (index > -1) {
      siteArray.splice(index, 1);
      this.allSiteSelected = !this.allSiteSelected;
    }
    this.SiteUtilizationForm.controls['siteName'].setValue(siteArray);
    this.siteList = siteArray;
    this.siteId = siteArray;
    if (siteArray[0] !== '') {
      this.getchargepointbysites(siteArray, tenantArray);
    }
    this.routerExtService.setRouteValue(AppConstants.SiteID, this.siteList.toString());
    this.SiteUtilizationForm.get('data')?.invalid;
  }
  

  getchargepointbysites(siteList: any, tenantList: any)
  {    
    //this.transactionForm.controls['siteName'].reset();
    this.chargePoints = [];
    this.siteList = siteList;
     if (this.siteList.length) {
    this.httpDataService
      .post(AppConstants.APIUrlSiteToChargePointList ,{
        'tenantId':tenantList.toString(),
        'siteId':siteList.toString()
      })
      .subscribe((res) => {
        this.chargePoints = res;
        //this.transactionForm.controls['sites'].reset();
      });
    }
  }


  tenantSelection() {
    let tenantArray: string[] = this.SiteUtilizationForm.get('tenantName')?.value;
    const index = tenantArray.indexOf('select-all');
    if (index > -1) {
      tenantArray.splice(index, 1);
      this.allTenantSelected = !this.allTenantSelected;
    }
    this.sites = [];
    this.tenantList = tenantArray;
    this.tenantId = tenantArray;
    this.SiteUtilizationForm.controls['tenantName'].setValue(tenantArray);
    if (tenantArray[0] !== '') {
      this.getsitesbytenants(tenantArray);
    }
    this.routerExtService.setRouteValue(AppConstants.TenantID, this.tenantList.toString());
    this.SiteUtilizationForm.get('data')?.invalid;
  }


  getsitesbytenants(tenantList: any)
  {
    
    //this.transactionForm.controls['siteName'].reset();
    this.sites = [];
    this.tenantList = tenantList;
     if (this.tenantList.length) {
    this.httpDataService
      .post(AppConstants.APIUrlTenantToSiteList, {
        'tenantId': tenantList.toString(),
      })
      .subscribe((res) => {
        this.sites = res;
        //this.transactionForm.controls['sites'].reset();
      });
    }
  }
  

  
  buildTransactionForm() {
    this.SiteUtilizationForm = this.formBuilder.group({
      tenantName: [null, [Validators.required]],
      siteName: [null, [Validators.required]],
      chargePointName: [null, [Validators.required]],
      date: [null, [Validators.required]],
      enddate: [null, [Validators.required]],
    });
  }

  // getReport() {
  //   if (this.startDate && this.endDate) {
  //     this.process = true;
  //     this.dataSource.data = [];
  //     this.httpDataService
  //       .post(AppConstants.APIUrlGetDriverRegistration, {
  //         startDate: Helper.getFormattedDate(this.startDate),
  //         endDate: Helper.getFormattedDate(this.endDate),
  //       })
  //       .subscribe(
  //         (res) => {
  //           this.dataSource.data = res.driverRegistrationReports;
  //           this.totalUserCount = res.totalUserCount;
  //           this.userCount = res.userCount;
  //           this.dataSource.paginator = this.paginator;
  //           this.dataSource.sort = this.sort;
  //           this.cdref.detectChanges();
  //           this.process = false;
  //         },
  //         (error) => {
  //           console.log(error);
  //         }
  //       );
  //   }
  // }
  getReport() {
    if (this.startDate && this.endDate && this.SiteUtilizationForm.get('tenantName')?.value?.length > 0 && this.SiteUtilizationForm.get('siteName')?.value?.length > 0) {
      // this.process1 = true;
      this.process = true;
      this.dataSource.data = [];

      const tindex = this.tenantId.indexOf('select-all');
        if (tindex > -1) {
          this.tenantId.splice(tindex, 1);
        }
        const sindex = this.siteId.indexOf('select-all');
        if (sindex > -1) {
          this.siteId.splice(sindex, 1);
        }
        

        //this.routerExtService.setRouteValue('TransactionEndDate',enddate);
        var sitename= this.routerExtService.getRouteValue(AppConstants.SiteID);
        var sitesplit= sitename ? sitename.split(',') : this.siteId;
        
        var tenants = this.tenantId.length ? ( "'" + this.tenantId.join("','") + "'" ) : '';
        var sites = sitesplit.length ? ( "'" + sitesplit.join("','") + "'" ) : '';
        

      this.httpDataService
        .post(AppConstants.APIUrlGetSiteUtilizationReport, {
          startDate: Helper.getFormattedDate(this.startDate),
          endDate: Helper.getFormattedDate(this.endDate),
          tenants: tenants,
          siteId: sites,
          FilterType: this.FilterType,
        })
        .subscribe(
          (res) => {
            console.log(res);
            this.dataSource.data = res.data.siteUtill;
            this.statewiseSiteUtilizationchartLabel = [];
            this.citywiseSiteUtilizationchartLabel = [];
            let stateTransactionCount: any = [];
            let cityTransactionCount: any = [];
            
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.cdref.detectChanges();
            
            this.process1 = false;
            this.process = false;
            this.showsection = true;
            //Bar Chart

            res.data.stateUtill.push({noOfCount: 0, stateName: ""})
            res.data.cityutill.push({noOfCount: 0, cityName: ""})

            res.data.stateUtill.forEach(
              (element: any, index: number) => {
                stateTransactionCount.push(element.noOfCount)
                this.statewiseSiteUtilizationchartLabel.push(element.stateName);
                this.statewiseSiteUtilizationchartData = [
                  {
                    label: 'State Wise Site Utilization Report',
                    data: stateTransactionCount,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgb(54, 162, 235)',
                    hoverBackgroundColor:  'rgba(54, 162, 235)',
                    hoverBorderColor: 'rgb(54, 162, 235)',
                    borderWidth: 1,
                  },
                ];                
              }
            );   

            res.data.cityutill.forEach(
              (element: any, index: number) => {
                cityTransactionCount.push(element.noOfCount)
                this.citywiseSiteUtilizationchartLabel.push(element.cityName);
                this.citywiseSiteUtilizationchartData = [
                  {
                    label: 'City Wise Site Utilization Report',
                    data: cityTransactionCount,
                    borderWidth: 1,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgb(75, 192, 192)',
                    hoverBackgroundColor:  'rgba(75, 192, 192)',
                    hoverBorderColor: 'rgb(75, 192, 192)',
                  },
                ];                
              }
            );

            // if(this.FilterType == "Weekly")
            // {
            //   res.weekWiseTotalCount.push({registrationCount: 0,startOfWeekDate: ""})
            //   res.weekWiseTotalCount.forEach(
            //     (element: any, index: number) => {
            //       totaluserCount.push(element.registrationCount)
            //       // this.driverRegReportchartLabel.push(element.startOfWeekDate);
                  
            //       this.driverRegReportchartData = [
            //         {
            //           label: 'Registered Driver Report',
            //           data: totaluserCount,
            //           borderWidth: 1,
            //         },
            //       ];                
            //     }
            //   );   
            // }
            // else if (this.FilterType == "Monthly")
            // {
            //   res.monthTotalCount.push({registrationCount: 0,monthly: ""})
            //   res.monthTotalCount.forEach(
            //     (element: any, index: number) => { 
                  
            //       totaluserCount.push(element.registrationCount)
                  
            //       // this.driverRegReportchartLabel.push(element.monthly);
                  
            //       this.driverRegReportchartData = [
            //         {
            //           label: 'Registered Driver Report',
            //           data: totaluserCount,
            //           borderWidth: 1,                    
            //         },
            //       ];                
            //     }
            //   );
            // }
            // else if (this.FilterType == "Quarterly")
            // {
            //   res.quarterlyWiseTotalCount.push({registrationCount: 0,quarterly: ""})
            //   res.quarterlyWiseTotalCount.forEach(
            //     (element: any, index: number) => {
            //       totaluserCount.push(element.registrationCount)
                  
            //       this.driverRegReportchartData = [
            //         {
            //           label: 'Registered Driver Report',
            //           data: totaluserCount,
            //           borderWidth: 1,
            //         },
            //       ];                
            //     }
            //   );
            // }
            // else{
            //   if (res.totalUserCount > 0){
            //     res.dateWiseTotalCount.push({registrationCount: 0,registrationDate: ""})
            //     res.dateWiseTotalCount.forEach(
            //       (element: any, index: number) => {
            //         totaluserCount.push(element.registrationCount)
            //         this.driverRegReportchartLabel.push(element.registrationDate);
            //         this.driverRegReportchartData = [
            //           {
            //             label: 'Registered Driver Report',
            //             data: totaluserCount,
            //             borderWidth: 1,
            //           },
            //         ];                
            //       }
            //     );   
            //   }
            //   else{
            //     totaluserCount.push(0);
            //     this.driverRegReportchartData = [
            //       {
            //         label: 'Registered Driver Report',
            //         data: totaluserCount,
            //         borderWidth: 1,
            //       },
            //     ];  
            //   }           
            // }
                   
          },
          (error) => {
            this.process1 = false
            this.process = false
            console.log(error);
          }
        );
    }
    else
    {
      this.process = false;
      this.process1 = false;
      this.popUpService.showMsg(AppConstants.FillMandatoryFields, AppConstants.EmptyUrl, AppConstants.Warning, AppConstants.Warning);
    }
  }

  downloadCsvReport() {
    let csvData = this.ConvertToCSV(this.dataSource.data, [
      'customerId',
      'siteAddress',
      'chargePointId',
      'chargingRate',
      'nooftransactions',
      'totalUtilization',
      'totalAmount',
      'totalFailedTransactions',
    ]);
    let blob = new Blob(['\ufeff' + csvData], {
      type: 'text/csv;charset=utf-8;',
    });
    let dwldLink = document.createElement('a');
    let url = URL.createObjectURL(blob);
    let isSafariBrowser =
      navigator.userAgent.indexOf('Safari') != -1 &&
      navigator.userAgent.indexOf('Chrome') == -1;
    if (isSafariBrowser) {
      dwldLink.setAttribute('target', '_blank');
    }
    dwldLink.setAttribute('href', url);
    dwldLink.setAttribute('download', 'Site-Utilization-Report.csv');
    dwldLink.style.visibility = 'hidden';
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  ConvertToCSV(objArray: any, headerList: any) {
    this.totalUserCount = this.dataSource.data.length;
    objArray.push({});
    objArray.push({});
    objArray.push({customerId: 'Start Date : ', siteAddress: Helper.getFormattedDate(this.startDate)});
    objArray.push({customerId: 'End Date : ', siteAddress: Helper.getFormattedDate(this.endDate)});
    objArray.push({customerId: 'Total User Count : ', siteAddress: this.totalUserCount});
    // objArray.push({name: 'User Count : ', email: this.userCount});
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let row = '';
    let newHeaders = ['Customer Id', 'Site Address', 'ChargePoint Id', 'Charge Rate','Transactions', 'Utilization(KWH)', 'Amount', 'Failed Transactions'];
    for (let index in newHeaders) {
      row += newHeaders[index] + ',';
    }
    row = row.slice(0, -1);
    str += row + '\r\n';
    for (let i = 0; i < array.length; i++) {
      let line = '';
      for (let index in headerList) {
        let head = headerList[index];
        line += this.strRep(array[i][head]) + ',';
      }
      str += line + '\r\n';
    }
    return str;
  }

  strRep(data: any) {
    if (typeof data == 'undefined') {
      return '';
    } else if (typeof data == 'string') {
      let newData = data.replace(/,/g, ' ');
      return newData;
    } else if (typeof data == 'object') {
      return '-';
    } else if (typeof data == 'number') {
      return data.toString();
    } else {
      return data;
    }
  }

  downloadPdfReport() {
    this.totalUserCount = this.dataSource.data.length;
    var data: any = [];
    var img = new Image();
    var doc = new jsPDF({
      orientation: 'portrait',
      format: 'a4',
      compress: true,
    });
    this.dataSource.data.forEach((element: any, index: any) => {
      data.push([
        index + 1,
        element.customerId ? element.customerId : '-',
        element.siteAddress ? element.siteAddress : '-',
        element.chargePointId ? element.chargePointId : '-',
        element.chargingRate ? element.chargingRate : '-',

        element.nooftransactions ? element.nooftransactions : '-',
        element.totalUtilization ? element.totalUtilization : '-',
        element.totalAmount ? element.totalAmount : '-',
        element.totalFailedTransactions ? element.totalFailedTransactions : '-',
      ]);
    });
    autoTable(doc, {
      showHead: 'everyPage',
      pageBreak: 'auto',
      margin: { top: 35 },
      head: [['Sr. No.', 'Customer Id', 'Site Address', 'ChargePoint Id', 'Charge Rate','Transactions', 'Utilization(KWH)', 'Amount', 'Failed Transactions']],
      body: data,
      didDrawPage: function (data) {
        img.src = 'assets/EV-Chargers-Logo.png';
        doc.addImage(img, 'png', 13, 10, 50, 20);
        doc.setFontSize(24);
        doc.setTextColor(0, 150, 0);
        doc.text('Site Utilization Report', 85, 23);
      },
    });
    doc.addPage();
    img.src = 'assets/EV-Chargers-Logo.png';
    doc.addImage(img, 'png', 13, 10, 50, 20);
    doc.setFontSize(24);
    doc.setTextColor(0, 150, 0);
    doc.text('Site Utilization Report', 85, 23);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Start Date : ' + Helper.getFormattedDate(this.startDate), 15, 40);
    doc.text('End Date : ' + Helper.getFormattedDate(this.endDate), 115, 40);
    doc.text('Total Count : ' + this.totalUserCount, 15, 50);
    // doc.text('User Count : ' + this.userCount, 115, 50);
    doc.save('Site-Utilization-Report.pdf');
  }

  selectDuration(event: any) {
    const selectedValue = event.value;
    const currentDate = new Date();
    let startDate: Date;
    let endDate: Date;
  
    switch (selectedValue) {
      case 'thisweek':
        this.FilterType = 'Daily';
        const dayOfWeek = currentDate.getDay();
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - dayOfWeek);
        this.isDatepickerDisabled = true;
        this.hideDaily = false;
        this.hideWeekly = true;;
        this.hideMonthly = true;;
        this.hideQuarterly = true;;
        break;

      case 'last30Days':
        this.FilterType = 'Daily';
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 30);
        this.isDatepickerDisabled = true;
        this.hideDaily = false;
        this.hideWeekly = false;
        this.hideMonthly = true;
        this.hideQuarterly = true;
        break;
  
      case 'last2Weeks':
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 14);
        this.isDatepickerDisabled = true;
        break;
  
      case 'lastWeek':
        this.FilterType = 'Daily';
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 6);
        this.isDatepickerDisabled = true;
        this.hideDaily = false;
        this.hideWeekly = true;
        this.hideMonthly = true;
        this.hideQuarterly = true;
        break;
  
      case 'monthToDate':
        this.FilterType = 'Daily';
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        this.isDatepickerDisabled = true;
        this.hideDaily = false;
        this.hideWeekly = false;
        this.hideMonthly = true;
        this.hideQuarterly = true;
        break;
  
      case 'yearToDate':
        this.FilterType = 'Monthly';
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        this.isDatepickerDisabled = true;
        this.hideDaily = true;
        this.hideWeekly = true;        
        this.hideMonthly = false;
        this.hideQuarterly = false;
        break;
  
      case 'thisQuater':
        this.FilterType = 'Monthly';
        const currentMonth = currentDate.getMonth();
        const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
        startDate = new Date(currentDate.getFullYear(), quarterStartMonth, 1);
        endDate = new Date(currentDate.getFullYear(), quarterStartMonth + 3, 0);        
        this.isDatepickerDisabled = true;
        this.hideDaily = true;
        this.hideWeekly = true;
        this.hideMonthly = false;        
        this.hideQuarterly = true;
        break; 

      case 'lastQuarter':
        this.FilterType = 'Monthly';
        const lastQuarterStartMonth = (Math.floor((currentDate.getMonth() - 3) / 3) * 3);
        startDate = new Date(currentDate.getFullYear(), lastQuarterStartMonth, 1);
        endDate = new Date(currentDate.getFullYear(), lastQuarterStartMonth + 3, 0); 
        this.isDatepickerDisabled = true;
        this.hideDaily = true;
        this.hideWeekly = true;
        this.hideMonthly = false;
        this.hideQuarterly = true;
        break;

      case 'lastYear':
        this.FilterType = 'Monthly';
        startDate = new Date(currentDate.getFullYear() - 1, 0, 1); // First day of last year
        endDate = new Date(currentDate.getFullYear() - 1, 11, 31); // Last day of last year
        this.isDatepickerDisabled = true;
        this.hideDaily = true;
        this.hideWeekly = true;
        this.hideMonthly = false;
        this.hideQuarterly = false;
        break;
           
      case 'custom':
        this.FilterType = 'Daily';
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 1);
        this.isDatepickerDisabled = false;  
        this.hideDaily = false;
        this.hideWeekly = false;
        this.hideMonthly = false;
        this.hideQuarterly = false;   
        break;
    }
    if (startDate) {
      this.startDate = startDate;  
      this.endDate = endDate ? this.endDate = endDate : this.endDate = new Date(currentDate);        
      // this.getReport();
    }

    
  }  

  selectType(event: any){
      this.FilterType = event.value;
      this.getReport();
  }

  getCharts(event: any){
    this.ShowChart = event.checked;
  }


}
