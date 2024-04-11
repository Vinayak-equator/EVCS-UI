import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import Helper from '@app/shared/utility/Helper';
import { AppConstants } from 'src/app/constants';
import { HttpDataService } from '@app/shared/services/http-data.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Tenant } from '@app/models/tenant.model';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SiteList } from '@app/models/sitelist.model';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { TranslateConfigService } from '@app/shared/services/translate-config.service';
import { GridFilterService } from '@app/shared/utility/grid-filter.service';
import { Router } from '@angular/router';
import { PopUpService } from '@app/shared/utility/popup.service';
import { RouterExtService } from '@app/shared/services/routerExt.service';
import { ChargePoint } from '@app/models/chargepoint.model';
import { ChartDataset as ChartDataSets, ChartOptions,Color } from 'chart.js';
//import { Color, Label } from 'ng2-charts';
type Label = string;
@Component({
  selector: 'app-driver-activity-report',
  templateUrl: './driver-activity-report.component.html',
  styleUrls: ['./driver-activity-report.component.css'],
})
export class DriverActivityReportComponent {

  driverActivityForm: UntypedFormGroup;
  process = false;
  process1 = false;
  tenants: Tenant[];
  sites: SiteList[];
  chargePoints: ChargePoint[];
  tenant: any = '';
  nonRegisteredAmount: any = '';
  nonRegisteredConsumption: any = '';
  nonRegisteredCount: any = '';
  registeredAmount: any = '';
  registeredConsumption: any = '';
  registeredCount: any = '';
  totalAmount: any = '';
  totalConsumption: any = '';
  maxDate = new Date();
  startDate: any = '';
  endDate: any = '';
  type:any = '';
  duration='';
  tenantList: any;
  siteList: any;
  tenantId: any;
  siteId: any;
  chargePointId: any;
  allSiteSelected = false;
  allChargePointSelected = false;
  isDatepickerDisabled: boolean = false;
  selected = 'custom';
  FilterType: any = 'Daily';
  hideDaily: boolean = false;
  hideWeekly: boolean = false;
  hideMonthly: boolean = false;
  hideQuarterly: boolean = false;
  ShowChart: boolean = true;
  showchartsection = false;
  reportType:any;

  //State Chart Data
  stateWiseDriverActivitychartData: ChartDataSets[] = [];
  stateWiseDriverActivitychartLabel: Label[] = [];
  stateWiseDriverActivitychartLegend = true;
  stateWiseDriverActivityOptions: ChartOptions = {
    responsive: true,
  };
  stateWiseDriverActivitychartColors: Color[] = [];
  stateWiseDriverActivitychartPlugins: any = [];

  //City Wise Chart Data

  cityWiseDriverActivitychartData: ChartDataSets[] = [];
  cityWiseDriverActivitychartLabel: Label[] = [];
  cityWiseDriverActivitychartLegend = true;
  cityWiseDriverActivityOptions: ChartOptions = {
    responsive: true,
  };
  cityWiseDriverActivitychartColors: Color[] = [];
  cityWiseDriverActivitychartPlugins: any = [];

  //Date Wise Chart Data

  dateWiseDriverActivitychartData: ChartDataSets[] = [];
  dateWiseDriverActivitychartLabel: Label[] = [];
  dateWiseDriverActivitychartLegend = true;
  dateWiseDriverActivityOptions: ChartOptions = {
    responsive: true,
  };
  dateWiseDriverActivitychartColors: Color[] = [];
  dateWiseDriverActivitychartPlugins: any = [];

  //Customer Wise Chart Data

  customerWiseDriverActivitychartData: ChartDataSets[] = [];
  customerWiseDriverActivitychartLabel: Label[] = [];
  customerWiseDriverActivitychartLegend = true;
  customerWiseDriverActivityOptions: ChartOptions = {
    responsive: true,
  };
  customerWiseDriverActivitychartColors: Color[] = [];
  customerWiseDriverActivitychartPlugins: any = [];

  dataSource = new MatTableDataSource();
  displayedColumns: string[] = [
    'name',
    'reporttype',
    'email',
    'mobile',
    'transactions',
    'chargingTime',
    'kwhConsumed',
    'amount',
    //'chargerlocation',
    'type',

  ];
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
    private translate: TranslateService, 
    public translateConfigService: TranslateConfigService, 
    public filterService: GridFilterService,
    private router: Router, 
    private popUpService: PopUpService,    
    private routerExtService: RouterExtService,
    private httpDataService: HttpDataService,
    private cdref: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getTenantNames();
    if (this.selected === 'custom') {
      const currentDate = new Date();
      let startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - 1);
      this.FilterType = 'Daily';
      this.startDate = startDate;
      
      this.endDate = new Date(currentDate);  
        
    
   }
   this.maxDate.setDate(this.maxDate.getDate());
   this.dataSource.data = [];
    
    this.buildDriverActivityForm();
  }

  buildDriverActivityForm(){
    this.driverActivityForm = this.formBuilder.group({
      reportType: [null, [Validators.required]],
      tenantName: [null, [Validators.required]],
      siteName: [null, [Validators.required]],
      chargePointName: [null, [Validators.required]],
      duration : [this.selected],
      type : [this.FilterType]
    });
  }

  getTenantNames() {
    return this.httpDataService
      .get(AppConstants.APIUrlTenantNameListtUrl)
      .subscribe((res: Tenant[]) => {
        this.tenants = res.sort(this.SortArray);
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

  tenantSelection() {
    let tenantArray: string[] = this.driverActivityForm.get('tenantName')?.value;
    const index = tenantArray.indexOf('select-all');
    // if (index > -1) {
    //   tenantArray.splice(index, 1);
    //   this.allTenantSelected = !this.allTenantSelected;
    // }
    this.sites = [];
    this.tenantList = tenantArray;
    this.tenantId = tenantArray;
    this.driverActivityForm.controls['tenantName'].setValue(tenantArray);
    if (tenantArray[0] !== '') {
      this.getsitesbytenants(tenantArray);
    }
    this.routerExtService.setRouteValue(AppConstants.TenantID, this.tenantList.toString());
    this.driverActivityForm.get('data')?.invalid;
  }

  getsitesbytenants(tenantList: any)
  {
    
    //this.chargepointUtilizationForm.controls['siteName'].reset();
    this.sites = [];
    this.tenantList = tenantList;
     if (this.tenantList.length) {
    this.httpDataService
      .post(AppConstants.APIUrlTenantToSiteList, {
        'tenantId': tenantList.toString(),
      })
      .subscribe((res) => {
        this.sites = res;
        //this.chargepointUtilizationForm.controls['sites'].reset();
      });
    }
  }

  toggleAllSiteSelection() {    
    this.allSiteSelected = !this.allSiteSelected;
    let tenantArray: string[] = this.driverActivityForm.get('tenantName')?.value;
    let siteArray: any[] = [];
    if (this.allSiteSelected) {
      siteArray.push('select-all');
      for (let index = 0; index < this.sites.length; index++) {
        siteArray.push(this.sites[index].siteId);
        if (this.sites.length - 1 === index) {
          this.driverActivityForm.controls['siteName'].setValue(siteArray);
          this.siteId = siteArray;
          this.siteList = siteArray;
          this.routerExtService.setRouteValue(AppConstants.SiteID, this.siteList.toString());
          this.getchargepointbysites(siteArray, tenantArray);
        }
      }
    } else {
      this.driverActivityForm.controls['siteName'].setValue([]);
    }
  }

  siteSelection() {    
    let siteArray: string[] = this.driverActivityForm.get('siteName')?.value;
    let tenantArray: string[] = this.driverActivityForm.get('tenantName')?.value;
    const index = siteArray.indexOf('select-all');
    if (index > -1) {
      siteArray.splice(index, 1);
      this.allSiteSelected = !this.allSiteSelected;
    }
    this.driverActivityForm.controls['siteName'].setValue(siteArray);
    this.siteList = siteArray;
    this.siteId = siteArray;
    if (siteArray[0] !== '') {
      this.getchargepointbysites(siteArray, tenantArray);
    }
    this.routerExtService.setRouteValue(AppConstants.SiteID, this.siteList.toString());
    this.driverActivityForm.get('data')?.invalid;
  }

  chargePointSelection() {    
    let chargePointArray: string[] = this.driverActivityForm.get('chargePointName')?.value;
    const index = chargePointArray.indexOf('select-all');
    if (index > -1) {
      chargePointArray.splice(index, 1);
      this.allChargePointSelected = !this.allChargePointSelected;
    }
    this.driverActivityForm.controls['chargePointName'].setValue(chargePointArray);
    this.chargePointId = chargePointArray;
    this.routerExtService.setRouteValue(AppConstants.ChargePointID, this.chargePointId.toString());
  }

  toggleAllChargePointSelection() {   
    this.allChargePointSelected = !this.allChargePointSelected;
    let chargePointArray: any[] = [];
    if (this.allChargePointSelected) {
      chargePointArray.push('select-all');
      for (let index = 0; index < this.chargePoints.length; index++) {
        chargePointArray.push(this.chargePoints[index].chargePointId);
        if (this.chargePoints.length - 1 === index) {
          this.driverActivityForm.controls['chargePointName'].setValue(chargePointArray);
          this.chargePointId = chargePointArray;
          this.routerExtService.setRouteValue(AppConstants.ChargePointID, this.chargePointId.toString());
        }
      }
    } else {
      this.driverActivityForm.controls['chargePointName'].setValue([]);
    }
  }

  getchargepointbysites(siteList: any, tenantList: any)
  {    
    //this.chargepointUtilizationForm.controls['siteName'].reset();
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
        //this.chargepointUtilizationForm.controls['sites'].reset();
      });
    }
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
        this.hideWeekly = true;
        this.hideMonthly = true;
        this.hideQuarterly = true;
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
    }
    //this.showchartsection = true
    this.process = false;
    this.process1 = false;
  } 

  selectType(event: any){
    this.FilterType = event.value;
    // this.getReport();
  }

  getReport() {
    try {
    if (this.startDate && this.endDate && this.driverActivityForm.valid) {
      this.process = true;
      this.dataSource.data = [];

      var sitename= this.routerExtService.getRouteValue(AppConstants.SiteID);
      var sitesplit= sitename ? sitename.split(',') : this.siteId;
      var chargePointname= this.routerExtService.getRouteValue(AppConstants.ChargePointID);
      var chargePointsplit= chargePointname ? chargePointname.split(',') : this.chargePointId;

      var sites = sitesplit.length ? ( "'" + sitesplit.join("','") + "'" ) : '';
      var chargePoints = chargePointsplit.length ? ( "'" + chargePointsplit.join("','") + "'" ) : '';

      // Bar Chart Counters API
      this.httpDataService
        .post(AppConstants.APIUrlGetDriverActivityChartCount,{
          startDate: Helper.getFormattedDate(this.startDate),
          endDate: Helper.getFormattedDate(this.endDate),
          tenantId: this.tenantId,
          ReportType: this.reportType,
          siteId: sites,
          chargePointId: chargePoints,
          FilterType: this.FilterType
        })
        .subscribe(
          (res) => {
            
            this.cdref.detectChanges();
            this.process = false;
            this.showchartsection = true;
            this.stateWiseDriverActivitychartLabel = [];
            this.cityWiseDriverActivitychartLabel = [];
            this.dateWiseDriverActivitychartLabel = [];
            this.customerWiseDriverActivitychartLabel = [];
            let totaltransaction: any = [];
            let totalkwh: any = [];
            let totalamount :any = [];
            res.data.stateUtill.forEach(
              (element: any, index: number) => {
                totaltransaction.push(element.totalTransaction);
                totalkwh.push(element.totalKWH);
                totalamount.push(element.totalAmount);
                this.stateWiseDriverActivitychartLabel.push(element.state);
                this.stateWiseDriverActivitychartData = [
                  {
                      
                    label: 'Total Transaction',
                    data: totaltransaction,
                    fill: false,
                    backgroundColor: 'rgba(127, 0, 255, 0.2)',
                    borderColor: 'rgb(127, 0, 255)',
                    borderWidth: 1,
                    hoverBackgroundColor:  'rgba(127, 0, 255)',
                    hoverBorderColor: 'rgb(127, 0, 255)'
                  },
                  {
                      
                    label: 'Total KWH',
                    data: totalkwh, // Example data for the second set of values
                    fill: false,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgb(255, 99, 132)',
                    borderWidth: 1,
                    hoverBackgroundColor:  'rgba(255, 99, 132)',
                    hoverBorderColor: 'rgb(255, 99, 132)'
                  },
                  {
                    
                    label: 'Total Amount',
                    data: totalamount, // Example data for the second set of values
                    fill: false,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgb(75, 192, 192)',
                    borderWidth: 1,
                    hoverBackgroundColor:  'rgba(75, 192, 192)',
                    hoverBorderColor: 'rgb(75, 192, 192)'
                  }
                ];                
              }
            ); 
            res.data.cityutill.forEach(
              (element: any, index: number) => {
                totaltransaction.push(element.totalTransaction);
                totalkwh.push(element.totalKWH);
                totalamount.push(element.totalAmount);
                this.cityWiseDriverActivitychartLabel.push(element.city);
                this.cityWiseDriverActivitychartData = [
                  {
                      
                    label: 'Total Transaction',
                    data: totaltransaction,
                    fill: false,
                    backgroundColor: 'rgba(127, 0, 255, 0.2)',
                    borderColor: 'rgb(127, 0, 255)',
                    borderWidth: 1,
                    hoverBackgroundColor:  'rgba(127, 0, 255)',
                    hoverBorderColor: 'rgb(127, 0, 255)'
                  },
                  {
                      
                    label: 'Total KWH',
                    data: totalkwh, // Example data for the second set of values
                    fill: false,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgb(255, 99, 132)',
                    borderWidth: 1,
                    hoverBackgroundColor:  'rgba(255, 99, 132)',
                    hoverBorderColor: 'rgb(255, 99, 132)'
                  },
                  {
                    
                    label: 'Total Amount',
                    data: totalamount, // Example data for the second set of values
                    fill: false,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgb(75, 192, 192)',
                    borderWidth: 1,
                    hoverBackgroundColor:  'rgba(75, 192, 192)',
                    hoverBorderColor: 'rgb(75, 192, 192)'
                  }
                ];                
              }
            ); 
            res.data.dateCount.forEach(
              (element: any, index: number) => {
                totaltransaction.push(element.totalTransaction);
                totalkwh.push(element.totalKWH);
                totalamount.push(element.totalAmount);
                this.dateWiseDriverActivitychartLabel.push(element.transactionDate);
                this.dateWiseDriverActivitychartData = [
                  {
                      
                    label: 'Total Transaction',
                    data: totaltransaction,
                    fill: false,
                    backgroundColor: 'rgba(127, 0, 255, 0.2)',
                    borderColor: 'rgb(127, 0, 255)',
                    borderWidth: 1,
                    hoverBackgroundColor:  'rgba(127, 0, 255)',
                    hoverBorderColor: 'rgb(127, 0, 255)'
                  },
                  {
                      
                    label: 'Total KWH',
                    data: totalkwh, // Example data for the second set of values
                    fill: false,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgb(255, 99, 132)',
                    borderWidth: 1,
                    hoverBackgroundColor:  'rgba(255, 99, 132)',
                    hoverBorderColor: 'rgb(255, 99, 132)'
                  },
                  {
                    
                    label: 'Total Amount',
                    data: totalamount, // Example data for the second set of values
                    fill: false,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgb(75, 192, 192)',
                    borderWidth: 1,
                    hoverBackgroundColor:  'rgba(75, 192, 192)',
                    hoverBorderColor: 'rgb(75, 192, 192)'
                  }
                ];                
              }
            ); 
            res.data.customerCount.forEach(
              (element: any, index: number) => {
                totaltransaction.push(element.totalTransaction);
                totalkwh.push(element.totalKWH);
                totalamount.push(element.totalAmount);
                this.customerWiseDriverActivitychartLabel.push(element.customerId);
                this.customerWiseDriverActivitychartData = [
                  {
                      
                    label: 'Total Transaction',
                    data: totaltransaction,
                    fill: false,
                    backgroundColor: 'rgba(127, 0, 255, 0.2)',
                    borderColor: 'rgb(127, 0, 255)',
                    borderWidth: 1,
                    hoverBackgroundColor:  'rgba(127, 0, 255)',
                    hoverBorderColor: 'rgb(127, 0, 255)'
                  },
                  {
                      
                    label: 'Total KWH',
                    data: totalkwh, // Example data for the second set of values
                    fill: false,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgb(255, 99, 132)',
                    borderWidth: 1,
                    hoverBackgroundColor:  'rgba(255, 99, 132)',
                    hoverBorderColor: 'rgb(255, 99, 132)'
                  },
                  {
                    
                    label: 'Total Amount',
                    data: totalamount, // Example data for the second set of values
                    fill: false,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgb(75, 192, 192)',
                    borderWidth: 1,
                    hoverBackgroundColor:  'rgba(75, 192, 192)',
                    hoverBorderColor: 'rgb(75, 192, 192)'
                  }
                ];                
              }
            ); 
          },
          (error) => {
            this.process = false;

            console.log(error);
          }
        );

      // Driver Activity Report List API
      this.httpDataService
        .post(AppConstants.APIUrlGetDriverActivity, {
          startDate: Helper.getFormattedDate(this.startDate),
          endDate: Helper.getFormattedDate(this.endDate),
          tenantId: this.tenantId,
          ReportType: this.reportType,
          siteId: sites,
          chargePointId: chargePoints,
          FilterType: this.FilterType
        })
        .subscribe(
          (res) => {
            this.dataSource.data = res.data;
            // this.nonRegisteredAmount = res.data.nonRegisteredAmount;
            // this.nonRegisteredConsumption = res.data.nonRegisteredConsumption;
            // this.nonRegisteredCount = res.data.nonRegisteredCount;
            // this.registeredAmount = res.data.registeredAmount;
            // this.registeredConsumption = res.data.registeredConsumption;
            // this.registeredCount = res.data.registeredCount;
            // this.totalAmount = res.data.totalAmount;
            // this.totalConsumption = res.data.totalConsumption;
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.cdref.detectChanges();
            this.process = false;
            this.showchartsection = true;
          },
          (error) => {
            console.log(error);
          }
        );
    }
    else{
      this.process = false;
    this.process1 = false;
    this.popUpService.showMsg(AppConstants.FillMandatoryFields, AppConstants.EmptyUrl, AppConstants.Warning, AppConstants.Warning);
    }
  } catch (error) {
    this.process = false;
    this.process1 = false;
    this.popUpService.showMsg(AppConstants.FillMandatoryFields, AppConstants.EmptyUrl, AppConstants.Warning, AppConstants.Warning);
  }
}

  Generatechart(){
    this.getReport();
     //this.selectDuration(this.selected, this.FilterType,'generateChart')
  }

  Clear(){
    this.driverActivityForm.controls['reportType'].reset();
    this.driverActivityForm.controls['tenantName'].reset();
    this.driverActivityForm.controls['siteName'].reset();
    this.driverActivityForm.controls['chargePointName'].reset();
  }

  changeReportType(event:any){
    var selectedValue = event.value;
    this.reportType = selectedValue;
  }

  getCharts(event: any){
    this.ShowChart = event.checked;
  }

  checkChargerLocation(event:any) {
    var chekedValue = event.checked;
    console.log(chekedValue);
  }

  openPopup(transaction: any) {
    this.routerExtService.setRouteValue(
      AppConstants.email,
      transaction.email.toString()
    );
    this.routerExtService.setRouteValue(
      AppConstants.reportType,
      transaction.reportType.toString()
    );
    this.routerExtService.setRouteValue(
      AppConstants.startdate,
      Helper.getFormattedDate(this.startDate).toString()
    );
    this.routerExtService.setRouteValue(
      AppConstants.enddate,
      Helper.getFormattedDate(this.endDate).toString()
    );
    this.router.navigate([AppConstants.DriverActivityReportTransactionDetailUrl]);
  }

  downloadCsvReport() {
    let csvData = this.ConvertToCSV(this.dataSource.data, [
      'customerName',
      'reportType',
      'email',
      'cellPhoneNumber',
      'numofTransactions',
      'totalTime',
      'totalKWH',
      'totalAmount',
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
    dwldLink.setAttribute('download', 'Driver-Activity-Report.csv');
    dwldLink.style.visibility = 'hidden';
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  ConvertToCSV(objArray: any, headerList: any) {
    objArray.push({});
    objArray.push({});
    objArray.push({customerName: 'Start Date : ', reportType: Helper.getFormattedDate(this.startDate)});
    objArray.push({customerName: 'End Date : ', reportType: Helper.getFormattedDate(this.endDate)});
    objArray.push({customerName: 'Report Type : ', reportType: this.reportType});
    // objArray.push({chargePoint: 'Organization : ', name: this.tenant.name});
    // objArray.push({chargePoint: 'Registered User Count : ', name: this.registeredCount});
    // objArray.push({chargePoint: 'Non-Registered User Count : ', name: this.nonRegisteredAmount});
    // objArray.push({chargePoint: 'Registered User Consumption : ', name: this.registeredConsumption});
    // objArray.push({chargePoint: 'Non-Registered User Consumption : ', name: this.nonRegisteredConsumption});
    // objArray.push({chargePoint: 'Registered User Amount : ', name: this.registeredAmount});
    // objArray.push({chargePoint: 'Non-Registered User Amount : ', name: this.nonRegisteredCount});
    // objArray.push({chargePoint: 'Total Amount : ', name: this.totalAmount});
    // objArray.push({chargePoint: 'Total Consumption : ', name: this.totalConsumption});
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let row = '';
    let newHeaders = [
      'Customer Name',
      'Report Type',
      'Email',
      'Mobile',
      'Transactions',
      'Charging Time (Hr)',
      'Consumption (KwH)',
      'Amount ($)',
    ];
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
    var data: any = [];
    var img = new Image();
    var doc = new jsPDF({
      orientation: 'landscape',
      format: 'a4',
      compress: true,
    });
    // var pageWidth = parseInt(doc.internal.pageSize.width.toFixed(0));
    // var pageHeight = parseInt(doc.internal.pageSize.height.toFixed(0));
    // doc.addImage(img, 'png', (pageWidth/2)-50, 10, 100, 30);
    this.dataSource.data.forEach((element: any, index: any) => {
      data.push([
        index + 1,
        element.customerName ? element.customerName : '-',
        element.reportType ? element.reportType : '-',
        element.email ? element.email : '-', 
        element.cellPhoneNumber ? element.cellPhoneNumber : '-',
        element.numofTransactions ? element.numofTransactions : '-',
        element.totalTime ? element.totalTime : '-',
        element.totalKWH ? element.totalKWH : 0.0,
        element.totalAmount ? element.totalAmount : '-',
      ]);
    });
    autoTable(doc, {
      showHead: 'everyPage',
      pageBreak: 'auto',
      margin: { top: 35 },
      head: [
        [
          'Sr. No.',
          'Customer Name',
          'Report Type',
          'Email',
          'Mobile',
          'Transactions',
          'Charging Time (Hr)',
          'Consumption (KwH)',
          'Amount ($)',
        ],
      ],
      body: data,
      didDrawPage: function (data) {
        img.src = 'assets/EV-Chargers-Logo.png';
        doc.addImage(img, 'png', 13, 10, 50, 20);
        doc.setFontSize(24);
        doc.setTextColor(0, 150, 0);
        doc.text('Driver Activity Report', 135, 23);
      },
    });
    doc.addPage();
    img.src = 'assets/EV-Chargers-Logo.png';
    doc.addImage(img, 'png', 13, 10, 50, 20);
    doc.setFontSize(24);
    doc.setTextColor(0, 150, 0);
    doc.text('Driver Activity Report', 135, 23);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Start Date : ' + Helper.getFormattedDate(this.startDate), 15, 40);
    doc.text('End Date : ' + Helper.getFormattedDate(this.endDate), 125, 40);
    doc.text('Report Type : ' + this.reportType, 15, 50);
    //doc.text('Registered User Count : ' + this.registeredCount, 15, 60);
    // doc.text(
    //   'Non-Registered User Count : ' + this.nonRegisteredAmount,
    //   125,
    //   60
    // );
    // doc.text(
    //   'Registered User Consumption : ' + this.registeredConsumption,
    //   15,
    //   70
    // );
    // doc.text(
    //   'Non-Registered User Consumption : ' + this.nonRegisteredConsumption,
    //   125,
    //   70
    // );
    // doc.text('Registered User Amount : ' + this.registeredAmount, 15, 80);
    // doc.text(
    //   'Non-Registered User Amount : ' + this.nonRegisteredCount,
    //   125,
    //   80
    // );
    // doc.text('Total Amount : ' + this.totalAmount, 15, 90);
    // doc.text('Total Consumption : ' + this.totalConsumption, 125, 90);
    doc.save('Driver-Activity-Report.pdf');
  }
}
