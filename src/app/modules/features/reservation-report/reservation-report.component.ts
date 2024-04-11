import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { MatSort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { Router } from '@angular/router';
import { ChargePoint } from '@app/models/chargepoint.model';
import { SiteList } from '@app/models/sitelist.model';
import { Tenant } from '@app/models/tenant.model';
import { HttpDataService } from '@app/shared/services/http-data.service';
import { RouterExtService } from '@app/shared/services/routerExt.service';
import { TranslateConfigService } from '@app/shared/services/translate-config.service';
import { PopUpService } from '@app/shared/utility/popup.service';
import { TranslateService } from '@ngx-translate/core';
import { GridFilterService } from '@app/shared/utility/grid-filter.service';
import { AppConstants } from '@app/constants';
import Helper from '@app/shared/utility/Helper';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-reservation-report',
  templateUrl: './reservation-report.component.html',
  styleUrls: ['./reservation-report.component.css']
})
export class ReservationReportComponent implements OnInit {

  ReservationForm: UntypedFormGroup;
  process = false;
  dataSource = new MatTableDataSource();
  isDatepickerDisabled: boolean = false;
  tenants: Tenant[];
  sites: SiteList[];
  chargePoints: ChargePoint[];
  startDate: any = '';
  endDate: any = '';
  maxDate = new Date();
  selectedTenant: string = '';
  selectedSite: string = '';
  tenantList: any;
  siteList: any;
  @Input() max: any;
  allTenantSelected = false;
  allSiteSelected = false;
  allChargePointSelected = false;
  tenantId: any;
  siteId: any;
  chargePointId: any;
  selectedDate: any;
  selectedendDate: any;
  totalUserCount: any = '';
  userRole: string;
  tenantName: any;
  FilterType: any;

  displayedColumns: string[] = ['reservationId','chargePointId','customerId', 'startTime', 'endTime', 'estimatedunit', 'estimatedAmount','reservationExtended','noshow','errorincharging'];

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

  get hasTenantAdmin(): boolean {
    return this.userRole == 'Tenant_Admin';
  }
  
  constructor(private readonly formBuilder: UntypedFormBuilder, private httpDataService: HttpDataService,
    private translate: TranslateService, public translateConfigService: TranslateConfigService, public filterService: GridFilterService,
    private router: Router, private popUpService: PopUpService,    private cdref: ChangeDetectorRef,

    private routerExtService: RouterExtService) {

   
  }

  ngOnInit(): void {
    this.buildTransactionForm();
    
      const currentDate = new Date();
      let startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - 1);
   
      this.startDate = startDate;
      this.endDate = new Date(currentDate);      
    
   
   this.maxDate.setDate(this.maxDate.getDate());
   this.dataSource.data = [];

   this.getTenantNames();
   this.translateConfigService.localEvent.subscribe(data => {
     this.translator();
   });
   
   // Retain the previous result.
   this.restoreTransactionList();
  }

  Genratereport(){
    this.getReport();
  }

  getReport() {
    if (this.startDate && this.endDate && this.ReservationForm.get('tenantName')?.value?.length > 0 && this.ReservationForm.get('siteName')?.value?.length > 0) {
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
        var chargePointname= this.routerExtService.getRouteValue(AppConstants.ChargePointID);
        var chargePointsplit= chargePointname ? chargePointname.split(',') : this.chargePointId;
        
        var tenants = this.tenantId.length ? ( "'" + this.tenantId.join("','") + "'" ) : '';
        var sites = sitesplit.length ? ( "'" + sitesplit.join("','") + "'" ) : '';
        var chargePoints = chargePointsplit.length ? ( "'" + chargePointsplit.join("','") + "'" ) : '';
        
      this.httpDataService
        .post(AppConstants.APIUrlGetReservationReport, {
          startDate: Helper.getFormattedDate(this.startDate),
          endDate: Helper.getFormattedDate(this.endDate),
          tenants: tenants,
          sites: sites,
          chargePoints: chargePoints,
        })
        .subscribe(
          (res) => {
           
            this.dataSource.data = res;
            
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.cdref.detectChanges();
            this.process = false;
          },
          (error) => {
            this.process = false
            console.log(error);
          }
        );
    }
    else
    {
      this.process = false;
      this.popUpService.showMsg(AppConstants.FillMandatoryFields, AppConstants.EmptyUrl, AppConstants.Warning, AppConstants.Warning);
    }
  }

  translator() {
    this.translate.get('singleBinding.itemPage').subscribe(data => {
      this.paginator._intl.itemsPerPageLabel = data;
      this.paginator.ngOnInit();
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  buildTransactionForm() {
    this.ReservationForm = this.formBuilder.group({
      tenantName: [null, [Validators.required]],
      siteName: [null, [Validators.required]],
      chargePointName: [null, [Validators.required]],
      date: [null, [Validators.required]],
      enddate: [null, [Validators.required]],
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

  restoreTransactionList() {
    
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
      this.ReservationForm.patchValue({
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
     
      
  }

  toggleAllTenantSelection() {
    this.allTenantSelected = !this.allTenantSelected;
    let tenantArray: any[] = [];
    if (this.allTenantSelected) {
      tenantArray.push('select-all');
      for (let index = 0; index < this.tenants.length; index++) {
        tenantArray.push(this.tenants[index].tenantId);
        if (this.tenants.length - 1 === index) {
          this.ReservationForm.controls['tenantName'].setValue(tenantArray);
          this.tenantId = tenantArray;
          this.routerExtService.setRouteValue(AppConstants.TenantID, this.tenantList.toString());
          this.getsitesbytenants(tenantArray);
        }
      }
    } else {
      this.sites = [];
      this.ReservationForm.controls['tenantName'].setValue([]);
      this.ReservationForm.controls['siteName'].reset();
    }
  }

  toggleAllSiteSelection() {    
    this.allSiteSelected = !this.allSiteSelected;
    let tenantArray: string[] = this.ReservationForm.get('tenantName')?.value;
    let siteArray: any[] = [];
    if (this.allSiteSelected) {
      siteArray.push('select-all');
      for (let index = 0; index < this.sites.length; index++) {
        siteArray.push(this.sites[index].siteId);
        if (this.sites.length - 1 === index) {
          this.ReservationForm.controls['siteName'].setValue(siteArray);
          this.siteId = siteArray;
          this.siteList = siteArray;
          this.routerExtService.setRouteValue(AppConstants.SiteID, this.siteList.toString());
          this.getchargepointbysites(siteArray, tenantArray);
        }
      }
    } else {
      this.ReservationForm.controls['siteName'].setValue([]);
    }
  }


  charPointSelection() {    
    let chargePointArray: string[] = this.ReservationForm.get('chargePointName')?.value;
    const index = chargePointArray.indexOf('select-all');
    if (index > -1) {
      chargePointArray.splice(index, 1);
      this.allChargePointSelected = !this.allChargePointSelected;
    }
    this.ReservationForm.controls['chargePointName'].setValue(chargePointArray);
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
          this.ReservationForm.controls['chargePointName'].setValue(chargePointArray);
          this.chargePointId = chargePointArray;
          this.routerExtService.setRouteValue(AppConstants.ChargePointID, this.chargePointId.toString());
        }
      }
    } else {
      this.ReservationForm.controls['chargePointName'].setValue([]);
    }
  }



  siteSelection() {    
    let siteArray: string[] = this.ReservationForm.get('siteName')?.value;
    let tenantArray: string[] = this.ReservationForm.get('tenantName')?.value;
    const index = siteArray.indexOf('select-all');
    if (index > -1) {
      siteArray.splice(index, 1);
      this.allSiteSelected = !this.allSiteSelected;
    }
    this.ReservationForm.controls['siteName'].setValue(siteArray);
    this.siteList = siteArray;
    this.siteId = siteArray;
    if (siteArray[0] !== '') {
      this.getchargepointbysites(siteArray, tenantArray);
    }
    this.routerExtService.setRouteValue(AppConstants.SiteID, this.siteList.toString());
    this.ReservationForm.get('data')?.invalid;
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
    let tenantArray: string[] = this.ReservationForm.get('tenantName')?.value;
    const index = tenantArray.indexOf('select-all');
    if (index > -1) {
      tenantArray.splice(index, 1);
      this.allTenantSelected = !this.allTenantSelected;
    }
    this.sites = [];
    this.tenantList = tenantArray;
    this.tenantId = tenantArray;
    this.ReservationForm.controls['tenantName'].setValue(tenantArray);
    if (tenantArray[0] !== '') {
      this.getsitesbytenants(tenantArray);
    }
    this.routerExtService.setRouteValue(AppConstants.TenantID, this.tenantList.toString());
    this.ReservationForm.get('data')?.invalid;
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

  downloadCsvReport() {
    let csvData = this.ConvertToCSV(this.dataSource.data, [
      'reservationId',
      'chargePointId',
      'consumerId',
      'reservationStartDate',
      'reservationEndDate',
      'estimatedUnit',
      'estimatedAmount',
      'reservationExtended',
      'noShow',
      'errorInCharging'
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
    dwldLink.setAttribute('download', 'Reservation-Report.csv');
    dwldLink.style.visibility = 'hidden';
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  ConvertToCSV(objArray: any, headerList: any) {
    this.totalUserCount = this.dataSource.data.length;
    objArray.push({});
    objArray.push({});
    objArray.push({reservationId: 'Start Date : ', chargePointId: Helper.getFormattedDate(this.startDate)});
    objArray.push({reservationId: 'End Date : ', chargePointId: Helper.getFormattedDate(this.endDate)});
    objArray.push({reservationId: 'Total User Count : ', chargePointId: this.totalUserCount});
    // objArray.push({name: 'User Count : ', email: this.userCount});
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let row = '';
    let newHeaders = ['Reservation Id','ChargePoint Id','Consumer Id', 'Start Time', 'End Time', 'Estimated Unit', 'Estimated Amount','Reservation Extended','Noshow','Error in charging'];
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
        element.reservationId ? element.reservationId : '-',
        element.chargePointId ? element.chargePointId : '-',
        element.consumerId ? element.consumerId : '-',
        element.reservationStartDate ? element.reservationStartDate : '-',

        element.reservationEndDate ? element.reservationEndDate : '-',
        element.estimatedUnit ? element.estimatedUnit : '-',
        element.estimatedAmount ? element.estimatedAmount : '-',
        element.reservationExtended ? element.reservationExtended : '-',
        element.noShow ? element.noShow : '-',
        element.errorInCharging ? element.errorInCharging : '-',
      ]);
    });
    autoTable(doc, {
      showHead: 'everyPage',
      pageBreak: 'auto',
      margin: { top: 35 },
      head: [['Sr No.','Reservation Id','ChargePoint Id','Consumer Id', 'Start Time', 'End Time', 'Estimated Unit', 'Estimated Amount','Reservation Extended','Noshow','Error in charging']],
      body: data,
      didDrawPage: function (data) {
        img.src = 'assets/EV-Chargers-Logo.png';
        doc.addImage(img, 'png', 13, 10, 50, 20);
        doc.setFontSize(24);
        doc.setTextColor(0, 150, 0);
        doc.text('Reservation Report', 85, 23);
      },
    });
    doc.addPage();
    img.src = 'assets/EV-Chargers-Logo.png';
    doc.addImage(img, 'png', 13, 10, 50, 20);
    doc.setFontSize(24);
    doc.setTextColor(0, 150, 0);
    doc.text('Reservation Report', 85, 23);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Start Date : ' + Helper.getFormattedDate(this.startDate), 15, 40);
    doc.text('End Date : ' + Helper.getFormattedDate(this.endDate), 115, 40);

    // doc.text('User Count : ' + this.userCount, 115, 50);
    doc.save('Reservation-Report.pdf');
  }

  Clear(){
    this.ReservationForm.controls['tenantName'].reset();
    this.ReservationForm.controls['siteName'].reset();
    this.ReservationForm.controls['chargePointName'].reset();
  }
}
