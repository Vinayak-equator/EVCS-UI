import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import Helper from '@app/shared/utility/Helper';
import { AppConstants } from 'src/app/constants';
import { HttpDataService } from '@app/shared/services/http-data.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { TranslateConfigService } from '@app/shared/services/translate-config.service';
import { GridFilterService } from '@app/shared/utility/grid-filter.service';
import { Tenant } from '@app/models/tenant.model';
import { SiteList } from '@app/models/sitelist.model';
import { ChargePoint } from '@app/models/chargepoint.model';
import { RouterExtService } from '@app/shared/services/routerExt.service';

@Component({
  selector: 'app-chargepoint-uptime-report',
  templateUrl: './chargepoint-uptime-report.component.html',
  styleUrls: ['./chargepoint-uptime-report.component.css'],
})
export class ChargePointUptimeReportComponent implements OnInit{

  uptimeForm: FormGroup;
  userRole: string;
  process = false;
  process1 = true;
  maxDate = new Date();
  startDate: any = '';
  endDate: any = '';
  dataSource = new MatTableDataSource();
 
  tenants: Tenant[];
  sites: SiteList[];
  chargePoints: ChargePoint[];
  allTenantSelected = false;
  allSiteSelected = false;
  allChargePointSelected = false;
  tenantList: any;
  siteList: any;
  tenantId: any;
  siteId: any;
  chargePointId: any;
  selectedTenantId: any = '';
  selectedSiteId: any = '';
  selectedDate: any;
  selectedendDate: any;
  tenantName: any;
  isDatepickerDisabled: boolean = false;
  selected = 'custom';
  FilterType: any = 'Daily';
  hideDaily: boolean = false;
  hideWeekly: boolean = false;
  hideMonthly: boolean = false;
  hideQuarterly: boolean = false;
  ShowChart: boolean = true;
  chnageicon = 'keyboard_arrow_right';

  displayedColumns: string[] = [
    'chargePointId',
    'connector',
    'siteAddress',
    'upTimeHours',
    'downTimeHours',
    'totalHours',
    'upTimePercentage',
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
    private readonly formBuilder: FormBuilder,
    private httpDataService: HttpDataService,
    private cdref: ChangeDetectorRef,
    private translate: TranslateService, 
    public translateConfigService: TranslateConfigService,
    public filterService: GridFilterService,
    private routerExtService: RouterExtService
  ) {}

  ngOnInit(): void {
    if (this.selected === 'custom') {
      const currentDate = new Date();
      let startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - 1);
     
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

 get hasTenantAdmin(): boolean {
  return this.userRole == 'Tenant_Admin';
}

 buildTransactionForm() {
  this.uptimeForm = this.formBuilder.group({
    tenantName: [null, [Validators.required]],
    siteName: [null, [Validators.required]],
    chargePointName: [null, [Validators.required]],
    date: [null, [Validators.required]],
    enddate: [null, [Validators.required]],
  });
}

translator() {
  this.translate.get('singleBinding.itemPage').subscribe(data => {
    this.paginator._intl.itemsPerPageLabel = data;
    this.paginator.ngOnInit();
  });
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

  getReport() {
    if (this.startDate && this.endDate) {
      this.process = true;
      this.dataSource.data = [];
      this.httpDataService
        .get(
          AppConstants.APIUrlGetChargePointUptime +
            Helper.getFormattedDate(this.startDate) +
            '/' +
            Helper.getFormattedDate(this.endDate)
        )
        .subscribe(
          (res) => {
            this.dataSource.data = res;
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.cdref.detectChanges();
            this.process = false;
          },
          (error) => {
            console.log(error);
          }
        );
    }
  }

  toggleAllTenantSelection() {
    this.allTenantSelected = !this.allTenantSelected;
    let tenantArray: any[] = [];
    if (this.allTenantSelected) {
      tenantArray.push('select-all');
      for (let index = 0; index < this.tenants.length; index++) {
        tenantArray.push(this.tenants[index].tenantId);
        if (this.tenants.length - 1 === index) {
          this.uptimeForm.controls['tenantName'].setValue(tenantArray);
          this.tenantId = tenantArray;
          this.routerExtService.setRouteValue(AppConstants.TenantID, this.tenantList.toString());
          this.getsitesbytenants(tenantArray);
        }
      }
    } else {
      this.sites = [];
      this.uptimeForm.controls['tenantName'].setValue([]);
      this.uptimeForm.controls['siteName'].reset();
    }
  }

  toggleAllSiteSelection() {    
    this.allSiteSelected = !this.allSiteSelected;
    let tenantArray: string[] = this.uptimeForm.get('tenantName')?.value;
    let siteArray: any[] = [];
    if (this.allSiteSelected) {
      siteArray.push('select-all');
      for (let index = 0; index < this.sites.length; index++) {
        siteArray.push(this.sites[index].siteId);
        if (this.sites.length - 1 === index) {
          this.uptimeForm.controls['siteName'].setValue(siteArray);
          this.siteId = siteArray;
          this.siteList = siteArray;
          this.routerExtService.setRouteValue(AppConstants.SiteID, this.siteList.toString());
          this.getchargepointbysites(siteArray, tenantArray);
        }
      }
    } else {
      this.uptimeForm.controls['siteName'].setValue([]);
    }
  }


  charPointSelection() {    
    let chargePointArray: string[] = this.uptimeForm.get('chargePointName')?.value;
    const index = chargePointArray.indexOf('select-all');
    if (index > -1) {
      chargePointArray.splice(index, 1);
      this.allChargePointSelected = !this.allChargePointSelected;
    }
    this.uptimeForm.controls['chargePointName'].setValue(chargePointArray);
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
          this.uptimeForm.controls['chargePointName'].setValue(chargePointArray);
          this.chargePointId = chargePointArray;
          this.routerExtService.setRouteValue(AppConstants.ChargePointID, this.chargePointId.toString());
        }
      }
    } else {
      this.uptimeForm.controls['chargePointName'].setValue([]);
    }
  }



  siteSelection() {    
    let siteArray: string[] = this.uptimeForm.get('siteName')?.value;
    let tenantArray: string[] = this.uptimeForm.get('tenantName')?.value;
    const index = siteArray.indexOf('select-all');
    if (index > -1) {
      siteArray.splice(index, 1);
      this.allSiteSelected = !this.allSiteSelected;
    }
    this.uptimeForm.controls['siteName'].setValue(siteArray);
    this.siteList = siteArray;
    this.siteId = siteArray;
    if (siteArray[0] !== '') {
      this.getchargepointbysites(siteArray, tenantArray);
    }
    this.routerExtService.setRouteValue(AppConstants.SiteID, this.siteList.toString());
    this.uptimeForm.get('data')?.invalid;
  }
  

  getchargepointbysites(siteList: any, tenantList: any)
  {    
    //this.uptimeForm.controls['siteName'].reset();
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
        //this.uptimeForm.controls['sites'].reset();
      });
    }
  }


  tenantSelection() {
    let tenantArray: string[] = this.uptimeForm.get('tenantName')?.value;
    const index = tenantArray.indexOf('select-all');
    if (index > -1) {
      tenantArray.splice(index, 1);
      this.allTenantSelected = !this.allTenantSelected;
    }
    this.sites = [];
    this.tenantList = tenantArray;
    this.tenantId = tenantArray;
    this.uptimeForm.controls['tenantName'].setValue(tenantArray);
    if (tenantArray[0] !== '') {
      this.getsitesbytenants(tenantArray);
    }
    this.routerExtService.setRouteValue(AppConstants.TenantID, this.tenantList.toString());
    this.uptimeForm.get('data')?.invalid;
  }


  getsitesbytenants(tenantList: any)
  {
    
    //this.uptimeForm.controls['siteName'].reset();
    this.sites = [];
    this.tenantList = tenantList;
     if (this.tenantList.length) {
    this.httpDataService
      .post(AppConstants.APIUrlTenantToSiteList, {
        'tenantId': tenantList.toString(),
      })
      .subscribe((res) => {
        this.sites = res;
        //this.uptimeForm.controls['sites'].reset();
      });
    }
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
      this.uptimeForm.patchValue({
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

  selectDuration(event: any) {
    const selectedValue = event.value;
    const currentDate = new Date();
    let startDate: Date;
    let endDate: Date;
    
    switch (selectedValue) {
      case 'thisweek':
        
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
        
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 6);
        this.isDatepickerDisabled = true;
        this.hideDaily = false;
        this.hideWeekly = true;
        this.hideMonthly = true;
        this.hideQuarterly = true;
        break;
  
      case 'monthToDate':
       
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        this.isDatepickerDisabled = true;
        this.hideDaily = false;
        this.hideWeekly = false;
        this.hideMonthly = true;
        this.hideQuarterly = true;
        break;
  
      case 'yearToDate':
        
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        this.isDatepickerDisabled = true;
        this.hideDaily = true;
        this.hideWeekly = true;        
        this.hideMonthly = false;
        this.hideQuarterly = false;
        break;
  
      case 'thisQuater':
        
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
        
        startDate = new Date(currentDate.getFullYear() - 1, 0, 1); // First day of last year
        endDate = new Date(currentDate.getFullYear() - 1, 11, 31); // Last day of last year
        this.isDatepickerDisabled = true;
        this.hideDaily = true;
        this.hideWeekly = true;
        this.hideMonthly = false;
        this.hideQuarterly = false;
        break;
      
      case 'custom':
        
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

  Generatechart(){
    this.getReport();
     //this.selectDuration(this.selected, this.FilterType,'generateChart')
  }

  Clear(){
    this.uptimeForm.controls['tenantName'].reset();
    this.uptimeForm.controls['siteName'].reset();
    this.uptimeForm.controls['chargePointName'].reset();
  }

  downloadCsvReport() {
    let csvData = this.ConvertToCSV(this.dataSource.data, [
      'chargePointId',
      'upTimeHours',
      'downTimeHours',
      'totalHours',
      'upTimePercentage',
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
    dwldLink.setAttribute('download', 'ChargePoint-Uptime-Report.csv');
    dwldLink.style.visibility = 'hidden';
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  ConvertToCSV(objArray: any, headerList: any) {
    objArray.push({});
    objArray.push({});
    objArray.push({chargePointId: 'Start Date : ', upTimeHours: Helper.getFormattedDate(this.startDate)});
    objArray.push({chargePointId: 'End Date : ', upTimeHours: Helper.getFormattedDate(this.endDate)});
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let row = '';
    let newHeaders = [
      'ChargePoint',
      'Uptime (Hr)',
      'Downtime (Hr)',
      'Total (Hr)',
      'Uptime (%)',
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
    this.dataSource.data.forEach((element: any, index: any) => {
      data.push([
        index + 1,
        element.chargePointId ? element.chargePointId : '-',
        element.upTimeHours ? element.upTimeHours.toFixed(2) : 0.0,
        element.downTimeHours ? element.downTimeHours.toFixed(2) : 0.0,
        element.totalHours ? element.totalHours.toFixed(2) : 0.0,
        element.upTimePercentage ? element.upTimePercentage.toFixed(2) : 0.0,
      ]);
    });
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Start Date : ' + Helper.getFormattedDate(this.startDate), 15, 40);
    doc.text('End Date : ' + Helper.getFormattedDate(this.endDate), 125, 40);
    autoTable(doc, {
      showHead: 'everyPage',
      pageBreak: 'auto',
      margin: { top: 45 },
      head: [
        [
          'Sr. No.',
          'ChargePoint',
          'Uptime (Hr)',
          'Downtime (Hr)',
          'Total (Hr)',
          'Uptime (%)',
        ],
      ],
      body: data,
      didDrawPage: function (data) {
        img.src = 'assets/EV-Chargers-Logo.png';
        doc.addImage(img, 'png', 13, 10, 50, 20);
        doc.setFontSize(24);
        doc.setTextColor(0, 150, 0);
        doc.text('ChargePoint Uptime Report', 135, 23);
      },
    });
    doc.save('ChargePoint-Uptime-Report.pdf');
  }

  togglechnage() {
    this.chnageicon =
      this.chnageicon == 'keyboard_arrow_right'
        ? 'keyboard_arrow_down'
        : 'keyboard_arrow_right';
  }

  // Called on Filter change
  filterChange(filter: any, event: any) {
    // if (event.option != undefined) {
    //   this.filterValues[filter?.columnProp] = event.option.value
    //     .toString()
    //     .trim()
    //     .toLowerCase();
    // } else {
    //   if (!Helper.isNullOrEmpty(this.siteNameControl.value))
    //     this.filterValues[filter?.columnProp] = this.siteNameControl.value
    //       .toString()
    //       .trim()
    //       .toLowerCase();
    //   else if (!Helper.isNullOrEmpty(this.locationControl.value))
    //     this.filterValues[filter?.columnProp] = this.locationControl.value
    //       .toString()
    //       .trim()
    //       .toLowerCase();
    //   else if (!Helper.isNullOrEmpty(this.chargePointControl.value))
    //     this.filterValues[filter?.columnProp] = this.chargePointControl.value
    //       .toString()
    //       .trim()
    //       .toLowerCase();
    // }

    // this.dataSource.filter = JSON.stringify(this.filterValues);
    // if (this.dataSource.paginator) {
    //   this.dataSource.paginator.firstPage();
    // }
  }

  // Reset table filters
  resetFilters() {
    
    // this.getSites(this.tenantId);
    // this.siteNameControl.setValue('');
    // this.locationControl.setValue('');
    // this.chargePointControl.setValue('');
    // this.filterValues = {};
    // this.filterSelectObj.forEach((value: any, key: any) => {
    //   value.modelValue = undefined;
    // });
    this.dataSource.filter = '';
  }
}
