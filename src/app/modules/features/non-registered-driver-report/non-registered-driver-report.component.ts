import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import Helper from '@app/shared/utility/Helper';
import { AppConstants } from 'src/app/constants';
import { HttpDataService } from '@app/shared/services/http-data.service';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { MatSort } from '@angular/material/sort';
import { Tenant } from '@app/models/tenant.model';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ChartDataset as ChartDataSets, ChartOptions,Color } from 'chart.js';
//import { Color, Label } from 'ng2-charts';
type Label = string;
@Component({
  selector: 'app-non-registered-driver-report',
  templateUrl: './non-registered-driver-report.component.html',
  styleUrls: ['./non-registered-driver-report.component.css'],
})
export class NonRegisteredDriverReportComponent {
  process = false;
  tenants: Tenant[];
  tenant: any = '';
  maxDate = new Date();
  process1 = false
  startDate: any = '';
  endDate: any = '';
  dataSource = new MatTableDataSource();
  displayedColumns: string[] = ['name', 'email', 'mobile', 'registrationDate'];
  isDatepickerDisabled: boolean = false;
  selected = 'custom';
  FilterType: any = 'Daily';
  hideDaily: boolean = false;
  hideWeekly: boolean = false;
  hideMonthly: boolean = false;
  hideQuarterly: boolean = false;
  ShowChart: boolean = true;
  userCount: any = '';
  totalUserCount: any = '';
  nondriverRegReportchartData: ChartDataSets[] = [];
  nondriverRegReportchartLabel: Label[] = [];
  nondriverRegReportchartLegend = true;
  nondriverRegReportOptions: ChartOptions = {
    responsive: true,
  };
  nondriverRegReportchartColors: Color[] = [];
  nondriverRegReportchartPlugins: any = [];
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
    private httpDataService: HttpDataService,
    private cdref: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    this.getTenantNames();
    if(this.selected = 'custom'){
      const currentDate = new Date();
      let startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - 1);
      this.FilterType = 'Daily';
      this.startDate = startDate
      this.endDate = new Date(currentDate); 
      this.getReport();    
    }
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

  getTenantNames() {
    return this.httpDataService
      .get(AppConstants.APIUrlTenantNameListtUrl)
      .subscribe((res: Tenant[]) => {
        this.tenants = res.sort(this.SortArray);
      });
  }

  // getReport() {
  //   if (this.startDate && this.endDate && this.tenant) {
  //     this.process = true;
  //     this.dataSource.data = [];
  //     this.httpDataService
  //       .post(AppConstants.APIUrlGetNonRegisteredDriver, {
  //         startDate: Helper.getFormattedDate(this.startDate),
  //         endDate: Helper.getFormattedDate(this.endDate),          
  //         tenantId: this.tenant.tenantId,
  //       })
  //       .subscribe(
  //         (res) => {
  //           this.dataSource.data = res.data;
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
    if (this.startDate && this.endDate && this.tenant) {
      this.process = true;
      this.process1 = true
      this.dataSource.data = [];
      let noofTransactions: any = [];
      let totaluserCount: any = [];
      this.httpDataService
        .post(AppConstants.APIUrlGetNonRegisteredDriver, {
          startDate: Helper.getFormattedDate(this.startDate),
          endDate: Helper.getFormattedDate(this.endDate),          
          tenantId: this.tenant.tenantId,
          FilterType: this.FilterType,
        })
        .subscribe(
          (res) => {
            this.nondriverRegReportchartLabel = [];
            this.dataSource.data = res.data.nonDriverRegistrationReports;
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.cdref.detectChanges();
            this.totalUserCount = res.totalUserCount;
            this.userCount = res.userCount;
            const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            this.process = false;
            this.process1 = false;

            //Bar Chart
            if(this.FilterType == "Weekly")
            {
              res.data.weekWiseTotalCount.push({nooftransactions: 0,startOfWeekDate: ""})
              res.data.weekWiseTotalCount.forEach(
                (element: any, index: number) => {
                  noofTransactions.push(element.nooftransactions);                  
                  // this.nondriverRegReportchartLabel.push(element.startOfWeekDate);
                  this.nondriverRegReportchartLabel.push(element.nooftransactions != 0 ? "Week-"+(index+1) + " " + "(" + element.startOfWeekDate + ")" : "");
                  this.nondriverRegReportchartData = [
                    {
                      label: 'Non Driver Registration Report',
                      data: noofTransactions,
                      borderWidth: 1,
                      backgroundColor: 'rgba(54, 162, 235, 0.2)',
                      borderColor: 'rgb(54, 162, 235)',
                      hoverBackgroundColor:  'rgba(54, 162, 235)',
                      hoverBorderColor: 'rgb(54, 162, 235)',
                    },
                  ];                
                }
            );
            }
            else if (this.FilterType == "Monthly")
            {
              res.data.monthTotalCount.push({nooftransactions: 0,monthly: ""})
              res.data.monthTotalCount.forEach(
                (element: any, index: number) => { 
                  const monthParts = element.monthly.split('-');
                  const monthNumber = parseInt(monthParts[0]);
                  const yearNumber = parseInt(monthParts[1]);
                  totaluserCount.push(element.nooftransactions)
                  const monthLabel = monthNumber < monthNames.length ? (monthNames[monthNumber] +"-"+ yearNumber): '';
                  // this.driverRegReportchartLabel.push(element.monthly);
                  this.nondriverRegReportchartLabel.push(monthLabel);
                  this.nondriverRegReportchartData = [
                    {
                      label: 'Non Registered Driver Report',
                      data: totaluserCount,
                      borderWidth: 1,     
                      backgroundColor: 'rgba(54, 162, 235, 0.2)',
                      borderColor: 'rgb(54, 162, 235)',
                      hoverBackgroundColor:  'rgba(54, 162, 235)',
                      hoverBorderColor: 'rgb(54, 162, 235)',               
                    },
                  ];                
                }
              );
            }
            else if (this.FilterType == "Quarterly")
            {
              res.data.quarterlyWiseTotalCount.push({nooftransactions: 0,quarterly: ""})
              res.data.quarterlyWiseTotalCount.forEach(
                (element: any, index: number) => {
                  const quarterParts = element.quarterly.split('-');
                  const quarterNumber = parseInt(quarterParts[1]);
                  const quarterYear = parseInt(quarterParts[0]);
                  totaluserCount.push(element.nooftransactions)
                  this.nondriverRegReportchartLabel.push(element.nooftransactions != 0 ? "Q"+(quarterNumber) + " " + "(" + quarterYear + ")" : "");
                  this.nondriverRegReportchartData = [
                    {
                      label: 'Non Registered Driver Report',
                      data: totaluserCount,
                      borderWidth: 1,
                      backgroundColor: 'rgba(54, 162, 235, 0.2)',
                      borderColor: 'rgb(54, 162, 235)',
                      hoverBackgroundColor:  'rgba(54, 162, 235)',
                      hoverBorderColor: 'rgb(54, 162, 235)',
                    },
                  ];                
                }
              );
            }
            else{
                res.data.dateWiseTotalCount.push({nooftransactions: 0,registrationDate: ""})
                res.data.dateWiseTotalCount.forEach(                 
                  (element: any, index: number) => {
                    noofTransactions.push(element.nooftransactions);                  
                    this.nondriverRegReportchartLabel.push(element.registrationDate);
                    this.nondriverRegReportchartData = [
                      {
                        label: 'Non Driver Registration Report',
                        data: noofTransactions,
                        borderWidth: 1,
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgb(54, 162, 235)',
                        hoverBackgroundColor:  'rgba(54, 162, 235)',
                        hoverBorderColor: 'rgb(54, 162, 235)',
                      },
                    ];                
                  }
                );                
            }   
          },
          (error) => {
            this.process1 = false
            console.log(error);
          }
        );                 
    }
  }

  downloadCsvReport() {
    let csvData = this.ConvertToCSV(this.dataSource.data, [
      'name',
      'email',
      'mobile',
      'registrationDate',
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
    dwldLink.setAttribute('download', 'Non-Registered-Driver-Report.csv');
    dwldLink.style.visibility = 'hidden';
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  ConvertToCSV(objArray: any, headerList: any) {
    objArray.push({});
    objArray.push({});
    objArray.push({name: 'Start Date : ', email: Helper.getFormattedDate(this.startDate)});
    objArray.push({name: 'End Date : ', email: Helper.getFormattedDate(this.endDate)});
    objArray.push({name: 'Organization : ', email: this.tenant.name});
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let row = '';
    let newHeaders = ['Name', 'Email', 'Phone', 'Date Registered'];
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
      orientation: 'portrait',
      format: 'a4',
      compress: true,
    });
    this.dataSource.data.forEach((element: any, index: any) => {
      data.push([
        index + 1,
        element.name ? element.name : '-',
        element.email ? element.email : '-',
        element.mobile ? element.mobile : '-',
        element.registrationDate ? element.registrationDate : '-',
      ]);
    });
    autoTable(doc, {
      showHead: 'everyPage',
      pageBreak: 'auto',
      margin: { top: 35 },
      head: [['Sr. No.', 'Name', 'Email', 'Phone', 'Date Registered']],
      body: data,
      didDrawPage: function (data) {
        img.src = 'assets/EV-Chargers-Logo.png';
        doc.addImage(img, 'png', 13, 10, 50, 20);
        doc.setFontSize(24);
        doc.setTextColor(0, 150, 0);
        doc.text('Non-Registered Driver Report', 75, 23);
      },
    });
    doc.addPage();
    img.src = 'assets/EV-Chargers-Logo.png';
    doc.addImage(img, 'png', 13, 10, 50, 20);
    doc.setFontSize(24);
    doc.setTextColor(0, 150, 0);
    doc.text('Non-Registered Driver Report', 75, 23);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Start Date : ' + Helper.getFormattedDate(this.startDate), 15, 40);
    doc.text('End Date : ' + Helper.getFormattedDate(this.endDate), 115, 40);
    doc.text('Organization : ' + this.tenant.name, 15, 50);
    doc.save('Non-Registered-Driver-Report.pdf');
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
      this.getReport();
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
