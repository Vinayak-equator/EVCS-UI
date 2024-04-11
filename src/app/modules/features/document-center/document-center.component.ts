import { Component } from '@angular/core';
import { AppConstants } from 'src/app/constants';
import { HttpDataService } from '@app/shared/services/http-data.service';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { Site } from '@app/models/site.model';
import { Tenant } from '@app/models/tenant.model';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-document-center',
  templateUrl: './document-center.component.html',
  styleUrls: ['./document-center.component.css'],
})
export class DocumentCenterComponent {

  process = false;
  apiNoData = false;
  documentCenterForm: FormGroup;
  tenants: Tenant[];
  sites: Site[];
  documentArray: any = [];

  constructor(
    private readonly formBuilder: FormBuilder,
    private httpDataService: HttpDataService
  ) { }

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
          this.documentCenterForm.get('tenants')?.setValue(this.tenants[0]);
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
    this.documentCenterForm = this.formBuilder.group({
      tenants: [null, [Validators.required]],
      sites: [null, [Validators.required]],
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
          this.documentCenterForm.get('tenants')?.value.tenantId +
          '/false/1/1000'
      )
      .subscribe((res) => {
        this.sites = res;
        this.documentCenterForm.controls['sites'].reset();
        if (this.sites.length === 1) {
          this.documentCenterForm.get('sites')?.setValue(this.sites[0]);
        }
      });
  }

  resetForm(formDirective: FormGroupDirective) {
    formDirective.resetForm();
    this.documentCenterForm.reset();
  }

  getList() {
    this.process = true;
    this.documentArray = [];
    this.httpDataService
      .get(AppConstants.APIUrlGetUserStatements + this.documentCenterForm.get('tenants')?.value.tenantId 
      + '/' + this.documentCenterForm.get('sites')?.value.siteId)
      .subscribe(
        (res) => {
          if (res.length) {
            this.apiNoData = false;
          } else {
            this.apiNoData = true;
          }
          res.sort((a: any, b: any) => a.month - b.month);
          res.forEach((element: any) => {
            const dt = new Date();
            dt.setMonth(element.month - 1);
            element['monthName'] = dt.toLocaleString('default', { month: 'long' })
          });
          this.documentArray = res;
          this.process = false;
        },
        (error) => {
          console.log(error);
          this.process = false;
        }
      );
  }

  downloadDocument(document: any) {
    var img = new Image();
    var doc = new jsPDF({
      orientation: 'portrait',
      format: 'a4',
      compress: true,
    });
    var pageWidth = parseInt(doc.internal.pageSize.width.toFixed(0));
    // doc.setFontSize(16);
    // doc.setTextColor(0, 0, 0);
    // doc.text('Universal EV Chargers', 10, 50);
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text('www.universalevcharging.com', 10, 45);
    // doc.text('Reference Number:', (pageWidth / 2) - 16, 45);
    // doc.setFontSize(11);
    // doc.text(document.id, pageWidth - (11 + (2 * document.id.length)), 45);
    // doc.setFontSize(12);
    doc.text('305 W Spring Creek Pkwy,', 10, 50);
    doc.text('Suite 100 B, Plano, Texas (US)', 10, 55);
    doc.text('Customer Number:', (pageWidth / 2) + 30, 45);
    // doc.text('Customer Number:', (pageWidth / 2) - 16, 45);
    if (document.customerId) {
      doc.text(document.customerId, pageWidth - (18 + (2 * document.customerId.length)), 45);
      // doc.text(document.customerId, pageWidth - (12 + (2 * document.customerId.length)), 45);
    }
    doc.text('Report Month:', (pageWidth / 2) + 30, 50);
    doc.text(`${document.monthName} - ${document.year}`, pageWidth - (30 + (2 * document.monthName.length)), 50);
    // doc.text(`${document.monthName} - ${document.year}`, pageWidth - (26 + (2 * document.monthName.length)), 50);
    autoTable(doc, {
      showHead: 'everyPage',
      pageBreak: 'auto',
      theme: 'grid',
      margin: { top: 65 },
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
          value: document?.customerId
        },
        {
          title: 'Site',
          value: this.documentCenterForm.get('sites')?.value?.name
        },
        {
          title: 'Selected Month',
          value: document?.monthName
        },
        {
          title: 'Selected Year',
          value: document?.year
        },
        {
          title: 'Total Days In Reporting Period',
          value: document?.totalDays
        },
        {
          title: 'Utility Owner',
          value: document?.utilityOwner
        },
        {
          title: 'Number of Stations',
          value: document?.noOfStations
        },
        {
          title: 'Utility Cost / KWH',
          value: '$ ' + document?.utilityCost.toFixed(2)
        },
        {
          title: 'Total Consumption',
          value: document?.totalEngergyConsuption.toFixed(2) + ' KwH'
        },
        {
          title: 'Revenue Share',
          value: document?.revenueShare.toFixed(2) + ' %'
        },
        {
          title: 'Processing Fees',
          value: '$ ' + document?.processingFees.toFixed(2)
        },
        {
          title: 'Meter Service Fees',
          value: '$ ' + document?.meterServiceFees.toFixed(2)
        },
        {
          title: 'Utility Charges',
          value: '$ ' + document?.utilityCharges.toFixed(2)
        },
        {
          title: 'Cloud Service Fees',
          value: '$ ' + document?.cloudServiceFees.toFixed(2)
        },
        {
          title: 'Networking Fees',
          value: '$ ' + document?.networkingCharges.toFixed(2)
        },
        {
          title: 'Maintenance Charges',
          value: '$ ' + document?.maintenanceCharges.toFixed(2)
        },
        {
          title: 'Sales Tax',
          value: '$ ' + document?.salesTax.toFixed(2)
        },
        {
          title: 'Total Revenue Generated',
          value: '$ ' + document?.totalRevenueGenerated.toFixed(2)
        },
        {
          title: 'Net Revenue',
          value: '$ ' + document?.netRevenue.toFixed(2)
        },
        {
          title: 'Revenue Reimbursement',
          value: '$ ' + document?.revenueReimbursement.toFixed(2)
        },
        {
          title: 'Utility Reimbursement',
          value: '$ ' + document?.utilityReimbursement.toFixed(2)
        },
        {
          title: 'Total Reimbursement',
          value: '$ ' + document?.totalReimbursement.toFixed(2)
        },
      ],
      didDrawPage: function (data) {
        img.src = 'assets/EV-Chargers-Logo.png';
        doc.addImage(img, 'png', 10, 10, 80, 25);
        doc.setFontSize(24);
        doc.setTextColor(24, 82, 161);
        doc.text('MONTHLY FINANCIAL', 106, 20);
        doc.text('REPORT', 132, 29);
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
    doc.save(`${document.monthName}-${document.year}.pdf`);
  }
}
