import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConstants } from '@app/constants';
import { Transaction } from '@app/models/transaction.model';
import { HttpDataService } from '@app/shared/services/http-data.service';
import { RouterExtService } from '@app/shared/services/routerExt.service';
import Helper from '@app/shared/utility/Helper';
import { PopUpService } from '@app/shared/utility/popup.service';
import { Guid } from 'guid-typescript';

@Component({
  selector: 'app-transaction-edit',
  templateUrl: './transaction-edit.component.html',
  styleUrls: ['./transaction-edit.component.css']
})
export class TransactionEditComponent implements OnInit {

  transactionForm: UntypedFormGroup;
  transaction:Transaction;
  tenantId: any;
  siteId: any;
  transactionLogId:string;
  transactionId:string;
  transactionById:string;
  
  constructor(private readonly formBuilder: UntypedFormBuilder, private readonly httpDataService: HttpDataService,
    private router: Router, private activatedRoute: ActivatedRoute, private popUpService: PopUpService,
    private routerExtService: RouterExtService) {
    this.transaction = new Transaction();
  }

  buildTransactionForm() {
    this.transactionForm = this.formBuilder.group({
      tenant: [null],
      site: [null],
      chargePoint: [null],
      connector: [null],
      startTime: [null],
      stopTime: [null],
      startResult: [null],
      stopReason: [null],
      meterStart: [null],
      meterEnd: [null],
      customerName: [null],
      customerEmail: [null],
      autherization: [null],
      subtotal: [null],
      discountamount: [null],
      amount: [null],
      promocode: [null],
      cellphonenumber: [null],
      chargingRate: [null],
      markupcharge: [null]
    });
  }


  ngOnInit(): void {
    this.buildTransactionForm();
    // this.activatedRoute.params.subscribe(params => {
    //   this.tenantId = params['tenantId'];
    //   this.siteId = params['siteId'];
    //   this.transactionLogId = params['transactionLogId'];
    //   this.transactionId = params['transactionId'];
    // });

      
  this.tenantId = this.routerExtService.getRouteValue(AppConstants.TenantID);
  this.siteId = this.routerExtService.getRouteValue(AppConstants.SiteID);
  this.transactionId = this.routerExtService.getRouteValue(AppConstants.TransactionID);
  this.transactionLogId = this.routerExtService.getRouteValue(AppConstants.TransactionLogID);
  const sites = this.siteId.split(',');
  const sindex = sites.indexOf('select-all');
  if (sindex > -1) {
    sites.splice(sindex, 1);
  }
    //this.transactionById = `${this.tenantId}/${this.siteId}/${this.transactionLogId}/${this.transactionId}`;
    const tenant= this.tenantId.split(',');
    const site= this.siteId.split(',');
    // this.transactionById = `${this.tenantId}/${sites.join(",")}/${this.transactionLogId}/${this.transactionId}`;
    this.transactionById = `${this.transactionLogId}/${this.transactionId}`;
    this.routerExtService.setRouteValue(AppConstants.TenantID, this.tenantId.toString());
    this.routerExtService.setRouteValue(AppConstants.SiteID, this.siteId.toString());
    this.getTransactionById();
  }

  setTransaction(transactionData:Transaction){
    this.transactionForm.setValue({
      tenant: !Helper.isNullOrEmpty(transactionData.tenantName) ? transactionData.tenantName : '',
      site: !Helper.isNullOrEmpty(transactionData.siteName) ? transactionData.siteName : '',
      chargePoint: !Helper.isNullOrEmpty(transactionData.chargePointId) ? transactionData.chargePointId : '',
      connector: !Helper.isNullOrEmpty(transactionData.connectorId) ? transactionData.connectorId : '',
      startTime: !Helper.isNullOrEmpty(transactionData.startTransactionMin) ? Helper.ConvertToLocalTime(transactionData.startTransactionMin) : '',
      stopTime: !Helper.isNullOrEmpty(transactionData.stopTransactionMin) ? Helper.ConvertToLocalTime(transactionData.stopTransactionMin) : '',
      startResult: !Helper.isNullOrEmpty(transactionData.startResult) ? transactionData.startResult : '',
      stopReason: !Helper.isNullOrEmpty(transactionData.stopReason) ? transactionData.stopReason : '',
      meterStart: !Helper.isNullOrEmpty(transactionData.meterStart) ? transactionData.meterStart : '',
      meterEnd: !Helper.isNullOrEmpty(transactionData.meterStop) ? transactionData.meterStop : '',
      customerName: !Helper.isNullOrEmpty(transactionData.customerName) ? transactionData.customerName : '',
      customerEmail: !Helper.isNullOrEmpty(transactionData.email) ? transactionData.email : '',
      autherization: !Helper.isNullOrEmpty(transactionData.autherization) ? transactionData.autherization : '',
      amount: !Helper.isNullOrEmpty(transactionData.amount) ? parseFloat(transactionData.amount).toFixed(2) : '',
      promocode: !Helper.isNullOrEmpty(transactionData.promocode) ? transactionData.promocode : '',
      subtotal: !Helper.isNullOrEmpty(transactionData.subtotal) ? parseFloat(transactionData.subtotal).toFixed(2) : '',
      discountamount: !Helper.isNullOrEmpty(transactionData.discountamount) ? parseFloat(transactionData.discountamount).toFixed(2) : '',
      cellphonenumber: !Helper.isNullOrEmpty(transactionData.cellphonenumber) ? transactionData.cellphonenumber : '',
      chargingRate: !Helper.isNullOrEmpty(transactionData.chargingRate) ? `$ ${transactionData.chargingRate} / ${transactionData.chargingUnit}` : '',
      markupcharge: !Helper.isNullOrEmpty(transactionData.markupcharge) ? `$ ${transactionData.markupcharge}` : '',
    });
  }

  getTransactionById(){
    return this.httpDataService.get(AppConstants.APIUrlTransactionById + this.transactionById).subscribe((resultTransaction) => {
      this.transaction = resultTransaction?.data;
      this.transaction.startTransactionMin = resultTransaction?.data?.startTime;
      this.transaction.stopTransactionMin = resultTransaction?.data?.stopTime;
      this.setTransaction(this.transaction);
    },
    (error) =>{
      this.popUpService.showMsg(AppConstants.TransactionDetail, AppConstants.EmptyUrl, AppConstants.Error, AppConstants.Error);
    });
  }

  back(){
    this.router.navigate([AppConstants.TransactionListPage]);
  }
}
