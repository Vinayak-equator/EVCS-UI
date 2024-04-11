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
import { HttpDataService } from '@app/shared/services/http-data.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { DataService } from '../../../shared/services/data.service';
import { Router } from '@angular/router';
import { RoleType } from '@app/shared/services/roles.enum';
import { Tenant } from '@app/models/tenant.model';
import { Site } from '@app/models/site.model';
import { ChargePoint } from '@app/models/chargepoint.model';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css'],
})
export class UserDetailsComponent implements OnInit {

  userExistErr = false;
  showTenantSelection = false;
  showSiteSelection = false;
  showChargePointSelection = false;
  showMakeDefaultTenant = false;
  isDefaultTenant = false;
  tenants: Tenant[];
  sites: Site[];
  chargePoints: ChargePoint[];
  tenantList: any;
  siteList: any;
  userForm: UntypedFormGroup;
  displayedColumns: string[] = ['name', 'email', 'role', 'status', 'action'];
  subscription: Subscription;
  userDetails: any;
  errors: string[];
  roles: any = [];
  selectedRole = '';
  tenantId = '';
  userId = '';
  id = '';
  userTenantId = '';
  roleType = RoleType;
  userRole = '';
  markupThresholdValue = '';
  iniTenant: any = [];
  iniSite: any = [];
  iniChargePoint: any = [];
  removeTenants: any = [];
  removeSites: any = [];
  removeChargePoints: any = [];
  rolePermissions: any = [];

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
    }
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.buildUserForm();
    this.getRoles();
    const user = JSON.parse(localStorage.getItem('user') || '');
    this.tenantId = user?.tenantId;
    this.subscription = this.dataService.currentMessage.subscribe(
      (message: any) => {
        if (message && message.action) {
          this.userDetails = message;
        } else {
          this.userDetails = JSON.parse(
            localStorage.getItem('userdetails') || ''
          );
        }
      }
    );
  }

  ngAfterViewInit(): void {
    if (this.userDetails.id) {
      this.edit(this.userDetails);
    }
  }

  getRoles() {
    this.httpDataService.get(AppConstants.APIUrlGetAllRoles).subscribe(
      (res: any) => {
        // if (this.userRole === this.roleType.MasterAdmin && !this.userDetails?.id) {
        //   this.roles = res.filter(
        //     (x: any) => x.id === 'Distributor' || x.id === 'Master_Operator'
        //   );
        // } else 
        if (this.userRole === this.roleType.TenantAdmin) {
          this.roles = res.filter(
            (x: any) => x.id === 'Site_Admin' || x.id === 'Site_Operator'
          );
        } else if (this.userRole === this.roleType.Distributor) {
          this.roles = res.filter(
            (x: any) => x.id === 'Tenant_Admin' || x.id === 'Technician'
          );
        } else {
          this.roles = res;
        }
        if (!this.userDetails.rolePermissions) {
          this.rolePermissions = res.filter((r: any) => r.id === this.userDetails.role)[0]?.rolePermissions;
          if (this.rolePermissions && this.rolePermissions.length) {
            this.rolePermissions.forEach((element: any) => {
              element.all = element.previlleges.filter((x: any) => x.value === false).length;
            });
          }
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  buildUserForm() {
    this.userForm = this.formBuilder.group({
      name: [null, [Validators.required]],
      email: [
        null,
        [
          Validators.required,
          Validators.pattern(
            '^[^@]+@[a-zA-Z0-9._-]+\\.+[a-z._-]+$'
          ),
        ],
      ],
      role: [null, [Validators.required]],
      status: [true, []],
      tenants: [[], []],
      sites: [[], []],
      chargePoints: [[], []],
      markupThreshold: [[], []],
    });
    this.errors = [];
  }

  get name(): boolean {
    return !Helper.isNullOrWhitespace(this.userForm.get('name')?.value);
  }

  get email(): boolean {
    return !Helper.isNullOrWhitespace(this.userForm.get('email')?.value);
  }

  get role(): boolean {
    return !Helper.isNullOrWhitespace(this.userForm.get('role')?.value);
  }

  validateuser() {
    if (!this.userForm.get('email')?.errors?.pattern) {
      this.httpDataService
        .post(
          AppConstants.APIUrlCheckUserExist,
          this.userForm.get('email')?.value?.trim()
        )
        .subscribe(
          (res: any) => {
            if (res.message === 'Succ_Found_User') {
              this.userExistErr = true;
              this.userForm.controls.email.setErrors({ valid: false });
            } else if (res.message === 'User_Not_Found') {
              this.userExistErr = false;
            }
          },
          (err) => {
            this.userExistErr = false;
          }
        );
    }
  }

  roleSelection(role: any) {
    this.showMakeDefaultTenant = false;
    this.showTenantSelection = false;
    this.showSiteSelection = false;
    this.isDefaultTenant = false;
    this.selectedRole = role;
    this.rolePermissions = this.roles.filter((r: any) => r.id === role)[0]?.rolePermissions;
    if (this.rolePermissions && this.rolePermissions.length) {
      this.rolePermissions.forEach((element: any) => {
        element.all = element.previlleges.filter((x: any) => x.value === false).length;
        if (element.feature === 'Site Management') {
          this.markupThresholdValue = element.previlleges.filter((x: any) => x.key === 'Markup Threshold')[0]?.markupThreshold
          this.userForm.controls['markupThreshold'].patchValue(this.markupThresholdValue);
        }
      });
    }
    if (
      (this.userRole === this.roleType.MasterAdmin || this.userRole === this.roleType.Distributor) &&
      (role === 'Technician' || role === 'Tenant_Admin')
    ) {
      this.showTenantSelection = true;
      this.getTenantNames();
      if (role === 'Tenant_Admin') {
        this.isDefaultTenant = true;
        this.showMakeDefaultTenant = true;
      }
    } else if (
      (this.userRole === this.roleType.MasterAdmin || this.userRole === this.roleType.TenantAdmin) &&
      (role === 'Site_Admin' || role === 'Site_Operator' || role === 'Site_Owner')
    ) {
      this.showTenantSelection = true;
      this.showSiteSelection = true;
      this.getTenantNames();
      this.tenantSelection(this.userDetails.tenantIdList);
    }
    // this.showChargePointSelection = true;
  }

  checkpermission(permission: any, privilege: any) {
    this.rolePermissions.forEach((element: any, index: any) => {
        if (element.feature === permission) {
          element.previlleges.forEach((item: any, innerindex: any) => {
              if (item.key === privilege) {
                if (this.rolePermissions[index].previlleges[innerindex].value) {
                  this.rolePermissions[index].previlleges[innerindex].value = false;
                  if (item.key === 'Update Site Markup') {
                    this.userForm.controls['markupThreshold'].patchValue(0);
                  }
                } else {
                  this.rolePermissions[index].previlleges[innerindex].value = true;
                }
              }
          });
        }
    });
    this.rolePermissions.forEach((element: any) => {
      element.all = element.previlleges.filter((x: any) => x.value === false).length;
    });
  }

  checkallpermission(permission: any) {
    this.rolePermissions.forEach((element: any, index: any) => {
      if (element.feature === permission) {
        if (element.all === 0) {
          this.rolePermissions[index].all = -1;
          this.rolePermissions[index].previlleges.forEach((item: any) => {
            item.value = false;
          });
        } else {
          this.rolePermissions[index].all = 0;
          this.rolePermissions[index].previlleges.forEach((item: any) => {
            item.value = true;
          });
        }
      }
    });
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
    this.removeTenants = this.iniTenant.filter(
      (t: any) => !tenantList.includes(t)
    );
    if (this.tenantList && this.tenantList.length && this.showSiteSelection) {
      this.httpDataService
        // .get(AppConstants.APIUrlTenantToSiteList + String(tenantList))
        .post(AppConstants.APIUrlTenantToSiteList, {
          'tenantId':this.tenantList.toString()
        })
        .subscribe((res) => {
          this.sites = res;
          // this.userForm.controls['sites'].reset();
          this.userForm.controls['chargePoints'].reset();
        });
    }
  }

  siteSelection(siteList: any) {
    this.chargePoints = [];
    this.siteList = siteList;
    this.removeSites = this.iniSite.filter((s: any) => !siteList.includes(s));
    if (this.siteList.length && this.showChargePointSelection) {
      this.httpDataService
        // .get(
        //   AppConstants.APIUrlSiteToChargePointList +
        //     String(siteList) +
        //     '/' +
        //     String(this.tenantList)
        // )
        .post(AppConstants.APIUrlSiteToChargePointList ,{
          'tenantId': siteList.toString(),
          'siteId':this.tenantList.toString()
        })
        
        .subscribe((res) => {
          this.chargePoints = res;
          this.userForm.controls['chargePoints'].reset();
        });
    }
  }

  chargePointSelection(chargePointList: any) {
    this.removeChargePoints = this.iniChargePoint.filter(
      (c: any) => !chargePointList.includes(c)
    );
  }

  edit(element: any) {
    this.userId = element.userId;
    this.id = element.id;
    this.userTenantId = element.tenantId;
    this.roleSelection(element.role);
    this.iniTenant = element.tenantIdList ? element.tenantIdList : [];
    this.iniSite = element.siteId ? element.siteId : [];
    this.iniChargePoint = element.chargePointId ? element.chargePointId : [];
    this.isDefaultTenant = element?.isDefaultTenant;
    this.rolePermissions = element?.rolePermissions ? element?.rolePermissions : [];
    this.userForm.setValue({
      name: element.name,
      email: element.email,
      role: element.role,
      status: element.status === 'Active' ? true : false,
      tenants: element.tenantIdList ? element.tenantIdList : [],
      sites: element.siteId ? element.siteId : [],
      chargePoints: element.chargePointId ? element.chargePointId : [],
      markupThreshold: this.markupThresholdValue,
    });
    this.userExistErr = false;
    if (this.rolePermissions && this.rolePermissions.length) {
      this.rolePermissions.forEach((element: any) => {
        element.all = element.previlleges.filter((x: any) => x.value === false).length;
        if (element.feature === 'Site Management') {
          this.markupThresholdValue = element.previlleges.filter((x: any) => x.key === 'Markup Threshold')[0]?.markupThreshold
          this.userForm.controls['markupThreshold'].patchValue(this.markupThresholdValue);
        }
      });
    }
    this.cdref.detectChanges();
  }

  saveupdate() {
    this.rolePermissions.forEach((element: any) => {
      element.all = element.previlleges.filter((x: any) => x.value === false).length;
      if (element.feature === 'Site Management') {
        element.previlleges.forEach((prev: any) => {
          if (prev.key === 'Markup Threshold') {
            prev.markupThreshold = this.userForm.get('markupThreshold')?.value
          }
        });
      }
    });
    const data = {
      name: this.userForm.get('name')?.value?.trim(),
      email: this.userForm.get('email')?.value?.trim(),
      role: this.userForm.get('role')?.value,
      status: this.userForm.get('status')?.value ? 'Active' : 'Inactive',
      tenantIdList: this.userForm.get('tenants')?.value
        ? this.userForm.get('tenants')?.value
        : [],
      siteId: this.userForm.get('sites')?.value
        ? this.userForm.get('sites')?.value
        : [],
      chargePointId: this.userForm.get('chargePoints')?.value
        ? this.userForm.get('chargePoints')?.value
        : [],
      removeTenantIdList: this.removeTenants,
      removeSiteId: this.removeSites,
      removeChargePointId: this.removeChargePoints,
      isDefaultTenant: this.isDefaultTenant,
      rolePermissions: this.rolePermissions
    };
    if (!this.userExistErr) {
      if (this.userDetails.action === 'edit') {
        this.httpDataService
          .put(AppConstants.APIUrlUpdateUser + this.userTenantId, {
            ...data,
            userId: this.userId,
            id: this.id,
            tenantId: this.userTenantId,
          })
          .subscribe((res) => {
            this.popUpService.showMsg(
              'User Updated.',
              AppConstants.EmptyUrl,
              AppConstants.Success,
              AppConstants.Success
            );
            this.userForm.reset();
            this.router.navigate(['/users']);
          });
      } else if (this.userDetails.action === 'new' && 
        this.userForm.dirty &&
        this.userForm.valid &&
        this.userForm.touched) {
          this.httpDataService
            .post(AppConstants.APIUrlCreateUser + this.tenantId, data)
            .subscribe((res) => {
              this.popUpService.showMsg(
                'User Created.',
                AppConstants.EmptyUrl,
                AppConstants.Success,
                AppConstants.Success
              );
              this.userForm.reset();
              this.router.navigate(['/users']);
            });
      }
    } else {
      this.popUpService.showMsg(
        'Invalid User Data',
        AppConstants.EmptyUrl,
        AppConstants.Error,
        AppConstants.Error
      );
    }
  }

  cancel(userGeneration: FormGroupDirective) {
    userGeneration.resetForm();
    this.userForm.reset();
    this.router.navigate(['/users']);
  }

  changeDefaultTenant() {
    this.isDefaultTenant = !this.isDefaultTenant;
    if (this.isDefaultTenant) {
      this.userForm.controls['tenants'].reset();
    }
  }
}
