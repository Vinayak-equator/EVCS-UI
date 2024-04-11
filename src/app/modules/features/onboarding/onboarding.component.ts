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
import { Observable } from 'rxjs';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css']
})
export class OnboardingComponent implements OnInit {
  onboardingForm: FormGroup;
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

  buildOnboardingForm() {
    this.onboardingForm = this.formBuilder.group({
      tenantName: [null, [Validators.required]],
      siteName: [null, [Validators.required]],
      chargePointName: [null, [Validators.required]],
      messageType: [null, [Validators.required]],
      connectorId: [null, [Validators.required]]
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
    this.buildOnboardingForm();
    this.getTenantNames();
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

    this.onboardingForm.patchValue({
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

  resetFilters() {
    this.dataSource.data = [];
  }

  getTenantNames() {
    return this.httpDataService.get(AppConstants.APIUrlTenantNameListtUrl).subscribe((res: Tenant[]) => {
      this.tenants = res.sort(this.SortArray);
    });
  }

  getsitesbytenants(tenantList: any) {
    this.process = true
    this.sites = [];
    this.tenantList = tenantList;
    if (this.tenantList.length) {
      this.httpDataService
        .post(AppConstants.APIUrlTenantToSiteList, {
          'tenantId': tenantList.toString(),
        })
        .subscribe((res) => {
          this.process = false
          this.sites = res;
        },
          (error) => {
            console.log(error)
            this.process = false
          }
        );
    }
  }

  getchargepointbysites(siteList: any, tenantList: any) {
    this.process = true
    this.chargePoints = [];
    this.siteList = siteList;
    if (this.siteList.length) {
      this.httpDataService
        .post(AppConstants.APIUrlSiteToChargePointList, {
          'tenantId': tenantList.toString(),
          'siteId': siteList.toString()
        })
        .subscribe((res) => {
          this.process = false
          this.chargePoints = res;
        });
    }
  }

  charPointSelection() {
    let chargePointArray: string[] = this.onboardingForm.get('chargePointName')?.value;
    const index = chargePointArray.indexOf('select-all');
    if (index > -1) {
      chargePointArray.splice(index, 1);
      this.allChargePointSelected = !this.allChargePointSelected;
    }
    this.onboardingForm.controls['chargePointName'].setValue(chargePointArray);
    this.chargePointId = chargePointArray;
    this.routerExtService.setRouteValue(AppConstants.ChargePointID, this.chargePointId.toString());
    this.getNumberOfConnectors(this.chargePointId.toString());
  }

  siteSelection() {
    let siteArray: string[] = this.onboardingForm.get('siteName')?.value;
    let tenantArray: string[] = this.onboardingForm.get('tenantName')?.value;
    const index = siteArray.indexOf('select-all');
    if (index > -1) {
      siteArray.splice(index, 1);
      this.allSiteSelected = !this.allSiteSelected;
    }
    this.onboardingForm.controls['siteName'].setValue(siteArray);
    this.siteList = siteArray;
    this.siteId = siteArray;
    if (siteArray[0] !== '') {
      this.getchargepointbysites(siteArray, tenantArray);
    }
    this.routerExtService.setRouteValue(AppConstants.SiteID, this.siteList.toString());
    this.onboardingForm.get('data')?.invalid;
  }

  tenantSelection() {
    let tenantArray: string[] = this.onboardingForm.get('tenantName')?.value;
    const index = tenantArray.indexOf('select-all');
    if (index > -1) {
      tenantArray.splice(index, 1);
      this.allTenantSelected = !this.allTenantSelected;
    }
    this.sites = [];
    this.tenantList = tenantArray;
    this.tenantId = tenantArray;
    this.onboardingForm.controls['tenantName'].setValue(tenantArray);
    if (tenantArray[0] !== '') {
      this.getsitesbytenants(tenantArray);
    }
    this.routerExtService.setRouteValue(AppConstants.TenantID, this.tenantList.toString());
    this.onboardingForm.get('data')?.invalid;
  }

  Trigger() {
    this.process = true
    const onboardingData = {
      chargePointId: this.chargePointId,
      tenantId: this.tenantId,
      siteId: this.siteId,
      connectorId: this.onboardingForm.get('connectorId')?.value,
      message: this.onboardingForm.get('messageType')?.value,
    };
    if (this.onboardingForm.dirty && this.onboardingForm.valid && this.onboardingForm.touched) 
    {
      this.putTrigger(this.tenantId.toString()+'/'+this.siteId.toString()+'/'+this.chargePointId.toString(), onboardingData).subscribe(
        (result: any) => {
          this.process = false
          if (!Helper.isNullOrEmpty(result?.body)) {
            this.popUpService.showMsg(
              result?.body,
              AppConstants.EmptyUrl,
              AppConstants.Success,
              AppConstants.Success
            );
          } else
          this.process = false
            this.popUpService.showMsg(
              AppConstants.Trigger,
              AppConstants.EmptyUrl,
              AppConstants.Success,
              AppConstants.Success
            );
        },
        (error) => {
          this.process = false
          this.connectorServerResponse(error);
        }
      );
    } 
    else
    {
      this.process = false
      this.popUpService.showMsg(
        AppConstants.FillMandatoryFields,
        AppConstants.EmptyUrl,
        AppConstants.Warning,
        AppConstants.Warning
      );
    } 
  }

  putTrigger(ids: any, onboardingData: any): Observable<any> {
    return this.httpDataService.put(
      AppConstants.APIUrlOnboarding + ids,
      onboardingData
    );
  }

  connectorServerResponse(serverError: any) {
    if (!Helper.isNullOrWhitespace(serverError)) {
      if (!Helper.isNullOrWhitespace(serverError?.error?.errors)) {
        const validationErrors = serverError.error.errors;
        this.popUpData = '';
        Object.keys(validationErrors).forEach((prop: any, index: any) => {
          this.popUpData += validationErrors[prop].join(',');
        });
        this.popUpService.showMsg(
          this.popUpData,
          AppConstants.EmptyUrl,
          AppConstants.Error,
          AppConstants.Error
        );
      } else {
        if (serverError.error != null) {
          this.popUpData = this.serverErrorMsgResponse(serverError?.error);
          this.popUpService.showMsg(
            this.popUpData,
            AppConstants.EmptyUrl,
            AppConstants.Error,
            AppConstants.Error
          );
        } else {
          this.popUpData = serverError.statusText;
          this.popUpService.showMsg(
            this.popUpData,
            AppConstants.EmptyUrl,
            AppConstants.Error,
            AppConstants.Error
          );
        }
      }
    } else {
      this.popUpData = this.serverErrorMsgResponse(serverError?.error);
      this.popUpService.showMsg(
        this.popUpData,
        AppConstants.EmptyUrl,
        AppConstants.Error,
        AppConstants.Error
      );
    }
  }

  getNumberOfConnectors(id: any) {
    this.process = true
    this.httpDataService
      .getById(AppConstants.APIUrlGetNumberOfConnectors, id)
      .subscribe(
        (res) => {
          this.process = false
          this.filteredConnectors = this.connectors.filter(connector => connector.value <= (res));
        },
        (error) => {
          this.process = false
          if (!Helper.isNullOrWhitespace(error)) {
            if (!Helper.isNullOrWhitespace(error?.error?.errors)) {
              const validationErrors = error.error.errors;
            } else {
              this.popUpData = this.serverErrorMsgResponse(error.error);

              this.popUpService.showMsg(
                this.popUpData,
                AppConstants.EmptyUrl,
                AppConstants.Error,
                AppConstants.Error
              );
            }
          }
        }
      );
  }
}