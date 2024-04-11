import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import Helper from '@app/shared/utility/Helper';
import { AppConstants } from 'src/app/constants';
import { HttpDataService } from '@app/shared/services/http-data.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Tenant } from '@app/models/tenant.model';
import { Site } from '@app/models/site.model';
import { UntypedFormBuilder, UntypedFormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-financial-revenue-report',
  templateUrl: './financial-revenue-report.component.html',
  styleUrls: ['./financial-revenue-report.component.css'],
})
export class FinancialRevenueReportComponent {
  selectedObj: any = '';
  selectedMonth: any = '';
  process = false;
  apiNoData = false;
  maxDate = new Date();
  tenants: Tenant[];
  sites: Site[];
  reportExtraData: any;
  financialRevenueForm: UntypedFormGroup;
  dataSource = new MatTableDataSource();
  reportArray: any = [];
  displayedColumns: string[] = [
    'transactionLogId',
    'stationId',
    'startTime',
    'stopTime',
    'status',
    'kwh',
    'chargingRate',
    'amount',
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
    private httpDataService: HttpDataService,
    private cdref: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getTenantNames();
    this.buildFinancialRevenueForm();
  }

  getTenantNames() {
    return this.httpDataService
      .get(AppConstants.APIUrlTenantNameListtUrl)
      .subscribe((res: Tenant[]) => {
        this.tenants = res.sort(this.SortArray);
        if (this.tenants.length === 1) {
          this.financialRevenueForm.get('tenants')?.setValue(this.tenants[0]);
          this.tenantSelection();
        }
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

  buildFinancialRevenueForm() {
    this.financialRevenueForm = this.formBuilder.group({
      startDate: [null, [Validators.required]],
      endDate: [null, [Validators.required]],
      tenants: [null, [Validators.required]],
      sites: [null, [Validators.required]],
    });
  }

  get startDate(): boolean {
    return !Helper.isNullOrWhitespace(
      this.financialRevenueForm.get('startDate')?.value
    );
  }

  get endDate(): boolean {
    return !Helper.isNullOrWhitespace(
      this.financialRevenueForm.get('endDate')?.value
    );
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
          this.financialRevenueForm.get('tenants')?.value.tenantId +
          '/false/1/1000'
      )
      .subscribe((res) => {
        this.sites = res;
        this.financialRevenueForm.controls['sites'].reset();
        if (this.sites.length === 1) {
          this.financialRevenueForm.get('sites')?.setValue(this.sites[0]);
        }
      });
  }

  resetForm(formDirective: FormGroupDirective) {
    this.selectedMonth = '';
    formDirective.resetForm();
    this.financialRevenueForm.reset();
    this.dataSource.data = [];
  }

  closeStartDatePicker(eventData: any, picker:any) {
    const dt = new Date(eventData);
    this.selectedObj = dt;
    this.selectedMonth = dt.toLocaleString('default', {
      month: 'long'
    }) + ' ' + dt.getFullYear();
    picker.close();
  }

  getReport() {
    this.process = true;
    this.dataSource.data = [];
    this.reportArray = [];
    this.httpDataService
      .post(AppConstants.APIUrlGetFinancialRevenue, {
        tenantId: this.financialRevenueForm.get('tenants')?.value.tenantId,
        siteId: this.financialRevenueForm.get('sites')?.value.siteId,
        chargePointId: '',
        reportMonth: parseInt(this.selectedObj.getMonth()) + 1,
        reportYear: this.selectedObj.getFullYear()
        // startDate: Helper.getFormattedDate(
        //   this.financialRevenueForm.get('startDate')?.value
        // ),
        // endDate: Helper.getFormattedDate(
        //   this.financialRevenueForm.get('endDate')?.value
        // ),
      })
      .subscribe(
        (res) => {
          if (res.data.chargePointList.length) {
            this.apiNoData = false;
          } else {
            this.apiNoData = true;
          }
          res.data.chargePointList.forEach((d: any) => {
            let startTime = new Date(d.startTime);
            d.startTime = startTime.toLocaleString('en-US', {
              timeZone: 'CST',
            });
            let stopTime = new Date(d.stopTime);
            d.stopTime = stopTime.toLocaleString('en-US', { timeZone: 'CST' });
            d.kwh = d?.kwh?.toFixed(2);
            d.amount = d?.amount?.toFixed(2);
          });
          this.dataSource.data = res.data.chargePointList.length
            ? res.data.chargePointList
            : [];
          this.reportArray = res.data.chargePointList.length
            ? [...res.data.chargePointList]
            : [];
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.reportExtraData = res.data;
          this.cdref.detectChanges();
          this.process = false;
          this.reportArray.push({});
          this.reportArray.push({});
        },
        (error) => {
          this.apiNoData = true;
          console.log(error);
          this.process = false;
        }
      );
  }

  downloadExcelReport() {
    // let csvData = this.ConvertToCSV(this.reportArray, [
    //   'transactionLogId',
    //   'stationId',
    //   'startTime',
    //   'stopTime',
    //   'status',
    //   'kwh',
    //   'chargingRate',
    //   'amount',
    // ]);
    // let blob = new Blob(['\ufeff' + csvData], {
    //   type: 'text/csv;charset=utf-8;',
    // });
    // let dwldLink = document.createElement('a');
    // let url = URL.createObjectURL(blob);
    // let isSafariBrowser =
    //   navigator.userAgent.indexOf('Safari') != -1 &&
    //   navigator.userAgent.indexOf('Chrome') == -1;
    // if (isSafariBrowser) {
    //   dwldLink.setAttribute('target', '_blank');
    // }
    // dwldLink.setAttribute('href', url);
    // dwldLink.setAttribute('download', 'Financial-Revenue-Report.csv');
    // dwldLink.style.visibility = 'hidden';
    // document.body.appendChild(dwldLink);
    // dwldLink.click();
    // document.body.removeChild(dwldLink);


    // const data:any[] = [
    //   { name: 'John', age: 30 },
    //   { name: 'Jane', age: 25 },
    //   { name: 'Bob', age: 40 }
    // ];

    const centerAlignment: any = { vertical: 'middle', horizontal: 'center' };
    const blueFont: any = {
      name: 'Arial',
      size: 28,
      underline: 'none',
      bold: true,
      color: { argb: '1852a1' }
    };
    const blueHeaderFont: any = {
      name: 'Arial',
      size: 20,
      underline: 'none',
      bold: true,
      color: { argb: '1852a1' }
    };
    const whiteFont: any = {
      name: 'Arial',
      size: 13,
      underline: 'none',
      bold: true,
      color: { argb: 'ffffff' }
    };
    const blackFont: any = {
      name: 'Arial',
      size: 13,
      underline: 'none',
      bold: true,
      color: { argb: '000000' }
    };
    const blueBackground: any = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1852A1' }
    };
    const grayBackground: any = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'E7E6E6' }
    };
    const leftWhiteBorder: any = {
      right: {
        style: 'medium',
        color: { argb: 'ffffff' }
      }
    };
    const blackBorder: any = {
      right: {
        style: 'thin',
        color: { argb: '000000' }
      },
      left: {
        style: 'thin',
        color: { argb: '000000' }
      },
      top: {
        style: 'thin',
        color: { argb: '000000' }
      },
      bottom: {
        style: 'thin',
        color: { argb: '000000' }
      }
    };

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('My Sheet');

    worksheet.views = [{
      showGridLines: false
    }];
    worksheet.properties.showGridLines = false;

    worksheet.getColumn(1).width = 30;
    worksheet.getColumn(2).width = 30;
    worksheet.getColumn(3).width = 30;
    worksheet.getColumn(4).width = 30;
    worksheet.getRow(1).height = 50;
    worksheet.getRow(2).height = 50;

    let logoImage = workbook.addImage({
      base64: 'data:image/png;base64,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RETeiw1yIiIiIiIiDzR5VFyv9wkL0+C6K4biuiuGwul04cixWuw9VIGcvDocq2hCUatl0DkCFMD4mBAsmJCM65YOR0pSyKCPOVjvfHpMdAQiIiIiIiIi8lJskBMREREREXmg2VOT+3V/pVKBCWNjMWFs7LnbGhrMOHaqDmcKG1BTb0Kt0YSaZjPqTRZYHU60Wu1o/2ZEe7BKCb1ahbjQIMSEBiEtIQxZQ6IwbVICYmOC3frcBuN0nhGfHa8SHYOIiIiIiIiIvBQb5ERERERERB5maJgWwzINgz5OZGQQ5s1KxrxZ/Wu2e7K///cgrC6X6BhERERERERE5KUu3tCOiIiIiIiIhJqaESU6gkfaubcCn3D1OBERERERERENAhvkREREREREHmbquCTRETyOzebEc2/tA9eOExEREREREdFgsEFORERERETkQdQKYM40Nsi7+uu/9+NgTavoGERERERERETk5dggJyIiIiIi8iDjY0MRFaUVHcOj7D1QhX9sPiM6BhERERERERH5ADbIiYiIiIiIPMiU4bGiI3iUyioTfvbyNlicHK5ORERERERERIPHBjkREREREZEHmT6R49U7tbZZ8cizG1HUahEdhYiIiIiIiIh8BBvkREREREREHiJMrcS0SfGiY3gEi8WBh3+7ATvKm0RHISIiIiIiIiIfohIdgIiIiIiIiM6almJAUBD/TDOb7XjotxvwdUG96ChERERERERE5GN45oWIiIiIiMhDTBwRJzqCcI1NFjz42/XYUmIUHYWIiIiIiIiIfBAb5ERERERERB5i9tRk0RGEOnayDj/981acbGwXHYWIiIiIiIiIfBQb5ERERERERB4gRReIMSOjRccQ5s33juHPnx1Fo80pOgoRERERERER+TA2yImIiIiIiDzA9Iwo0RGEKCxuwe9f3cH9xomIiIiIiIhIFmyQExEREREReYCoiGDREWTVZrLh9XeO4N+bTqOZq8aJiIiIiIiISCZskBMREREREXmAV7fmY/epGixfmo0brhoGpVIhOpIkzGY7/vfJCbyx9hRK2qyi4xARERERERGRn2GDnIiIiIiIyEMcqm3Fobf34h+f52DZpFTcsCwL6WmhomO5RU1tO95deQIf7CxAmYmNcSIiIiIiIiISgw1yIiIiIiIiD3O6qQOnN+TipY25mJtiwLxJyVg0ZwhSk0NE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',
      extension: 'png',
    });
    worksheet.mergeCells('A1:A2');
    worksheet.mergeCells('D1:D2');
    worksheet.mergeCells('B1:C2');
    worksheet.addImage(logoImage, 'B1:C2');

    worksheet.getRow(3).height = 35;
    worksheet.mergeCells('A3', 'D3');
    let titleRow = worksheet.getCell('A3');
    titleRow.value = 'MONTHLY FINANCIAL REPORT';
    titleRow.font = blueFont;
    titleRow.alignment = centerAlignment;

    worksheet.mergeCells('A5', 'B5');
    worksheet.getRow(5).height = 25;
    let header1Row = worksheet.getCell('A5');
    header1Row.value = 'MONTH';
    header1Row.fill = blueBackground;
    header1Row.border = leftWhiteBorder;
    header1Row.font = whiteFont;
    header1Row.alignment = centerAlignment;
    worksheet.mergeCells('C5', 'D5');
    let header2Row = worksheet.getCell('C5');
    header2Row.value = 'TOTAL REIMBURSEMENT';
    header2Row.fill = blueBackground;
    header2Row.font = whiteFont;
    header2Row.alignment = centerAlignment;
    worksheet.mergeCells('A6', 'B6');
    worksheet.getRow(6).height = 25;
    let value1Row = worksheet.getCell('A6');
    value1Row.value = this.selectedObj.toLocaleString('default', { month: 'long' });
    value1Row.border = blackBorder;
    value1Row.font = blackFont;
    value1Row.alignment = centerAlignment;
    worksheet.mergeCells('C6', 'D6');
    let value2Row = worksheet.getCell('C6');
    value2Row.value = '$ ' + this.reportExtraData.totalReimbursement.toFixed(2);
    value2Row.border = blackBorder;
    value2Row.font = blackFont;
    value2Row.alignment = centerAlignment;

    worksheet.mergeCells('A9', 'D9');
    worksheet.getRow(9).height = 28;
    let headerRow = worksheet.getCell('A9');
    headerRow.value = 'Financial Revenue Report';
    headerRow.border = blackBorder;
    headerRow.font = blueHeaderFont;
    headerRow.alignment = centerAlignment;

    worksheet.mergeCells('A10', 'B10');
    worksheet.getRow(10).height = 23;
    let key1 = worksheet.getCell('A10');
    key1.value = 'Customer Id';
    key1.fill = blueBackground;
    key1.border = blackBorder;
    key1.font = whiteFont;
    key1.alignment = centerAlignment;
    worksheet.mergeCells('C10', 'D10');
    let value1 = worksheet.getCell('C10');
    value1.value = this.reportExtraData.customerId;
    value1.fill = grayBackground;
    value1.border = blackBorder;
    value1.font = blackFont;
    value1.alignment = centerAlignment;
    worksheet.mergeCells('A11', 'B11');
    worksheet.getRow(11).height = 23;
    let key2 = worksheet.getCell('A11');
    key2.value = 'Site';
    key2.fill = blueBackground;
    key2.border = blackBorder;
    key2.font = whiteFont;
    key2.alignment = centerAlignment;
    worksheet.mergeCells('C11', 'D11');
    let value2 = worksheet.getCell('C11');
    value2.value = this.financialRevenueForm.get('sites')?.value.name;
    value2.border = blackBorder;
    value2.font = blackFont;
    value2.alignment = centerAlignment;
    worksheet.mergeCells('A12', 'B12');
    worksheet.getRow(10).height = 23;
    let key3 = worksheet.getCell('A12');
    key3.value = 'Selected Month';
    key3.fill = blueBackground;
    key3.border = blackBorder;
    key3.font = whiteFont;
    key3.alignment = centerAlignment;
    worksheet.mergeCells('C12', 'D12');
    let value3 = worksheet.getCell('C12');
    value3.value = this.selectedObj.toLocaleString('default', { month: 'long' });
    value3.fill = grayBackground;
    value3.border = blackBorder;
    value3.font = blackFont;
    value3.alignment = centerAlignment;
    worksheet.mergeCells('A13', 'B13');
    worksheet.getRow(13).height = 23;
    let key4 = worksheet.getCell('A13');
    key4.value = 'Selected Year';
    key4.fill = blueBackground;
    key4.border = blackBorder;
    key4.font = whiteFont;
    key4.alignment = centerAlignment;
    worksheet.mergeCells('C13', 'D13');
    let value4 = worksheet.getCell('C13');
    value4.value = this.selectedObj.getFullYear();
    value4.border = blackBorder;
    value4.font = blackFont;
    value4.alignment = centerAlignment;
    worksheet.mergeCells('A14', 'B14');
    worksheet.getRow(14).height = 23;
    let key5 = worksheet.getCell('A14');
    key5.value = 'Total Days In Reporting Period';
    key5.fill = blueBackground;
    key5.border = blackBorder;
    key5.font = whiteFont;
    key5.alignment = centerAlignment;
    worksheet.mergeCells('C14', 'D14');
    let value5 = worksheet.getCell('C14');
    value5.value = this.reportExtraData.totalDays;
    value5.fill = grayBackground;
    value5.border = blackBorder;
    value5.font = blackFont;
    value5.alignment = centerAlignment;
    worksheet.mergeCells('A15', 'B15');
    worksheet.getRow(15).height = 23;
    let key6 = worksheet.getCell('A15');
    key6.value = 'Utility Owner';
    key6.fill = blueBackground;
    key6.border = blackBorder;
    key6.font = whiteFont;
    key6.alignment = centerAlignment;
    worksheet.mergeCells('C15', 'D15');
    let value6 = worksheet.getCell('C15');
    value6.value = this.reportExtraData.utilityOwner;
    value6.border = blackBorder;
    value6.font = blackFont;
    value6.alignment = centerAlignment;
    worksheet.mergeCells('A16', 'B16');
    worksheet.getRow(16).height = 23;
    let key7 = worksheet.getCell('A16');
    key7.value = 'Number of Stations';
    key7.fill = blueBackground;
    key7.border = blackBorder;
    key7.font = whiteFont;
    key7.alignment = centerAlignment;
    worksheet.mergeCells('C16', 'D16');
    let value7 = worksheet.getCell('C16');
    value7.value = this.reportExtraData.noOfStations;
    value7.fill = grayBackground;
    value7.border = blackBorder;
    value7.font = blackFont;
    value7.alignment = centerAlignment;
    worksheet.mergeCells('A17', 'B17');
    worksheet.getRow(17).height = 23;
    let key8 = worksheet.getCell('A17');
    key8.value = 'Utility Cost / KWH';
    key8.fill = blueBackground;
    key8.border = blackBorder;
    key8.font = whiteFont;
    key8.alignment = centerAlignment;
    worksheet.mergeCells('C17', 'D17');
    let value8 = worksheet.getCell('C17');
    value8.value = '$ ' + this.reportExtraData.utilityCost.toFixed(2);
    value8.border = blackBorder;
    value8.font = blackFont;
    value8.alignment = centerAlignment;
    worksheet.mergeCells('A18', 'B18');
    worksheet.getRow(18).height = 23;
    let key9 = worksheet.getCell('A18');
    key9.value = 'Total Consumption';
    key9.fill = blueBackground;
    key9.border = blackBorder;
    key9.font = whiteFont;
    key9.alignment = centerAlignment;
    worksheet.mergeCells('C18', 'D18');
    let value9 = worksheet.getCell('C18');
    value9.value = this.reportExtraData.totalEngergyConsuption.toFixed(2) + ' KwH';
    value9.fill = grayBackground;
    value9.border = blackBorder;
    value9.font = blackFont;
    value9.alignment = centerAlignment;
    worksheet.mergeCells('A19', 'B19');
    worksheet.getRow(19).height = 23;
    let key10 = worksheet.getCell('A19');
    key10.value = 'Revenue Share';
    key10.fill = blueBackground;
    key10.border = blackBorder;
    key10.font = whiteFont;
    key10.alignment = centerAlignment;
    worksheet.mergeCells('C19', 'D19');
    let value10 = worksheet.getCell('C19');
    value10.value = this.reportExtraData.revenueShare.toFixed(2) + ' %';
    value10.border = blackBorder;
    value10.font = blackFont;
    value10.alignment = centerAlignment;
    worksheet.mergeCells('A20', 'B20');
    worksheet.getRow(20).height = 23;
    let key11 = worksheet.getCell('A20');
    key11.value = 'Processing Fees';
    key11.fill = blueBackground;
    key11.border = blackBorder;
    key11.font = whiteFont;
    key11.alignment = centerAlignment;
    worksheet.mergeCells('C20', 'D20');
    let value11 = worksheet.getCell('C20');
    value11.value = '$ ' + this.reportExtraData.processingFees.toFixed(2);
    value11.fill = grayBackground;
    value11.border = blackBorder;
    value11.font = blackFont;
    value11.alignment = centerAlignment;
    worksheet.mergeCells('A21', 'B21');
    worksheet.getRow(21).height = 23;
    let key12 = worksheet.getCell('A21');
    key12.value = 'Meter Service Fees';
    key12.fill = blueBackground;
    key12.border = blackBorder;
    key12.font = whiteFont;
    key12.alignment = centerAlignment;
    worksheet.mergeCells('C21', 'D21');
    let value12 = worksheet.getCell('C21');
    value12.value = '$ ' + this.reportExtraData.meterServiceFees.toFixed(2);
    value12.border = blackBorder;
    value12.font = blackFont;
    value12.alignment = centerAlignment;
    worksheet.mergeCells('A22', 'B22');
    worksheet.getRow(22).height = 23;
    let key13 = worksheet.getCell('A22');
    key13.value = 'Utility Charges';
    key13.fill = blueBackground;
    key13.border = blackBorder;
    key13.font = whiteFont;
    key13.alignment = centerAlignment;
    worksheet.mergeCells('C22', 'D22');
    let value13 = worksheet.getCell('C22');
    value13.value = '$ ' + this.reportExtraData.utilityCharges.toFixed(2);
    value13.fill = grayBackground;
    value13.border = blackBorder;
    value13.font = blackFont;
    value13.alignment = centerAlignment;
    worksheet.mergeCells('A23', 'B23');
    worksheet.getRow(23).height = 23;
    let key14 = worksheet.getCell('A23');
    key14.value = 'Cloud Service Fees';
    key14.fill = blueBackground;
    key14.border = blackBorder;
    key14.font = whiteFont;
    key14.alignment = centerAlignment;
    worksheet.mergeCells('C23', 'D23');
    let value14 = worksheet.getCell('C23');
    value14.value = '$ ' + this.reportExtraData.cloudServiceFees.toFixed(2);
    value14.border = blackBorder;
    value14.font = blackFont;
    value14.alignment = centerAlignment;
    worksheet.mergeCells('A24', 'B24');
    worksheet.getRow(24).height = 23;
    let key15 = worksheet.getCell('A24');
    key15.value = 'Networking Fees';
    key15.fill = blueBackground;
    key15.border = blackBorder;
    key15.font = whiteFont;
    key15.alignment = centerAlignment;
    worksheet.mergeCells('C24', 'D24');
    let value15 = worksheet.getCell('C24');
    value15.value = '$ ' + this.reportExtraData.networkingCharges.toFixed(2);
    value15.fill = grayBackground;
    value15.border = blackBorder;
    value15.font = blackFont;
    value15.alignment = centerAlignment;
    worksheet.mergeCells('A25', 'B25');
    worksheet.getRow(25).height = 23;
    let key16 = worksheet.getCell('A25');
    key16.value = 'Maintenance Charges';
    key16.fill = blueBackground;
    key16.border = blackBorder;
    key16.font = whiteFont;
    key16.alignment = centerAlignment;
    worksheet.mergeCells('C25', 'D25');
    let value16 = worksheet.getCell('C25');
    value16.value = '$ ' + this.reportExtraData.maintenanceCharges.toFixed(2);
    value16.border = blackBorder;
    value16.font = blackFont;
    value16.alignment = centerAlignment;
    worksheet.mergeCells('A26', 'B26');
    worksheet.getRow(26).height = 23;
    let key17 = worksheet.getCell('A26');
    key17.value = 'Sales Tax';
    key17.fill = blueBackground;
    key17.border = blackBorder;
    key17.font = whiteFont;
    key17.alignment = centerAlignment;
    worksheet.mergeCells('C26', 'D26');
    let value17 = worksheet.getCell('C26');
    value17.value = '$ ' + this.reportExtraData.salesTax.toFixed(2);
    value17.fill = grayBackground;
    value17.border = blackBorder;
    value17.font = blackFont;
    value17.alignment = centerAlignment;
    worksheet.mergeCells('A27', 'B27');
    worksheet.getRow(27).height = 23;
    let key18 = worksheet.getCell('A27');
    key18.value = 'Total Revenue Generated';
    key18.fill = blueBackground;
    key18.border = blackBorder;
    key18.font = whiteFont;
    key18.alignment = centerAlignment;
    worksheet.mergeCells('C27', 'D27');
    let value18 = worksheet.getCell('C27');
    value18.value = '$ ' + this.reportExtraData.totalRevenueGenerated.toFixed(2);
    value18.border = blackBorder;
    value18.font = blackFont;
    value18.alignment = centerAlignment;
    worksheet.mergeCells('A28', 'B28');
    worksheet.getRow(28).height = 23;
    let key19 = worksheet.getCell('A28');
    key19.value = 'Net Revenue';
    key19.fill = blueBackground;
    key19.border = blackBorder;
    key19.font = whiteFont;
    key19.alignment = centerAlignment;
    worksheet.mergeCells('C28', 'D28');
    let value19 = worksheet.getCell('C28');
    value19.value = '$ ' + this.reportExtraData.netRevenue.toFixed(2);
    value19.fill = grayBackground;
    value19.border = blackBorder;
    value19.font = blackFont;
    value19.alignment = centerAlignment;
    worksheet.mergeCells('A29', 'B29');
    worksheet.getRow(29).height = 23;
    let key20 = worksheet.getCell('A29');
    key20.value = 'Revenue Reimbursement';
    key20.fill = blueBackground;
    key20.border = blackBorder;
    key20.font = whiteFont;
    key20.alignment = centerAlignment;
    worksheet.mergeCells('C29', 'D29');
    let value20 = worksheet.getCell('C29');
    value20.value = '$ ' + this.reportExtraData.revenueReimbursement.toFixed(2);
    value20.border = blackBorder;
    value20.font = blackFont;
    value20.alignment = centerAlignment;
    worksheet.mergeCells('A30', 'B30');
    worksheet.getRow(30).height = 23;
    let key21 = worksheet.getCell('A30');
    key21.value = 'Utility Reimbursement';
    key21.fill = blueBackground;
    key21.border = blackBorder;
    key21.font = whiteFont;
    key21.alignment = centerAlignment;
    worksheet.mergeCells('C30', 'D30');
    let value21 = worksheet.getCell('C30');
    value21.value = '$ ' + this.reportExtraData.utilityReimbursement.toFixed(2);
    value21.fill = grayBackground;
    value21.border = blackBorder;
    value21.font = blackFont;
    value21.alignment = centerAlignment;
    worksheet.mergeCells('A31', 'B31');
    worksheet.getRow(31).height = 23;
    let key22 = worksheet.getCell('A31');
    key22.value = 'Total Reimbursement';
    key22.fill = blueBackground;
    key22.border = blackBorder;
    key22.font = whiteFont;
    key22.alignment = centerAlignment;
    worksheet.mergeCells('C31', 'D31');
    let value22 = worksheet.getCell('C31');
    value22.value = '$ ' + this.reportExtraData.totalReimbursement.toFixed(2);
    value22.border = blackBorder;
    value22.font = blackFont;
    value22.alignment = centerAlignment;

    // Add headers
    // const headers = Object.keys(data[0]);
    // worksheet.addRow(headers);

    // // Add data
    // data.forEach((item) => {
    //   const row:any = [];
    //   headers.forEach((header) => {
    //     row.push(item[header]);
    //   });
    //   worksheet.addRow(row);
    // });

    // worksheet.getColumn(1).width = 15;
    // worksheet.getColumn(2).width = 20;

    // Generate Excel file
    workbook.xlsx.writeBuffer().then((buffer: any) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${this.selectedObj.toLocaleString('default', { month: 'long' })}-${this.selectedObj.getFullYear()}.xlsx`);
    });
  }

  ConvertToCSV(objArray: any, headerList: any) {
    objArray.push({});
    objArray.push({});
    objArray.push({transactionLogId: 'Customer Id : ', stationId: this.reportExtraData.customerId});
    // objArray.push({transactionLogId: 'Organization : ', stationId: this.financialRevenueForm.get('tenants')?.value.name});
    objArray.push({transactionLogId: 'Site : ', stationId: this.financialRevenueForm.get('sites')?.value.name});
    objArray.push({transactionLogId: 'Selected Month : ', stationId: this.selectedObj.toLocaleString('default', {month: 'long'})});
    objArray.push({transactionLogId: 'Selected Year : ', stationId: this.selectedObj.getFullYear()});
    // objArray.push({transactionLogId: 'Start Date : ', stationId: Helper.getFormattedDate(this.financialRevenueForm.get('startDate')?.value)});
    // objArray.push({transactionLogId: 'End Date : ', stationId: Helper.getFormattedDate(this.financialRevenueForm.get('endDate')?.value)});
    objArray.push({transactionLogId: 'Total Days In Reporting Period : ', stationId: this.reportExtraData.totalDays});
    objArray.push({transactionLogId: 'Utility Owner : ', stationId: this.reportExtraData.utilityOwner});
    objArray.push({transactionLogId: 'Number of Stations : ', stationId: this.reportExtraData.noOfStations});
    objArray.push({transactionLogId: 'Utility Cost / KWH : ', stationId: '$ ' + this.reportExtraData.utilityCost.toFixed(2)});
    objArray.push({transactionLogId: 'Total Consuption : ', stationId: this.reportExtraData.totalEngergyConsuption.toFixed(2) + ' KwH'});
    objArray.push({transactionLogId: 'Revenue Share : ', stationId: this.reportExtraData.revenueShare.toFixed(2) + ' %'});
    objArray.push({transactionLogId: 'Processing Fees : ', stationId: '$ ' + this.reportExtraData.processingFees.toFixed(2)});
    objArray.push({transactionLogId: 'Meter Service Fees : ', stationId: '$ ' + this.reportExtraData.meterServiceFees.toFixed(2)});
    objArray.push({transactionLogId: 'Utility Charges : ', stationId: '$ ' + this.reportExtraData.utilityCharges.toFixed(2)});
    objArray.push({transactionLogId: 'Cloud Service Fees : ', stationId: '$ ' + this.reportExtraData.cloudServiceFees.toFixed(2)});
    objArray.push({transactionLogId: 'Networking Fees : ', stationId: '$ ' + this.reportExtraData.networkingCharges.toFixed(2)});
    objArray.push({transactionLogId: 'Maintenance Charges : ', stationId: '$ ' + this.reportExtraData.maintenanceCharges.toFixed(2)});
    objArray.push({transactionLogId: 'Sales Tax : ', stationId: '$ ' + this.reportExtraData.salesTax.toFixed(2)});
    objArray.push({transactionLogId: 'Total Revenue Generated : ', stationId: '$ ' + this.reportExtraData.totalRevenueGenerated.toFixed(2)});
    objArray.push({transactionLogId: 'Net Revenue : ', stationId: '$ ' + this.reportExtraData.netRevenue.toFixed(2)});
    objArray.push({transactionLogId: 'Revenue Reimbursement : ', stationId: '$ ' + this.reportExtraData.revenueReimbursement.toFixed(2)});
    objArray.push({transactionLogId: 'Utility Reimbursement : ', stationId: '$ ' + this.reportExtraData.utilityReimbursement.toFixed(2)});
    objArray.push({transactionLogId: 'Total Reimbursement : ', stationId: '$ ' + this.reportExtraData.totalReimbursement.toFixed(2)});
    // objArray.push({transactionLogId: 'Utility Fees Owned By Site Owner : ', stationId: this.reportExtraData.utilityFeesOwnedBySiteOwner ? 'Yes' : 'No'});
    // objArray.push({transactionLogId: 'Utility Fees : ', stationId: '$ ' + this.reportExtraData.utilityFees.toFixed(2)});
    // objArray.push({transactionLogId: 'Total Cost Of Energy : ', stationId: '$ ' + this.reportExtraData.totalCostOfEnergy.toFixed(2)});
    // objArray.push({transactionLogId: 'Networking Charges : ', stationId: '$ ' + this.reportExtraData.networkingCharges.toFixed(2)});
    // objArray.push({transactionLogId: 'Revenue Incurred : ', stationId: '$ ' + this.reportExtraData.revenueIncurred.toFixed(2)});
    // objArray.push({transactionLogId: 'Revenue Reimbursement Owed : ', stationId: '$ ' + this.reportExtraData.revenueReimbursementOwed.toFixed(2)});
    // objArray.push({transactionLogId: 'Utility Reimbursement Owed : ', stationId: '$ ' + this.reportExtraData.utilityReimbursementOwed.toFixed(2)});
    // objArray.push({transactionLogId: 'Reimbursement Owed : ', stationId: '$ ' + this.reportExtraData.reimbursementOwed.toFixed(2)});
    // objArray.push({transactionLogId: 'Total Reimbursement : ', stationId: '$ ' + this.reportExtraData.totalReimbursement.toFixed(2)});
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let row = '';
    let newHeaders = [
      'ChargePoint',
      'Station',
      'Start Time',
      'Stop Time',
      'Status',
      'Consumption (KwH)',
      'Charging Rate ($)',
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
      orientation: 'portrait',
      format: 'a4',
      compress: true,
    });
    var pageWidth = parseInt(doc.internal.pageSize.width.toFixed(0));
    // var pageHeight = parseInt(doc.internal.pageSize.height.toFixed(0));
    // this.dataSource.data.forEach((element: any, index: any) => {
    //   data.push([
    //     index + 1,
    //     element.transactionLogId ? element.transactionLogId : '-',
    //     element.stationId ? element.stationId : '-',
    //     element.startTime ? element.startTime : '-',
    //     element.stopTime ? element.stopTime : '-',
    //     element.status ? element.status : '-',
    //     element.kwh ? parseFloat(element.kwh).toFixed(2) : 0.0,
    //     element.chargingRate ? element.chargingRate : '-',
    //     element.amount ? element.amount : '-',
    //   ]);
    // });
    // autoTable(doc, {
    //   showHead: 'everyPage',
    //   pageBreak: 'auto',
    //   margin: { top: 35 },
    //   headStyles: {
    //     cellPadding: 2,
    //     fontSize: 11,
    //     fontStyle: 'bold',
    //     halign: 'center',
    //   },
    //   styles: {
    //     cellPadding: 2,
    //     fontSize: 10,
    //     valign: 'middle',
    //     overflow: 'linebreak'
    //   },
    //   head: [
    //     [
    //       'Sr. No.',
    //       'ChargePoint',
    //       'Station',
    //       'Start Time',
    //       'Stop Time',
    //       'Status',
    //       'Consumption (KwH)',
    //       'Charging Rate ($)',
    //       'Amount ($)',
    //     ],
    //   ],
    //   body: data,
    //   didDrawPage: function (data) {
    //     img.src = 'assets/EV-Chargers-Logo.png';
    //     doc.addImage(img, 'png', 13, 10, 50, 20);
    //     doc.setFontSize(24);
    //     doc.setTextColor(0, 150, 0);
    //     doc.text('Financial Revenue Report', 135, 23);
    //   },
    // });
    // doc.addPage();
    // let finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(17);
    doc.setFillColor(24, 82, 161);
    doc.rect(14, 50, 180, 9, 'F');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('MONTH', (pageWidth / 4), 56);
    doc.text('|', (pageWidth / 2), 54);
    doc.text('|', (pageWidth / 2), 58);
    doc.setFontSize(14);
    doc.text('TOTAL REIMBURSEMENT', (pageWidth / 2)+13, 56);

    doc.setFontSize(17);
    doc.setFillColor(24, 82, 161);
    doc.rect(14, 59, 180, 8, 'S');
    doc.setFontSize(14);
    doc.setTextColor(24, 82, 161);
    doc.text(this.selectedObj.toLocaleString('default', { month: 'long' }), (pageWidth / 4), 65);
    doc.setTextColor(0, 0, 0);
    doc.text('|', (pageWidth / 2), 63);
    doc.text('|', (pageWidth / 2), 66);
    doc.setFontSize(14);
    doc.setTextColor(24, 82, 161);
    doc.text('$ ' + this.reportExtraData.totalReimbursement.toFixed(2), (pageWidth / 2)+40, 65);

    doc.setFontSize(17);
    doc.setFillColor(0 ,0, 0);
    doc.rect(14, 75, 180, 10, 'S');
    doc.setFontSize(18);
    doc.setTextColor(24, 82, 161);
    doc.text('Financial Revenue Report', (pageWidth / 2)-39, 82);
    autoTable(doc, {
      showHead: 'everyPage',
      pageBreak: 'auto',
      theme: 'grid',
      margin: { top: 85 },
      bodyStyles: {
        lineColor: [0, 0, 0],
        lineWidth: 0.30
      },
      styles: {
        cellPadding: 2,
        fontSize: 12,
        valign: 'middle',
        overflow: 'linebreak',
        halign: 'center',
      },
      body: [
        {
          title: 'Customer Id',
          value: this.reportExtraData.customerId
        },
        // {
        //   title: 'Organization',
        //   value: this.financialRevenueForm.get('tenants')?.value.name
        // },
        {
          title: 'Site',
          value: this.financialRevenueForm.get('sites')?.value.name
        },
        {
          title: 'Selected Month',
          value: this.selectedObj.toLocaleString('default', {
            month: 'long'
          })
        },
        {
          title: 'Selected Year',
          value: this.selectedObj.getFullYear()
        },
        // {
        //   title: 'Start Date',
        //   value: Helper.getFormattedDate(
        //     this.financialRevenueForm.get('startDate')?.value
        //   )
        // },
        // {
        //   title: 'End Date',
        //   value: Helper.getFormattedDate(
        //     this.financialRevenueForm.get('endDate')?.value
        //   )
        // },
        {
          title: 'Total Days In Reporting Period',
          value: this.reportExtraData.totalDays
        },
        {
          title: 'Utility Owner',
          value: this.reportExtraData.utilityOwner
        },
        {
          title: 'Number of Stations',
          value: this.reportExtraData.noOfStations
        },
        {
          title: 'Utility Cost / KWH',
          value: '$ ' + this.reportExtraData.utilityCost.toFixed(2)
        },
        {
          title: 'Total Consumption',
          value: this.reportExtraData.totalEngergyConsuption.toFixed(2) + ' KwH'
        },
        {
          title: 'Revenue Share',
          value: this.reportExtraData.revenueShare.toFixed(2) + ' %'
        },
        {
          title: 'Processing Fees',
          value: '$ ' + this.reportExtraData.processingFees.toFixed(2)
        },
        {
          title: 'Meter Service Fees',
          value: '$ ' + this.reportExtraData.meterServiceFees.toFixed(2)
        },
        {
          title: 'Utility Charges',
          value: '$ ' + this.reportExtraData.utilityCharges.toFixed(2)
        },
        {
          title: 'Cloud Service Fees',
          value: '$ ' + this.reportExtraData.cloudServiceFees.toFixed(2)
        },
        {
          title: 'Networking Fees',
          value: '$ ' + this.reportExtraData.networkingCharges.toFixed(2)
        },
        {
          title: 'Maintenance Charges',
          value: '$ ' + this.reportExtraData.maintenanceCharges.toFixed(2)
        },
        {
          title: 'Sales Tax',
          value: '$ ' + this.reportExtraData.salesTax.toFixed(2)
        },
        {
          title: 'Total Revenue Generated',
          value: '$ ' + this.reportExtraData.totalRevenueGenerated.toFixed(2)
        },
        {
          title: 'Net Revenue',
          value: '$ ' + this.reportExtraData.netRevenue.toFixed(2)
        },
        {
          title: 'Revenue Reimbursement',
          value: '$ ' + this.reportExtraData.revenueReimbursement.toFixed(2)
        },
        {
          title: 'Utility Reimbursement',
          value: '$ ' + this.reportExtraData.utilityReimbursement.toFixed(2)
        },
        // {
        //   title: 'Utility Fees Owned By Site Owner',
        //   value: this.reportExtraData.utilityFeesOwnedBySiteOwner ? 'Yes' : 'No'
        // },
        // {
        //   title: 'Utility Fees',
        //   value: '$ ' + this.reportExtraData.utilityFees.toFixed(2)
        // },
        // {
        //   title: 'Total Cost Of Energy',
        //   value: '$ ' + this.reportExtraData.totalCostOfEnergy.toFixed(2)
        // },
        // {
        //   title: 'Networking Charges',
        //   value: '$ ' + this.reportExtraData.networkingCharges.toFixed(2)
        // },
        // {
        //   title: 'Revenue Incurred',
        //   value: '$ ' + this.reportExtraData.revenueIncurred.toFixed(2)
        // },
        // {
        //   title: 'Revenue Reimbursement Owed',
        //   value: '$ ' + this.reportExtraData.revenueReimbursementOwed.toFixed(2)
        // },
        // {
        //   title: 'Utility Reimbursement Owed',
        //   value: '$ ' + this.reportExtraData.utilityReimbursementOwed.toFixed(2)
        // },
        // {
        //   title: 'Reimbursement Owed',
        //   value: '$ ' + this.reportExtraData.reimbursementOwed.toFixed(2)
        // },
        {
          title: 'Total Reimbursement',
          value: '$ ' + this.reportExtraData.totalReimbursement.toFixed(2)
        },
      ],
      didDrawPage: function (data) {
        img.src = 'assets/EV-Chargers-Logo.png';
        doc.addImage(img, 'png', (pageWidth / 2)-40, 10, 80, 25);
        doc.setFontSize(24);
        doc.setTextColor(24, 82, 161);
        doc.text('MONTHLY FINANCIAL REPORT', (pageWidth / 2)-65, 43);
      },
      columnStyles: {
        0: {
          cellWidth: 90
        },
        1: {
          cellWidth: 90
        },
      },
      willDrawCell: function (data) {
        if (data.column.index == 0) {
          doc.setFillColor(24, 82, 161);
          doc.setTextColor(255, 255, 255);
        } else if (data.column.index == 1) {
          if (data.row.index % 2 == 0) {
            doc.setFillColor(245, 245, 245);
          }
        }
      },
    });
    doc.save(`${this.selectedObj.toLocaleString('default', { month: 'long' })}-${this.selectedObj.getFullYear()}.pdf`);
  }
}
