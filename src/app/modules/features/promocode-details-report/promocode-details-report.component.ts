import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import Helper from '@app/shared/utility/Helper';
import { AppConstants } from 'src/app/constants';
import { HttpDataService } from '@app/shared/services/http-data.service';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { MatSort } from '@angular/material/sort';
import { Tenant } from '@app/models/tenant.model';
import { Site } from '@app/models/site.model';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { RouterExtService } from '@app/shared/services/routerExt.service';
import { PromoCode } from '@app/models/promocode.model';
import { PopUpService } from '@app/shared/utility/popup.service';

@Component({
  selector: 'app-promocode-details-report',
  templateUrl: './promocode-details-report.component.html',
  styleUrls: ['./promocode-details-report.component.css'],
})
export class PromocodeDetailsReportComponent {
  process = false;
  process1 = false
  maxDate = new Date();
  tenants: Tenant[];
  sites: Site[];
  promocodes : PromoCode[];
  allTenantSelected = false;
  allSiteSelected = false;
  tenantList: any;
  siteList: any;
  promocodeList:any;
  selectedTenants: any = [];
  selectedSites: any = [];
  selectedPromoCodes: any = [];
  promocodeForm: UntypedFormGroup;
  dataSource = new MatTableDataSource();
  displayedColumns: string[] = [
    'promocode',
    'promocodedetails',
    'validity',
    'transactions',
    'kwh',
    'totaldiscount',
    'billedamount',
  ];
  isDatepickerDisabled: boolean = false;
  selected = 'custom';
  startDate: any = '';
  endDate: any = '';
  ShowChart: boolean = true;
  userRole: string;
  showchartsection = false;
  tenantName: any;
  selectedDate: any;
  selectedendDate: any;
  siteId: any;
  allPromoCodeSelected = false;
  promoCodeId: any;

  promocodeUtilizationReportchartData: ChartDataSets[] = [];
  promocodeUtilizationReportchartLabel: Label[] = [];
  promocodeUtilizationReportchartLegend = true;
  promocodeUtilizationReportOptions: ChartOptions = {
    responsive: true,
  };
  promocodeUtilizationReportchartColors: Color[] = [];
  promocodeUtilizationReportchartPlugins: any = [];

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
    private httpDataService: HttpDataService,
    private cdref: ChangeDetectorRef,
    private routerExtService: RouterExtService,
    private popUpService: PopUpService
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
    this.getTenantNames();
    this.buildPromoCodeForm();
    this.restoreTransactionList();
    this.getPromoCodeList();
  }

  get hasTenantAdmin(): boolean {
    return this.userRole == 'Tenant_Admin';
  }

  getTenantNames() {
    return this.httpDataService.get(AppConstants.APIUrlTenantNameListtUrl).subscribe((res: Tenant[]) => {
      this.tenants = res.sort(this.SortArray);
    });
  }

  getPromoCodeList(){
    return this.httpDataService.get(AppConstants.APIUrlGetAllPromoCodeList).subscribe((res: PromoCode[]) => {
      this.promocodes = res;
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
      

      const sindex = sitearray.indexOf('select-all');
      if (sindex > -1) {
        sitearray.splice(sindex, 1);
      }
      const cindex = chargePointarray.indexOf('select-all');
      if (cindex > -1) {
        chargePointarray.splice(cindex, 1);
      }
      const pindex = chargePointarray.indexOf('select-all');
      if (cindex > -1) {
        chargePointarray.splice(cindex, 1);
      }
      this.promocodeForm.patchValue({
        date: this.selectedDate ? new Date(this.selectedDate) : '',
        enddate: this.selectedendDate ? new Date(this.selectedendDate) : '',
        tenantName: this.tenantList ? this.tenantList : '',
        siteName: this.siteList ? this.siteList : '',
        promocode: this.promocodes ? this.promocodes : ''
      });
      if (this.tenantList) {
        this.tenantSelection();
      }
      if (this.siteList) {
        this.siteSelection();
      }
      if (this.promocodes) {
        this.promocodeSelection();
      }
  }

  buildPromoCodeForm() {
    this.promocodeForm = this.formBuilder.group({
      tenantName: [null, [Validators.required]],
      siteName: [null, [Validators.required]],
      promocode: [null,[Validators.required]],
      date: [null, [Validators.required]],
      enddate: [null, [Validators.required]],
    });
  }

  toggleAllTenantSelection() {
    this.allTenantSelected = !this.allTenantSelected;
    let tenantArray: any[] = [];
    this.selectedTenants = [];
    if (this.allTenantSelected) {
      tenantArray.push('select-all');
      for (let index = 0; index < this.tenants.length; index++) {
        tenantArray.push(this.tenants[index].tenantId);
        this.selectedTenants.push(this.tenants[index].name);
        if (this.tenants.length - 1 === index) {
          this.promocodeForm.controls['tenantName'].setValue(tenantArray);
          this.getSitesFromTenants(tenantArray);
        }
      }
    } else {
      this.sites = [];
      this.promocodeForm.controls['tenantName'].setValue([]);
      this.promocodeForm.controls['siteName'].reset();
    }
  }

  tenantSelection() {
    let tenantArray: string[] = this.promocodeForm.get('tenantName')?.value;
    const index = tenantArray.indexOf('select-all');
    if (index > -1) {
      tenantArray.splice(index, 1);
      this.allTenantSelected = !this.allTenantSelected;
    }
    this.sites = [];
    this.tenantList = tenantArray;
    this.promocodeForm.controls['tenantName'].setValue(tenantArray);
    this.getSitesFromTenants(tenantArray);
  }

  getSitesFromTenants(tenantList: any) {
    this.sites = [];
    const index = tenantList.indexOf('select-all');
    if (index > -1) {
      tenantList.splice(index, 1);
    }
    this.httpDataService
      // .get(AppConstants.APIUrlTenantToSiteList + String(tenantList))
      .post(AppConstants.APIUrlTenantToSiteList, {
        'tenantId':this.tenantList.toString()
      })
      .subscribe((res) => {
        this.sites = res;
        this.promocodeForm.controls['siteName'].reset();
      });
  }

  toggleAllSiteSelection() {
    this.allSiteSelected = !this.allSiteSelected;
    let siteArray: any[] = [];
    this.selectedSites = [];
    if (this.allSiteSelected) {
      siteArray.push('select-all');
      for (let index = 0; index < this.sites.length; index++) {
        siteArray.push(this.sites[index].siteId);
        this.selectedSites.push(this.sites[index].name);
        if (this.sites.length - 1 === index) {
          this.promocodeForm.controls['siteName'].setValue(siteArray);
        }
      }
    } else {
      this.promocodeForm.controls['siteName'].setValue([]);
    }
  }

  siteSelection() {
    let siteArray: string[] = this.promocodeForm.get('siteName')?.value;
    const index = siteArray.indexOf('select-all');
    if (index > -1) {
      siteArray.splice(index, 1);
      this.allSiteSelected = !this.allSiteSelected;
    }
    this.siteList = siteArray;
    this.promocodeForm.controls['siteName'].setValue(siteArray);
  }

  toggleAllPromoCodeSelection() {   
    this.allPromoCodeSelected = !this.allPromoCodeSelected;
    let promoCodeArray: any[] = [];
    if (this.allPromoCodeSelected) {
      promoCodeArray.push('select-all');
      for (let index = 0; index < this.promocodes.length; index++) {
        promoCodeArray.push(this.promocodes[index].promoCodeID);
        if (this.promocodes.length - 1 === index) {
          this.promocodeForm.controls['promocode'].setValue(promoCodeArray);
          this.promoCodeId = promoCodeArray;
          //this.routerExtService.setRouteValue(AppConstants.ChargePointID, this.promoCodeId.toString());
        }
      }
    } else {
      this.promocodeForm.controls['promocode'].setValue([]);
    }
  }

  promocodeSelection() {    
    let promoCodeArray: string[] = this.promocodeForm.get('promocode')?.value;
    const index = promoCodeArray.indexOf('select-all');
    if (index > -1) {
      promoCodeArray.splice(index, 1);
      this.allPromoCodeSelected = !this.allPromoCodeSelected;
    }
    this.promocodeForm.controls['promocode'].setValue(promoCodeArray);
    this.promoCodeId = promoCodeArray;
    //this.routerExtService.setRouteValue(AppConstants.ChargePointID, this.promoCodeId.toString());
  }

  getReport() {
    if (this.promocodeForm.valid) {
      this.process1 = true;

      this.dataSource.data = [];
      const tindex = this.promocodeForm
        .get('tenantName')
        ?.value.indexOf('select-all');
      if (tindex > -1) {
        this.promocodeForm.get('tenantName')?.value.splice(tindex, 1);
      }
      const sindex = this.promocodeForm
        .get('siteName')
        ?.value.indexOf('select-all');
      if (sindex > -1) {
        this.promocodeForm.get('siteName')?.value.splice(sindex, 1);
      }
      const pindex = this.promocodeForm
        .get('promocode')
        ?.value.indexOf('select-all');
      if (tindex > -1) {
        this.promocodeForm.get('promocode')?.value.splice(tindex, 1);
      }
      this.promocodeForm.get('tenantName')?.value.forEach((item: any) => {
        this.tenants.forEach((element: any) => {
          if (element.tenantId === item.tenantId) {
            this.selectedTenants.push(element.name);
          }
        });
      });
      this.promocodeForm.get('siteName')?.value.forEach((item: any) => {
        this.sites.forEach((element: any) => {
          if (element.siteId === item.siteId) {
            this.selectedSites.push(element.name);
          }
        });
      });
      this.promocodeForm.get('promocode')?.value.forEach((item: any) => {
        this.promocodes.forEach((element: any) => {
          if (element.promoCodeID === item.promoCodeID) {
            this.selectedPromoCodes.push(element.promoCode);
          }
        });
      });
      this.httpDataService
        .post(AppConstants.APIUrlGetPromoCodeDetails, {
          tenants:
            "'" + this.promocodeForm.get('tenantName')?.value.join("','") + "'",
          sites: "'" + this.promocodeForm.get('siteName')?.value.join("','") + "'",
          transactionStartDate: Helper.getFormattedDate(this.startDate),
          transactionEndDate: Helper.getFormattedDate(this.endDate),
          promocodes : "'" + this.promocodeForm.get('promocode')?.value.join("','") + "'",
        })
        .subscribe(
          (res) => {
            
            this.process1 = false;
            console.log(res);
            var resultArray: any = [];
            let totaltransaction: any = [];
            let totalkwh: any = [];
            let totalamount :any = [];
            // res.data.promocodeSummaries.forEach((element: any) => {
            //   resultArray.push({
            //     promocode: element.promocode,
            //     tenant: '',
            //     site: '',
            //     chargePoint: '',
            //     discountAmount: element.totalDiscountAmount,
            //     noofTimesUsed: element.totalUsage,
            //   });
            //   res.data.utilizationReportResponses.forEach((resElement: any) => {
            //     if (resElement.promocode === element.promocode) {
            //       resultArray.push({
            //         promocode: resElement.promocode,
            //         tenant: resElement.tenant,
            //         site: resElement.site,
            //         chargePoint: resElement.chargePoint,
            //         discountAmount: resElement.discountAmount,
            //         noofTimesUsed: resElement.noofTimesUsed,
            //       });
            //     }
            //   });
            // });
            //this.dataSource.data = resultArray;

            this.dataSource.data = res.data.utilizationReportResponses;
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.cdref.detectChanges();
            this.process1 = false;
            this.process = false;
            this.showchartsection = true;
            this.promocodeUtilizationReportchartLabel = [];

            res.data.utilizationReportResponses.forEach(
              (element: any, index: number) => {
                totaltransaction.push(element.noofTimesUsed);
                totalkwh.push(element.kwh);
                totalamount.push(element.billAmount);
                this.promocodeUtilizationReportchartLabel.push(element.promocode);
                
                this.promocodeUtilizationReportchartData = [
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
        // this.hideDaily = false;
        // this.hideWeekly = true;
        // this.hideMonthly = true;
        // this.hideQuarterly = true;
        break;

      case 'last30Days':
        
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 30);
        this.isDatepickerDisabled = true;
        // this.hideDaily = false;
        // this.hideWeekly = false;
        // this.hideMonthly = true;
        // this.hideQuarterly = true;
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
        // this.hideDaily = false;
        // this.hideWeekly = true;
        // this.hideMonthly = true;
        // this.hideQuarterly = true;
        break;
  
      case 'monthToDate':
        
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        this.isDatepickerDisabled = true;
        // this.hideDaily = false;
        // this.hideWeekly = false;
        // this.hideMonthly = true;
        // this.hideQuarterly = true;
        break;
  
      case 'yearToDate':
        
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        this.isDatepickerDisabled = true;
        // this.hideDaily = true;
        // this.hideWeekly = true;        
        // this.hideMonthly = false;
        // this.hideQuarterly = false;
        break;
  
      case 'thisQuater':
        
        const currentMonth = currentDate.getMonth();
        const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
        startDate = new Date(currentDate.getFullYear(), quarterStartMonth, 1);
        endDate = new Date(currentDate.getFullYear(), quarterStartMonth + 3, 0);        
        this.isDatepickerDisabled = true;
        // this.hideDaily = true;
        // this.hideWeekly = true;
        // this.hideMonthly = false;        
        // this.hideQuarterly = true;
        break; 

      case 'lastQuarter':
        
        const lastQuarterStartMonth = (Math.floor((currentDate.getMonth() - 3) / 3) * 3);
        startDate = new Date(currentDate.getFullYear(), lastQuarterStartMonth, 1);
        endDate = new Date(currentDate.getFullYear(), lastQuarterStartMonth + 3, 0); 
        this.isDatepickerDisabled = true;
        // this.hideDaily = true;
        // this.hideWeekly = true;
        // this.hideMonthly = false;
        // this.hideQuarterly = true;
        break;

      case 'lastYear':
        
        startDate = new Date(currentDate.getFullYear() - 1, 0, 1); // First day of last year
        endDate = new Date(currentDate.getFullYear() - 1, 11, 31); // Last day of last year
        this.isDatepickerDisabled = true;
        // this.hideDaily = true;
        // this.hideWeekly = true;
        // this.hideMonthly = false;
        // this.hideQuarterly = false;
        break;
      
      case 'custom':
        
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 1);
        this.isDatepickerDisabled = false;  
        // this.hideDaily = false;
        // this.hideWeekly = false;
        // this.hideMonthly = false;
        // this.hideQuarterly = false;   
        break;
    }
    if (startDate) {
      this.startDate = startDate;  
      this.endDate = endDate ? this.endDate = endDate : this.endDate = new Date(currentDate);        
    }
    
    this.process = false;
    //this.process1 = false;
  } 

  Generatechart(){
    this.getReport();
     //this.selectDuration(this.selected, this.FilterType,'generateChart')
  }

  Clear(){
    this.promocodeForm.controls['tenantName'].reset();
    this.promocodeForm.controls['siteName'].reset();
    this.promocodeForm.controls['promocode'].reset();
  }

  downloadCsvReport() {
    let csvData = this.ConvertToCSV(this.dataSource.data, [
      'promocode',
      'promoCodeDescription',
      'validityEndDate',
      'noofTimesUsed',
      'kwh',
      'discountAmount',
      'billAmount'
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
    dwldLink.setAttribute('download', 'PromoCode-Utilization-Report.csv');
    dwldLink.style.visibility = 'hidden';
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  ConvertToCSV(objArray: any, headerList: any) {
    objArray.push({});
    objArray.push({});
    objArray.push({promocode: 'Start Date : ', promoCodeDescription: Helper.getFormattedDate(this.startDate)});
    objArray.push({promocode: 'End Date : ', promoCodeDescription: Helper.getFormattedDate(this.endDate)});
    
    
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let row = '';
    let newHeaders = [
      'Promo Code',
      'PromoCode Description',
      'Validity',
      'Transactions',
      'KWH',
      'Total Discount',
      'Billed Amount'
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
    var ridxs: any = [];
    var pageWidth = parseInt(doc.internal.pageSize.width.toFixed(0));
    this.dataSource.data.forEach((element: any, index: any) => {
      if (element.promocode) {
        ridxs.push(index);
      }
      data.push([
        index + 1,
        element.promocode ? element.promocode : '-',
        element.promoCodeDescription ? element.promoCodeDescription : '-',
        element.validityEndDate ? element.validityEndDate : '-',
        element.noofTimesUsed ? element.noofTimesUsed : '-',
        element.kwh ? element.kwh : '-',
        element.discountAmount ? element.discountAmount : '-',
        element.billAmount ? element.billAmount : '-',
      ]);
    });
    autoTable(doc, {
      showHead: 'everyPage',
      pageBreak: 'auto',
      margin: { top: 35 },
      head: [
        [
          'Promo Code',
          'PromoCode Description',
          'Validity',
          'Transactions',
          'KWH',
          'Total Discount',
          'Billed Amount'
        ],
      ],
      body: data,
      didDrawPage: function (data) {
        img.src = 'assets/EV-Chargers-Logo.png';
        doc.addImage(img, 'png', 13, 10, 50, 20);
        doc.setFontSize(24);
        doc.setTextColor(0, 150, 0);
        doc.text('PromoCode Utilization Report', 135, 23);
      },
      didParseCell: function (data) {
        if (data.section === 'head') {
          data.cell.styles.textColor = '#ffffff';
        } else if (ridxs.includes(data.row.index)) {
          data.cell.styles.textColor = 'white';
          data.cell.styles.fillColor = [84, 187, 109];
        }
      },
    });
    doc.addPage();
    img.src = 'assets/EV-Chargers-Logo.png';
    doc.addImage(img, 'png', 13, 10, 50, 20);
    doc.setFontSize(24);
    doc.setTextColor(0, 150, 0);
    doc.text('PromoCode Utilization Report', 135, 23);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(
      'Start Date : ' +
      Helper.getFormattedDate(this.startDate),
      15,
      40
    );
    doc.text(
      'End Date : ' +
      Helper.getFormattedDate(this.endDate),
      125,
      40
    );
    // var dim = doc.getTextDimensions(this.selectedTenants.join(", "));
    // var height = Math.ceil(dim.w / 270);
    
    doc.addPage();
    img.src = 'assets/EV-Chargers-Logo.png';
    doc.addImage(img, 'png', 13, 10, 50, 20);
    doc.setFontSize(24);
    doc.setTextColor(0, 150, 0);
    doc.text('PromoCode Utilization Report', 135, 23);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    doc.save('PromoCode-Utilization-Report.pdf');
  }

  getCharts(event: any){
    this.ShowChart = event.checked;
  }
}
