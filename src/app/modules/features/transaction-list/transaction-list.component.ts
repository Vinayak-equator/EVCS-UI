import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { MatSort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Tenant } from '@app/models/tenant.model';
import { HttpDataService } from '@app/shared/services/http-data.service';
import { AppConstants } from '@app/constants';
import { PopUpService } from '@app/shared/utility/popup.service';
import Helper from '@app/shared/utility/Helper';
import { SiteList } from '@app/models/sitelist.model';
import { ChargePoint } from '@app/models/chargepoint.model';
import { Transaction } from '@app/models/transaction.model';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { TranslateConfigService } from '@app/shared/services/translate-config.service';
import { GridFilterService } from '@app/shared/utility/grid-filter.service';
import { map, startWith } from 'rxjs/operators';
import { RouterExtService } from '@app/shared/services/routerExt.service';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { MatDeleteDialogComponent } from '@app/mat-delete-dialog/mat-delete-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { error } from 'console';

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.css']
})
export class TransactionListComponent implements OnInit {

  transactionForm: UntypedFormGroup;
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
  userRole: string;
  tenantList: any;
  siteList: any;
  @Input() max: any;
  maxDate = new Date();
  allTenantSelected = false;
  allSiteSelected = false;
  allChargePointSelected = false;
  process = false;
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
      name: 'uniqueTransactionId',
      columnProp: 'uniqueTransactionId',
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
  tenantName: any;
  
  filterValues: any = {};

  transactionIdControl = new UntypedFormControl();
  filteredByTransactionId: Observable<string[]>;
  transactionId: any[];
  transactionIdValues: any[];

  transactionLogIdControl = new UntypedFormControl();
  filteredByTransactionLogId: Observable<string[]>;
  uniqueTransactionId: Observable<string[]>;
  transactionLogId: any[];
  transactionLogIdValues: any[];
  uniqTransactionLogIdValues: any[];

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
  dialogRef: MatDialogRef<any>;

  meterStopControl = new UntypedFormControl();
  filteredByMeterStop: Observable<string[]>;
  meterStopValues: any[];
  meterStop: any[];
  selected = 'custom'
  isDatepickerDisabled: boolean = false;

  get hasTenantAdmin(): boolean {
    return this.userRole == 'Tenant_Admin';
  }

  private _filter(value: string, input: string[]): string[] {
    const filterValue = value.toString().toLowerCase();

    return input?.filter(v => v?.toString().toLowerCase().indexOf(filterValue) === 0);
  }

  constructor(private readonly formBuilder: UntypedFormBuilder, private httpDataService: HttpDataService,
    private translate: TranslateService, public translateConfigService: TranslateConfigService,public toast:ToastrService, public filterService: GridFilterService,
    private router: Router, private popUpService: PopUpService, 
    public dialog: MatDialog,
    private routerExtService: RouterExtService) {

    this.transactionList = new Array<Transaction>()
  }

  dataSource = new MatTableDataSource();
  displayedColumns: string[] = ['uniqueTransactionId', 'connectorId', 'startTime', 'stopTime', 'meterStart', 'meterStop', 'chargingRate', 'amount', 'status', 'detail'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  buildTransactionForm() {
    this.transactionForm = this.formBuilder.group({
      tenantName: [null, [Validators.required]],
      siteName: [null, [Validators.required]],
      chargePointName: [null, [Validators.required]],
      date: [null, [Validators.required]],
      enddate: [null, [Validators.required]],
      selectedType: ['EVCPORTAL', Validators.required],
    });
  }

  ngOnInit(): void {  
    const today = new Date();
    today.setDate(today.getDate());
    this.maxDate = today; 
    // this.maxDate.setDate(this.maxDate.getDate());
    this.dataSource.data = [];
    this.buildTransactionForm();
    this.getTenantNames();
    this.translateConfigService.localEvent.subscribe(data => {
      this.translator();
    });
    
    // Retain the previous result.
    this.restoreTransactionList();
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
      this.transactionForm.patchValue({
        date: this.selectedDate ? new Date(this.selectedDate) : '',
        enddate: this.selectedendDate ? new Date(this.selectedendDate) : '',
        tenantName: this.tenantList ? this.tenantList : '',
        siteName: this.siteList ? this.siteList : '',
        chargePointName: chargePointarray ? chargePointarray : ''
      });
      if (this.tenantList) {
        this.tenantSelection();
      }
      if (this.siteList) {
        this.siteSelection();
      }
      if (chargePointarray != '')
      {
        this.charPointSelection();
      }   
   
      if (this.selectedDate && this.selectedendDate && this.tenantList != '' && sitearray != '' && chargePointarray != '') {
        this.transactions();
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

  SortArray(a: Tenant, b: Tenant) {
    if (a.name < b.name) { return -1; }
    if (a.name > b.name) { return 1; }

    return 0;
  }

  getTenantNames() {
    return this.httpDataService.get(AppConstants.APIUrlTenantNameListtUrl).subscribe((res: Tenant[]) => {
      this.tenants = res.sort(this.SortArray);
    });
  }

  getSiteNames(tenantId: any) {
    return this.httpDataService.get(AppConstants.APIUrlSiteListUrl + tenantId + '/' + false).subscribe((res: SiteList[]) => {
      this.sites = res.sort();
      if (this.sites.length == 0) {
        this.popUpService.showMsg('No sites for selected Organization', AppConstants.EmptyUrl, AppConstants.Warning, AppConstants.Warning);
      }
      
    },
    (error)=>{
      this.popUpData = this.serverErrorMsgResponse(error.error);
      this.popUpService.showMsg(this.popUpData, AppConstants.EmptyUrl, AppConstants.Error, AppConstants.Error);
    });
  }

  GetInProgressTransactionDetail(tenant:any){
    this.process = true
    this.httpDataService
    .post(AppConstants.APIUrlGetInProgressTransactionDetail, {
      uniqueTransactionId:tenant.uniqueTransactionId,
      type: "GET",
    })
    .subscribe((res) => {     
      var a = [res.data.chargePointId, res.data.chargingRate, res.data.chargingUnit, res.data.startMeterReading, res.data.stopMeterValue,
               Helper.getFormattedDateTime(res.data.startMeterReadingTime),Helper.getFormattedDateTime(res.data.stopMeterTime),
              res.data.unitsConsumed, res.data.subTotal, res.data.discountAmount, res.data.amount]

      this.dialogRef = this.dialog.open(MatDeleteDialogComponent, {
        width: '450px',
        panelClass: 'confirm-dialog-container',
       
        data: {
          title: a,       
        },
      });
      this.process = false
      this.dialogRef.afterClosed().subscribe((result) => {
        this.process = result
        if (result) {
          this.process = true
          this.httpDataService
            .post(AppConstants.APIUrlGetInProgressTransactionDetail, {
              uniqueTransactionId:tenant.uniqueTransactionId,
              type: "UPDATE",
            })
            .subscribe((res) => {
              this.process = false
              this.transactions() 
              this.popUpService.showMsg(
                `Transaction ${res.data.status}!`,
                AppConstants.EmptyUrl,
                (res.data.status == 'Completed' ? AppConstants.Success : AppConstants.Warning),
                (res.data.status == 'Completed' ? AppConstants.Success : AppConstants.Warning)
              );
              console.log(res)
            },(error) =>{
              this.process = false
              this.popUpService.showMsg(error.error.message, AppConstants.EmptyUrl, AppConstants.Warning, AppConstants.Warning);               
            });
        }
      });     
    },  (error) => {
      console.log(error)
      this.process = false
      this.popUpService.showMsg(error.error.message,AppConstants.FillMandatoryFields, AppConstants.EmptyUrl, AppConstants.Warning, AppConstants.Warning);
    });  
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
      },  
      (error) => {
        console.log(error)
        this.process = false
            }
      );
    }
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

  toggleAllTenantSelection() {
    this.allTenantSelected = !this.allTenantSelected;
    let tenantArray: any[] = [];
    if (this.allTenantSelected) {
      tenantArray.push('select-all');
      for (let index = 0; index < this.tenants.length; index++) {
        tenantArray.push(this.tenants[index].tenantId);
        if (this.tenants.length - 1 === index) {
          this.transactionForm.controls['tenantName'].setValue(tenantArray);
          this.tenantId = tenantArray;
          this.routerExtService.setRouteValue(AppConstants.TenantID, this.tenantList.toString());
          this.getsitesbytenants(tenantArray);
        }
      }
    } else {
      this.sites = [];
      this.transactionForm.controls['tenantName'].setValue([]);
      this.transactionForm.controls['siteName'].reset();
    }
  }

  tenantSelection() {
    let tenantArray: string[] = this.transactionForm.get('tenantName')?.value;
    const index = tenantArray.indexOf('select-all');
    if (index > -1) {
      tenantArray.splice(index, 1);
      this.allTenantSelected = !this.allTenantSelected;
    }
    this.sites = [];
    this.tenantList = tenantArray;
    this.tenantId = tenantArray;
    this.transactionForm.controls['tenantName'].setValue(tenantArray);
    if (tenantArray[0] !== '') {
      this.getsitesbytenants(tenantArray);
    }
    this.routerExtService.setRouteValue(AppConstants.TenantID, this.tenantList.toString());
    this.transactionForm.get('data')?.invalid;
  }

  toggleAllSiteSelection() {    
    this.allSiteSelected = !this.allSiteSelected;
    let tenantArray: string[] = this.transactionForm.get('tenantName')?.value;
    let siteArray: any[] = [];
    if (this.allSiteSelected) {
      siteArray.push('select-all');
      for (let index = 0; index < this.sites.length; index++) {
        siteArray.push(this.sites[index].siteId);
        if (this.sites.length - 1 === index) {
          this.transactionForm.controls['siteName'].setValue(siteArray);
          this.siteId = siteArray;
          this.siteList = siteArray;
          this.routerExtService.setRouteValue(AppConstants.SiteID, this.siteList.toString());
          this.getchargepointbysites(siteArray, tenantArray);
        }
      }
    } else {
      this.transactionForm.controls['siteName'].setValue([]);
    }
  }

  siteSelection() {    
    let siteArray: string[] = this.transactionForm.get('siteName')?.value;
    let tenantArray: string[] = this.transactionForm.get('tenantName')?.value;
    const index = siteArray.indexOf('select-all');
    if (index > -1) {
      siteArray.splice(index, 1);
      this.allSiteSelected = !this.allSiteSelected;
    }
    this.transactionForm.controls['siteName'].setValue(siteArray);
    this.siteList = siteArray;
    this.siteId = siteArray;
    if (siteArray[0] !== '') {
      this.getchargepointbysites(siteArray, tenantArray);
    }
    this.routerExtService.setRouteValue(AppConstants.SiteID, this.siteList.toString());
    this.transactionForm.get('data')?.invalid;
  }
  
  toggleAllCharPointSelection() {   
    this.allChargePointSelected = !this.allChargePointSelected;
    let chargePointArray: any[] = [];
    if (this.allChargePointSelected) {
      chargePointArray.push('select-all');
      for (let index = 0; index < this.chargePoints.length; index++) {
        chargePointArray.push(this.chargePoints[index].chargePointId);
        if (this.chargePoints.length - 1 === index) {
          this.transactionForm.controls['chargePointName'].setValue(chargePointArray);
          this.chargePointId = chargePointArray;
          this.routerExtService.setRouteValue(AppConstants.ChargePointID, this.chargePointId.toString());
        }
      }
    } else {
      this.transactionForm.controls['chargePointName'].setValue([]);
    }
  }

  charPointSelection() {    
    let chargePointArray: string[] = this.transactionForm.get('chargePointName')?.value;
    const index = chargePointArray.indexOf('select-all');
    if (index > -1) {
      chargePointArray.splice(index, 1);
      this.allChargePointSelected = !this.allChargePointSelected;
    }
    this.transactionForm.controls['chargePointName'].setValue(chargePointArray);
    this.chargePointId = chargePointArray;
    this.routerExtService.setRouteValue(AppConstants.ChargePointID, this.chargePointId.toString());
  }

  transactions() {   
    this.process = true;
    this.transactionList=[];
    
    if (this.transactionForm.valid) {
      let date = this.transactionForm.get('date')?.value
        ? Helper.getFormattedDate(this.transactionForm.get('date')?.value)
        : null;
        this.routerExtService.setRouteValue('TransactionDate',date);

        let enddate = this.transactionForm.get('enddate')?.value
        ? Helper.getFormattedDate(this.transactionForm.get('enddate')?.value)
        : null;

        const tindex = this.tenantId.indexOf('select-all');
        if (tindex > -1) {
          this.tenantId.splice(tindex, 1);
        }
        const sindex = this.siteId.indexOf('select-all');
        if (sindex > -1) {
          this.siteId.splice(sindex, 1);
        }
        const cindex = this.chargePointId.indexOf('select-all');
        if (cindex > -1) {
          this.chargePointId.splice(cindex, 1);
        }
       
        this.routerExtService.setRouteValue('TransactionEndDate',enddate);
        var sitename= this.routerExtService.getRouteValue(AppConstants.SiteID);
        var sitesplit= sitename ? sitename.split(',') : this.siteId;
        var chargePointname= this.routerExtService.getRouteValue(AppConstants.ChargePointID);
        var chargePointsplit= chargePointname ? chargePointname.split(',') : this.chargePointId;

        var tenants = this.tenantId.length ? ( "'" + this.tenantId.join("','") + "'" ) : '';
        var sites = sitesplit.length ? ( "'" + sitesplit.join("','") + "'" ) : '';
        var chargePoints = chargePointsplit.length ? ( "'" + chargePointsplit.join("','") + "'" ) : '';
        const selectedTypeValue = this.transactionForm.get('selectedType').value;

      return this.httpDataService.post(AppConstants.APIUrlTransactionByDate, {
        tenants: tenants,
        sites: sites,
        chargePoints: chargePoints,
        transactionStartDate: date,
        transactionEndDate: enddate,
        transactionType: selectedTypeValue
      }).subscribe((result: any) => {
        let transactionData = new Transaction();
        result?.data?.forEach((dataObj: any) => {
          // dataObj.forEach((transactionObj: any) => {
            transactionData = dataObj;
            transactionData.startTransactionMin = new Date(dataObj.startTime).toLocaleString('en-US', {timeZone: 'CST'});
            transactionData.stopTransactionMin = new Date(dataObj.stopTime).toLocaleString('en-US', {timeZone: 'CST'});
            transactionData.id = dataObj.id;
            document.getElementById("showDiv").style.display = "block"
            this.transactionList.push(transactionData);
          // });
        });
        if (result?.data.length == 0) {
          this.dataSource.data = [];
          this.popUpService.showMsg(AppConstants.NoTransactionList, AppConstants.EmptyUrl, AppConstants.Warning, AppConstants.Warning);
        }
        else {
          this.dataSource.data = this.transactionList;

          this.getTransactionLogIdAutoComplete();
          this.getStatusAutoComplete();
          // this.getStartTimeAutoComplete();
          // this.getStopTimeAutoComplete();
          // this.getMeterStartAutoComplete();
          // this.getMeterStopAutoComplete();

          // Overrride default filter behaviour of Material Datatable
          this.dataSource.filterPredicate = this.filterService.createFilter();
        }
        this.process = false;
      },
        (error) => {
          this.process = false;
          this.popUpService.showMsg(AppConstants.NoTransactionList, AppConstants.EmptyUrl, AppConstants.Error, AppConstants.Error);
        });
    }
    else {
      this.process = false;
      this.popUpService.showMsg(AppConstants.FillMandatoryFields, AppConstants.EmptyUrl, AppConstants.Warning, AppConstants.Warning);
  }}

  transationById(transaction: any) {
    localStorage.setItem('transactionDetails', JSON.stringify(transaction));
    // const transactionId: any = `${this.tenantId}/${this.siteId.join(",")}/${transaction.id}/${transaction.transactionId}`;
    this.routerExtService.setRouteValue(AppConstants.TransactionLogID, transaction.id.toString());
    this.routerExtService.setRouteValue(AppConstants.TransactionID, transaction.transactionId.toString());
    this.router.navigate([AppConstants.TransactionDetailPage]);
    // return this.httpDataService.get(AppConstants.APIUrlTransactionById + transactionId).subscribe((transaction: Transaction) => {
    //   this.transactionData = transaction;
    // });
  }

  getTransactionIdAutoComplete() {
    this.transactionIdValues = this.filterService.getFilterObject(this.dataSource.data, 'transactionId');
    this.filteredByTransactionId = this.transactionIdControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value, this.transactionIdValues))
    );
  }

  getTransactionLogIdAutoComplete() {
    this.transactionLogIdValues = this.filterService.getFilterObject(this.dataSource.data, 'id');
    this.uniqTransactionLogIdValues = this.filterService.getFilterObject(this.dataSource.data, 'uniqueTransactionId');
    this.filteredByTransactionLogId = this.transactionLogIdControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value, this.transactionLogIdValues))
    );
    this.uniqueTransactionId = this.transactionLogIdControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value, this.uniqTransactionLogIdValues))
    );
    
  }

  getStatusAutoComplete() {
    this.statusValues = this.filterService.getFilterObject(this.dataSource.data, 'status');
    this.filteredByStatus = this.statusControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value, this.statusValues))
    );
  }

  getStartTimeAutoComplete() {
    this.startTimeValues = this.filterService.getFilterObject(this.dataSource.data, 'startTime');
    this.filteredByStartTime = this.startTimeControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value, this.startTimeValues))
    );
  }

  getStopTimeAutoComplete() {
    this.stopTimeValues = this.filterService.getFilterObject(this.dataSource.data, 'stopTime');
    this.filteredByStopTime = this.stopTimeControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value, this.stopTimeValues))
    );
  }

  getMeterStartAutoComplete() {
    this.meterStartValues = this.filterService.getFilterObject(this.dataSource.data, 'meterStart');
    this.filteredByMeterStart = this.meterStartControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value, this.meterStartValues))
    );
  }

  getMeterStopAutoComplete() {
    this.meterStopValues = this.filterService.getFilterObject(this.dataSource.data, 'meterStop');
    this.filteredByMeterStop = this.meterStopControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value, this.meterStopValues))
    );
  }

  // Called on Filter change
  filterChange(filter: any, event: any) {
    if (event.option != undefined) {
      this.filterValues[filter?.columnProp] = event.option.value.toString().trim().toLowerCase();
    }
    else {
      if (!Helper.isNullOrEmpty(this.transactionLogIdControl.value))
        this.filterValues[filter?.columnProp] = this.transactionLogIdControl.value.toString().trim().toLowerCase();
      else if (!Helper.isNullOrEmpty(this.statusControl.value))
        this.filterValues[filter?.columnProp] = this.statusControl.value.toString().trim().toLowerCase();
      else if (!Helper.isNullOrEmpty(this.startTimeControl.value))
        this.filterValues[filter?.columnProp] = this.startTimeControl.value.toString().trim().toLowerCase();
      else if (!Helper.isNullOrEmpty(this.stopTimeControl.value))
        this.filterValues[filter?.columnProp] = this.stopTimeControl.value.toString().trim().toLowerCase();
      else if (!Helper.isNullOrEmpty(this.meterStartControl.value))
        this.filterValues[filter?.columnProp] = this.meterStartControl.value.toString().trim().toLowerCase();
      else if (!Helper.isNullOrEmpty(this.meterStopControl.value))
        this.filterValues[filter?.columnProp] = this.meterStopControl.value.toString().trim().toLowerCase();
    }
    this.dataSource.filter = JSON.stringify(this.filterValues);
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Reset table filters
  resetFilters() {
    this.transactionLogIdControl.setValue('');
    this.statusControl.setValue('');
    this.startTimeControl.setValue('');
    this.stopTimeControl.setValue('');
    this.meterStartControl.setValue('');
    this.meterStopControl.setValue('');
    this.filterValues = {}
    this.filterSelectObj.forEach((value: any, key: any) => {
      value.modelValue = undefined;
    })
    this.dataSource.filter = "";
  }

  translator() {
    this.translate.get('singleBinding.itemPage').subscribe(data => {
      this.paginator._intl.itemsPerPageLabel = data;
      this.paginator.ngOnInit();
    });
  }

  serverErrorMsgResponse(error: any): string {
    if (!Helper.isNullOrEmpty(error.Message))
      return this.popUpData = error.Message;
    else if (!Helper.isNullOrEmpty(error.message))
      return this.popUpData = error.message;
    else if (!Helper.isNullOrEmpty(error.title))
      return this.popUpData = error.title;
    else
      return this.popUpData = error;
  }

  downloadReport() {
    let csvData = this.ConvertToCSV(this.dataSource.data, ['id',
    'connectorId',
    'startTransactionMin',
    'stopTransactionMin',
    'meterStart',
    'meterStop',
    'chargingRate',
    'amount',
    'status']);
    let blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
    let dwldLink = document.createElement("a");
    let url = URL.createObjectURL(blob);
    let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
    if (isSafariBrowser) {
        dwldLink.setAttribute("target", "_blank");
    }
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", "Transaction-List.csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  ConvertToCSV(objArray: any, headerList: any) {
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let row = 'Sr. No.,';
    let newHeaders = ['Transaction Log Id', 'Connector Id', 'Start Time', 'Stop Time', 'Meter Start', 'Meter Stop', 'Charging Rate', 'Amount', 'Status'];
    for (let index in newHeaders) {
      row += newHeaders[index] + ',';
    }
    row = row.slice(0, -1);
    str += row + '\r\n';
    for (let i = 0; i < array.length; i++) {
      let line = (i + 1) + '';
      for (let index in headerList) {
        let head = headerList[index];
        line += ',' + this.strRep(array[i][head]);
      }
      str += line + '\r\n';
    }
    return str;
  }

  strRep(data: any) {
    console.log(typeof data);
    if(typeof data == 'string') {
      let newData = data.replace(/,/g, " ");
       return newData;
    }
    else if(typeof data == 'object') {
      return "-";
    }
    else if(typeof data == 'number') {
      return  data.toString();
    }
    else {
      return data;
    }
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
        this.transactionForm.get('date').setValue(currentDate);  
        this.isDatepickerDisabled = false;     
        break;
    }
  
    if (startDate) {
      this.transactionForm.get('date').setValue(startDate);
      this.transactionForm.get('enddate').setValue(currentDate);
    }
  } 
  
  selectType(event: any) {
    this.transactionForm.get('selectedType').setValue(event.value);
  }
}