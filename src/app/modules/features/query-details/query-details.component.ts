import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
  FormGroupDirective,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import Helper from '@app/shared/utility/Helper';
import { GridFilterService } from '@app/shared/utility/grid-filter.service';
import { PopUpService } from '@app/shared/utility/popup.service';
import { AppConstants } from 'src/app/constants';
import { Tenant } from '@app/models/tenant.model';
import { Site } from '@app/models/site.model';
import { ChargePoint } from '@app/models/chargepoint.model';
import { HttpDataService } from '@app/shared/services/http-data.service';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from '@app/shared/services/data.service';
import { Router } from '@angular/router';
import { RoleType } from '@app/shared/services/roles.enum';

@Component({
  selector: 'app-query-details',
  templateUrl: './query-details.component.html',
  styleUrls: ['./query-details.component.css'],
})
export class QueryDetailsComponent implements OnInit {

  promoExistErr = false;
  promocodeId = '';
  PromocodeCreatedOn = '';
  queryForm: UntypedFormGroup;
  promocodeObj: any = {};
  tenantList: any;
  siteList: any;
  tenants: Tenant[];
  sites: Site[];
  chargePoints: ChargePoint[];
  today = new Date();
  selectedValue: string = 'Percentage';
  values: string[] = ['Percentage', 'Flat'];
  displayedColumns: string[] = [
    'promoCode',
    'discountPercentage',
    'flatDiscount',
    'validityStartDate',
    'validityEndDate',
    'maxUsage',
    'used',
    'status',
    'action',
  ];
  subscription: Subscription;
  queryDetails: any;
  roleType = RoleType;
  userRole = '';
  isMasterAdmin = false;

  constructor(
    public filterService: GridFilterService,
    private cdref: ChangeDetectorRef,
    private readonly formBuilder: UntypedFormBuilder,
    private popUpService: PopUpService,
    private httpDataService: HttpDataService,
    public dialog: MatDialog,
    public dataService: DataService,
    public router: Router
  ) {
    const sessionRole = localStorage.getItem('role') || '';
    if (sessionRole) {
      this.userRole = Helper.decodeRole(sessionRole);
      if (this.userRole === this.roleType.MasterAdmin) {
        this.isMasterAdmin = true;
      }
    }
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.getTenantNames();
    this.buildPromoCodeForm();
    this.subscription = this.dataService.currentMessage.subscribe(
      (message: any) => {
        if (message && message.action) {
          this.queryDetails = message;
        } else {
          this.queryDetails = JSON.parse(
            localStorage.getItem('querydetails') || ''
          );
        }
      }
    );
    if (this.queryDetails.reply && this.queryDetails.reply.length) {
      this.queryDetails.reply.forEach((element: any) => {
        let createdon = new Date(element.createdon);
        if (createdon.getFullYear()) {
          element.createdon = createdon.toLocaleString('en-US', {timeZone: 'CST'});
        } else {
          element.createdon = '-';
        }
      });
    }
  }

  ngAfterViewInit(): void {
    if (this.queryDetails.id) {
      this.edit(this.queryDetails);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  buildPromoCodeForm() {
    this.queryForm = this.formBuilder.group({
      description: ['', [Validators.required]],
      tenants: [null, []],
      sites: [null, []],
      chargePoints: [null, []],
      reply: [null, []],
    });
  }

  get description(): boolean {
    return !Helper.isNullOrWhitespace(this.queryForm.get('description')?.value);
  }

  get reply(): boolean {
    return !Helper.isNullOrWhitespace(this.queryForm.get('reply')?.value);
  }

  getTenantNames() {
    return this.httpDataService
      .get(AppConstants.APIUrlTenantNameListtUrl)
      .subscribe((res: Tenant[]) => {
        this.tenants = res.sort(this.SortArray);
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

  tenantSelection(tenantList: any) {
    this.sites = [];
    this.chargePoints = [];
    this.tenantList = tenantList;
    if (this.tenantList.length) {
      this.httpDataService
        // .get(AppConstants.APIUrlTenantToSiteList + String(tenantList))
        .post(AppConstants.APIUrlTenantToSiteList, {
          'tenantId':this.tenantList.toString()
        })
        .subscribe((res) => {
          this.sites = res;
          this.queryForm.controls['sites'].reset();
          this.queryForm.controls['chargePoints'].reset();
        });
    }
  }

  siteSelection(siteList: any) {
    this.chargePoints = [];
    this.siteList = siteList;
    if (this.siteList.length) {
      this.httpDataService
        .post(AppConstants.APIUrlSiteToChargePointList ,{
          'tenantId':this.tenantList.toString(),
          'siteId':siteList.toString()
        })
        .subscribe((res) => {
          this.chargePoints = res;
          this.queryForm.controls['chargePoints'].reset();
        });
    }
  }

  chargePointSelection(chargePointList: any) {}

  edit(element: any) {
    if (element.tenantId) {
      this.httpDataService
        // .get(AppConstants.APIUrlTenantToSiteList + element.tenantId)
        .post(AppConstants.APIUrlTenantToSiteList, {
          'tenantId':this.tenantList.toString()
        })
        .subscribe((res) => {
          this.sites = res;
        });
    }
    this.queryDetails.action === 'edit';
    if (element.siteId) {
      this.httpDataService
        // .get(
        //   AppConstants.APIUrlSiteToChargePointList +
        //     element.siteId +
        //     '/' +
        //     element.tenantId
        // )
        .post(AppConstants.APIUrlSiteToChargePointList ,{
          'tenantId': element.siteId.toString(),
          'siteId':element.tenantId.toString()
        })
        .subscribe((res) => {
          this.chargePoints = res;
        });
    }
    this.queryForm.setValue({
      description: element.description,
      tenants: element.tenantId,
      sites: element.siteId,
      chargePoints: element.chargePointId,
      reply: '',
    });
    this.cdref.detectChanges();
  }

  saveupdate() {
    let tenant: any = [];
    let site: any = [];
    let chargePoint: any = [];
    if (this.queryForm.get('tenants')?.value) {
      tenant = this.tenants.filter(
        (t) => t.tenantId === this.queryForm.get('tenants')?.value
      );
    }
    if (this.queryForm.get('sites')?.value) {
      site = this.sites.filter(
        (t) => t.siteId === this.queryForm.get('sites')?.value
      );
    }
    if (this.queryForm.get('chargePoints')?.value) {
      chargePoint = this.chargePoints.filter(
        (t) => t.chargePointId === this.queryForm.get('chargePoints')?.value
      );
    }
    const data = {
      id: this.queryDetails?.id,
      tenantId: tenant[0]?.tenantId,
      tenantName: tenant[0]?.name,
      siteId: site[0]?.siteId,
      siteName: site[0]?.name,
      chargePointId: chargePoint[0]?.chargePointId,
      chargePointName: chargePoint[0]?.name,
      description: this.queryForm.get('description')?.value?.trim(),
    };
    if (
      (this.queryForm.dirty &&
      this.queryForm.valid &&
      this.queryForm.touched) || 
      this.queryForm.get('description')?.value?.trim()
    ) {
      if (this.queryDetails.action === 'edit') {
        this.httpDataService
          .put(AppConstants.APIUrlUpdateTicket, data)
          .subscribe((res) => {
            this.popUpService.showMsg(
              'Query Updated.',
              AppConstants.EmptyUrl,
              AppConstants.Success,
              AppConstants.Success
            );
            this.queryForm.reset();
            this.router.navigate(['/query']);
          });
      } else if (this.queryDetails.action === 'new') {
        this.httpDataService
          .post(AppConstants.APIUrlCreateTicket, data)
          .subscribe((res) => {
            this.popUpService.showMsg(
              'Query Raised.',
              AppConstants.EmptyUrl,
              AppConstants.Success,
              AppConstants.Success
            );
            this.queryForm.reset();
            this.router.navigate(['/query']);
          });
      }
    } else {
      this.popUpService.showMsg(
        'Invalid Query Data',
        AppConstants.EmptyUrl,
        AppConstants.Error,
        AppConstants.Error
      );
    }
  }

  cancel(promocodeGeneration: FormGroupDirective) {
    promocodeGeneration.resetForm();
    this.queryForm.reset();
    this.router.navigate(['/query']);
  }

  sendreply() {
    if (this.queryForm.get('reply')?.value) {
      this.httpDataService
        .post(AppConstants.APIUrlCreateReply + this.queryDetails.id, {
          replyDescription: this.queryForm.get('reply')?.value?.trim(),
        })
        .subscribe((res) => {
          this.popUpService.showMsg(
            'Replied to query.',
            AppConstants.EmptyUrl,
            AppConstants.Success,
            AppConstants.Success
          );
          this.queryForm.reset();
          this.router.navigate(['/query']);
        });
    }
  }
}
