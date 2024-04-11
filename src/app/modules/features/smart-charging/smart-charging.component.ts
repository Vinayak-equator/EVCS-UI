import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Tenant } from '@app/models/tenant.model';
import { HttpDataService } from '@app/shared/services/http-data.service';
import { RouterExtService } from '@app/shared/services/routerExt.service';
import { AppConstants } from '@app/constants';
import { PopUpService } from '@app/shared/utility/popup.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Helper from 'src/app/shared/utility/Helper';
import { GridFilterService } from '@app/shared/utility/grid-filter.service';
import { SiteList } from '@app/models/sitelist.model';
import { ChargePoint } from '@app/models/chargepoint.model';

@Component({
  selector: 'app-smart-charging',
  templateUrl: './smart-charging.component.html',
  styleUrls: ['./smart-charging.component.css']
})
export class SmartChargingComponent implements OnInit {
  smartChargingForm: FormGroup;
  popUpData: string;
  tenantName: string;
  siteName: string;
  chargePointId: any[];
  process = false;
  tenantList: any;
  siteList: any;
  tenantId: any;
  siteId: any;
  dataSource = new MatTableDataSource();
  displayedSmartColumns: string[] = [
    'chargePointId',
    'connector',
    'kwh',
    'startTime',
    'stopTime',
  ];
  pageNumber: number = 0;
  pageSize: number = 5;
  totalCount: number = 0;
  allTenantSelected = false;
  allSiteSelected = false;
  allChargePointSelected = false;
  tenants: Tenant[];
  sites: SiteList[];
  chargePoints: ChargePoint[];
  userRole: string;
  selectedDate: any;
  selectedendDate: any;
  maxDate = new Date();
  connectors = [
    { value: 1, text: '1' },
    { value: 2, text: '2' },
  ];
  filteredConnectors: { value: number; text: string; }[];

  get hasTenantAdmin(): boolean {
    return this.userRole == 'Tenant_Admin';
  }

  filterChargePointId = '';
  filterChargerType = '';
  filterStatus = '';

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private readonly formBuilder: FormBuilder,
    private httpDataService: HttpDataService,
    private popUpService: PopUpService,
    public filterService: GridFilterService,
    private cdref: ChangeDetectorRef,
    private routerExtService: RouterExtService,
    public dialog: MatDialog
  ) { }

  buildSmartChargingForm() {
    this.smartChargingForm = this.formBuilder.group({
      tenantName: [null, [Validators.required]],
      siteName: [null, [Validators.required]],
      chargePointName: [null, [Validators.required]],
      chargerConnectorId: [null, [Validators.required]],
      startTime: [null, [Validators.required]],
      stopTime: [null, [Validators.required]],
      KWH: ['', [Validators.min(0), Validators.max(11)]],
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
    this.buildSmartChargingForm();
    this.getTenantNames();
    this.maxDate.setDate(this.maxDate.getDate());
    var tenantnames = this.routerExtService.getRouteValue(AppConstants.TenantID);
    this.tenantList = tenantnames.split(',');
    var sitename = this.routerExtService.getRouteValue(AppConstants.SiteID);
    var sitearray = sitename.split(',');
    this.siteId = sitearray;
    this.siteList = sitename.split(',');

    var chargePointname = this.routerExtService.getRouteValue(AppConstants.ChargePointID);
    var chargePointarray = chargePointname.split(',');
    this.chargePointId = chargePointarray;

    const sindex = sitearray.indexOf('select-all');
    if (sindex > -1) {
      sitearray.splice(sindex, 1);
    }
    const cindex = chargePointarray.indexOf('select-all');
    if (cindex > -1) {
      chargePointarray.splice(cindex, 1);
    }

    this.smartChargingForm.patchValue({
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
    if (chargePointarray != '') {
      this.charPointSelection();
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

  serverErrorMsgResponse(error: any): string {
    if (!Helper.isNullOrEmpty(error.Message))
      return (this.popUpData = error.Message);
    else if (!Helper.isNullOrEmpty(error.message))
      return (this.popUpData = error.message);
    else if (!Helper.isNullOrEmpty(error.title))
      return (this.popUpData = error.title);
    else return (this.popUpData = error);
  }

  // Reset table filters
  resetFilters() {
    this.dataSource.data = [];
  }

  getTenantNames() {
    return this.httpDataService.get(AppConstants.APIUrlTenantNameListtUrl).subscribe((res: Tenant[]) => {
      this.tenants = res.sort(this.SortArray);
    });
  }

  toggleAllTenantSelection() {
    this.allTenantSelected = !this.allTenantSelected;
    let tenantArray: any[] = [];
    if (this.allTenantSelected) {
      tenantArray.push('select-all');
      for (let index = 0; index < this.tenants.length; index++) {
        tenantArray.push(this.tenants[index].tenantId);
        if (this.tenants.length - 1 === index) {
          this.smartChargingForm.controls['tenantName'].setValue(tenantArray);
          this.tenantId = tenantArray;
          this.routerExtService.setRouteValue(AppConstants.TenantID, this.tenantList.toString());
          this.getsitesbytenants(tenantArray);
        }
      }
    } else {
      this.sites = [];
      this.smartChargingForm.controls['tenantName'].setValue([]);
      this.smartChargingForm.controls['siteName'].reset();
    }
  }

  getsitesbytenants(tenantList: any) {
    this.sites = [];
    this.tenantList = tenantList;
    if (this.tenantList.length) {
      this.httpDataService
        .post(AppConstants.APIUrlTenantToSiteList, {
          'tenantId': tenantList.toString(),
        })
        .subscribe((res) => {
          this.sites = res;
        },
          (error) => {
            console.log(error)
            this.process = false
          }
        );
    }
  }

  toggleAllSiteSelection() {
    this.allSiteSelected = !this.allSiteSelected;
    let tenantArray: string[] = this.smartChargingForm.get('tenantName')?.value;
    let siteArray: any[] = [];
    if (this.allSiteSelected) {
      siteArray.push('select-all');
      for (let index = 0; index < this.sites.length; index++) {
        siteArray.push(this.sites[index].siteId);
        if (this.sites.length - 1 === index) {
          this.smartChargingForm.controls['siteName'].setValue(siteArray);
          this.siteId = siteArray;
          this.siteList = siteArray;
          this.routerExtService.setRouteValue(AppConstants.SiteID, this.siteList.toString());
          this.getchargepointbysites(siteArray, tenantArray);
        }
      }
    } else {
      this.smartChargingForm.controls['siteName'].setValue([]);
    }
  }

  getchargepointbysites(siteList: any, tenantList: any) {
    this.chargePoints = [];
    this.siteList = siteList;
    if (this.siteList.length) {
      this.httpDataService
        .post(AppConstants.APIUrlSiteToChargePointList, {
          'tenantId': tenantList.toString(),
          'siteId': siteList.toString()
        })
        .subscribe((res) => {
          this.chargePoints = res;
        });
    }
  }

  // toggleAllCharPointSelection() {
  //   this.allChargePointSelected = !this.allChargePointSelected;
  //   let chargePointArray: any[] = [];
  //   if (this.allChargePointSelected) {
  //     chargePointArray.push('select-all');
  //     for (let index = 0; index < this.chargePoints.length; index++) {
  //       chargePointArray.push(this.chargePoints[index].chargePointId);
  //       if (this.chargePoints.length - 1 === index) {
  //         this.smartChargingForm.controls['chargePointName'].setValue(chargePointArray);
  //         this.chargePointId = chargePointArray;
  //         this.routerExtService.setRouteValue(AppConstants.ChargePointID, this.chargePointId.toString());

  //         this.process = true
  //         this.httpDataService.get(AppConstants.APIUrlGetAllSmartCharging + '/' + this.chargePointId).subscribe((res) => {
  //           let data: any = [];
  //           data = res
  //           this.dataSource.data = data
  //           this.process = false;
  //           this.dataSource.paginator = this.paginator;
  //           this.dataSource.sort = this.sort;
  //           this.cdref.detectChanges();
  //         },
  //         (error)=>{
  //           this.process = false;
  //           let data: any = [];
  //           this.dataSource.data = data
  //           this.popUpData = this.serverErrorMsgResponse(error.error);
  //           this.popUpService.showMsg(this.popUpData, AppConstants.EmptyUrl, AppConstants.Error, AppConstants.Error);
  //         });
  //       }
  //     }
  //   } else {
  //     this.smartChargingForm.controls['chargePointName'].setValue([]);
  //   }
  // }

  getSmartCharging() {
    this.process = true
    this.httpDataService.get(AppConstants.APIUrlGetAllSmartCharging + '/' + this.chargePointId).subscribe((res) => {
      let data: any = [];
      data = res.smartChargingList
      this.dataSource.data = data
      this.filteredConnectors = this.connectors.filter(connector => connector.value <= (res.connectorCount - 1));
      this.process = false;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.cdref.detectChanges();
    },
    (error)=>{
      this.process = false;
      this.dataSource.data = []
      this.popUpData = this.serverErrorMsgResponse(error.error);
      this.popUpService.showMsg(this.popUpData, AppConstants.EmptyUrl, AppConstants.Error, AppConstants.Error);
    });
  }

  charPointSelection() {
    let chargePointArray: string[] = this.smartChargingForm.get('chargePointName')?.value;
    const index = chargePointArray.indexOf('select-all');
    if (index > -1) {
      chargePointArray.splice(index, 1);
      this.allChargePointSelected = !this.allChargePointSelected;
    }
    this.smartChargingForm.controls['chargePointName'].setValue(chargePointArray);
    this.chargePointId = chargePointArray;
    this.routerExtService.setRouteValue(AppConstants.ChargePointID, this.chargePointId.toString());
    this.getSmartCharging();
  }

  siteSelection() {
    let siteArray: string[] = this.smartChargingForm.get('siteName')?.value;
    let tenantArray: string[] = this.smartChargingForm.get('tenantName')?.value;
    const index = siteArray.indexOf('select-all');
    if (index > -1) {
      siteArray.splice(index, 1);
      this.allSiteSelected = !this.allSiteSelected;
    }
    this.smartChargingForm.controls['siteName'].setValue(siteArray);
    this.siteList = siteArray;
    this.siteId = siteArray;
    if (siteArray[0] !== '') {
      this.getchargepointbysites(siteArray, tenantArray);
    }
    this.routerExtService.setRouteValue(AppConstants.SiteID, this.siteList.toString());
    this.smartChargingForm.get('data')?.invalid;
  }

  tenantSelection() {
    let tenantArray: string[] = this.smartChargingForm.get('tenantName')?.value;
    const index = tenantArray.indexOf('select-all');
    if (index > -1) {
      tenantArray.splice(index, 1);
      this.allTenantSelected = !this.allTenantSelected;
    }
    this.sites = [];
    this.tenantList = tenantArray;
    this.tenantId = tenantArray;
    this.smartChargingForm.controls['tenantName'].setValue(tenantArray);
    if (tenantArray[0] !== '') {
      this.getsitesbytenants(tenantArray);
    }
    this.routerExtService.setRouteValue(AppConstants.TenantID, this.tenantList.toString());
    this.smartChargingForm.get('data')?.invalid;
  }

  onSubmit() {
    if (this.smartChargingForm.valid) {
      this.process = true;
      this.httpDataService.post(AppConstants.APIUrlSmartCharging, {
        'chargePointId': this.chargePointId,
        'connectorId': this.smartChargingForm.get('chargerConnectorId')?.value,
        'startTime': this.smartChargingForm.get('startTime')?.value,
        'stopTime': this.smartChargingForm.get('stopTime')?.value,
        'KWH': this.smartChargingForm.get('KWH')?.value
      }).subscribe(
        (response) => {
          this.process = false;
          this.popUpService.showMsg(AppConstants.smartCharging, '/smart-charging', AppConstants.Success, AppConstants.Success);
        },
        (error) => {
          this.process = false;
          this.popUpService.showMsg(error, AppConstants.EmptyUrl, AppConstants.Warning, AppConstants.Warning);
          console.error('Error Submitting Smart charging:', error);
        }
      );
    }
    else {
      this.process = false;
      this.popUpService.showMsg(AppConstants.FillMandatoryFields, '/smart-charging', AppConstants.Warning, AppConstants.Warning);
    }
  }
}
