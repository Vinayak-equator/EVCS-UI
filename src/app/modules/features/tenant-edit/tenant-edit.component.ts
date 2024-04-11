import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HttpDataService } from 'src/app/shared/services/http-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Tenant } from 'src/app/models/tenant.model';
import Helper from 'src/app/shared/utility/Helper';
import { Guid } from 'guid-typescript';
import { DialogService } from 'src/app/shared/services/dialog.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Site } from 'src/app/models/site.model';
import { AppConstants, TenantConstants } from 'src/app/constants';
import { TranslateConfigService } from '@app/shared/services/translate-config.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { GridFilterService } from '@app/shared/utility/grid-filter.service';
import { PopUpService } from '@app/shared/utility/popup.service';
import { RouterExtService } from '@app/shared/services/routerExt.service';
import { IndexedDBService } from '@app/shared/utility/indexed-db.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDeleteDialogComponent } from '@app/mat-delete-dialog/mat-delete-dialog.component';
import { MatMerchantDialogComponent } from '@app/mat-merchant-dialog/mat-merchant-dialog.component';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { Location } from '@angular/common';

@Component({
  selector: 'app-tenant-edit',
  templateUrl: './tenant-edit.component.html',
  styleUrls: ['./tenant-edit.component.css'],
})
export class TenantEditComponent implements OnInit,AfterViewInit {
  tenantForm: FormGroup;
  tenantId: Guid;
  tenant: Tenant;
  sites: Site[];
  stringJson: any;
  errors: string[];
  signUpInviteFlag: boolean = false;
  tenantName: any;
  canUpdateTenant = false;
  canCreateSite = false;
  canTransferSite = false;
  canDeleteSite = false;
  parentTenantRequest = false;
  deletedRecords = false;
  process = true;
  chnageicon = 'keyboard_arrow_right';
  Prename = '';
  Precompany = '';
  Prestreet = '';
  Prestate = '';
  Precity = '';
  Precountry = '';
  Preemail = '';
  Prephone = '';
  PrezipCode = '';
  Prestatus = '';
  PremerchantKey = '';
  dialogRef: MatDialogRef<any>;
  pageloader = false
  // countryList : any  = (Country  as  any).default;
  public tenantConstants = TenantConstants;
  data = {};
  dataSource = new MatTableDataSource();
  displayedColumns: string[] = ['customerId', 'siteAddress', 'level2Rate', 'dcFastRate', 'utilityOwner', 'numberChargePorts', 'status'];
  pageNumber: number = 0;
  pageSize: number = 10;
  totalCount: number = 0;

  filteredBySiteName: Observable<string[]>;
  siteNameValues: any[];

  filteredByLocation: Observable<string[]>;
  locationValues: any[];

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
  position: string = 'above';
  oldMerchantObj: any;
  countryList = [
    {
      country: 'Canada',
    },
    {
      country: 'Mexico',
    },
    {
      country: 'United States',
    },
  ];

  get name(): boolean {
    return (
      !Helper.isNullOrWhitespace(this.tenantForm.get('name')?.value) &&
      (this.tenantForm.get('name')?.value.length <= 3 ||
        this.tenantForm.get('name')?.value.length > 150)
    );
  }

  get email(): boolean {
    return (
      !Helper.isNullOrWhitespace(this.tenantForm.get('email')?.value) &&
      this.tenantForm.get('email')?.errors?.email
    );
  }

  get companyName(): boolean {
    return (
      !Helper.isNullOrWhitespace(this.tenantForm.get('company')?.value) &&
      (this.tenantForm.get('company')?.value.length <= 3 ||
        this.tenantForm.get('company')?.value.length > 150)
    );
  }

  get phone(): boolean {
    return (
      !Helper.isNullOrWhitespace(this.tenantForm.get('phone')?.value) &&
      (this.tenantForm.get('phone')?.value.length <= 10 ||
        this.tenantForm.get('phone')?.value.length > 15)
    );
  }

  get country(): boolean {
    return (
      !Helper.isNullOrWhitespace(this.tenantForm.get('country')?.value) &&
      (this.tenantForm.get('country')?.value.length <= 3 ||
        this.tenantForm.get('country')?.value.length > 100)
    );
  }

  get city(): boolean {
    return (
      !Helper.isNullOrWhitespace(this.tenantForm.get('city')?.value) &&
      (this.tenantForm.get('city')?.value.length <= 2 ||
        this.tenantForm.get('city')?.value.length > 100)
    );
  }

  get state(): boolean {
    return (
      !Helper.isNullOrWhitespace(this.tenantForm.get('state')?.value) &&
      (this.tenantForm.get('state')?.value.length <= 2 ||
        this.tenantForm.get('state')?.value.length > 100)
    );
  }

  get street(): boolean {
    return (
      !Helper.isNullOrWhitespace(this.tenantForm.get('street')?.value) &&
      (this.tenantForm.get('street')?.value.length <= 1 ||
        this.tenantForm.get('street')?.value.length > 250)
    );
  }

  get zip(): boolean {
    return (
      !Helper.isNullOrWhitespace(this.tenantForm.get('zipCode')?.value) &&
      (this.tenantForm.get('zipCode')?.value.length <= 5 ||
        this.tenantForm.get('zipCode')?.value.length > 11)
    );
  }

  get address(): boolean {
    return (
      !Helper.isNullOrWhitespace(this.tenantForm.get('street')?.value) &&
      (this.tenantForm.get('street')?.value.length <= 15 ||
        this.tenantForm.get('street')?.value.length > 250)
    );
  }

  //Grid columns
  filterSelectObj = [
    {
      name: 'name',
      columnProp: 'name',
      type: 'text',
      options: [] as string[],
      modelValue: '',
    },
    {
      name: 'location',
      columnProp: 'location',
      type: 'text',
      options: [] as string[],
      modelValue: '',
    },
  ];

  filterValues: any = {};
  siteNameControl = new FormControl();
  locationControl = new FormControl();
  filterName = '';
  filterLocation = '';
  popUpData: string;
  
  filteredSiteList : any = []
  constructor(
    private readonly formBuilder: FormBuilder,
    private httpDataService: HttpDataService,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService,
    public translateConfigService: TranslateConfigService,
    public filterService: GridFilterService,
    private dialogService: DialogService,
    private router: Router,
    private popUpService: PopUpService,
    private routerExtService: RouterExtService,
    private indexedDBService: IndexedDBService,
    private cdref: ChangeDetectorRef,
    private location: Location
  ) {
    this.tenant = new Tenant();
  }

  private _filter(value: string, input: string[]): string[] {
    const filterValue = value.toString().toLowerCase();

    return input?.filter(
      (v) => v?.toString().toLowerCase().indexOf(filterValue) === 0
    );
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  buildTenantForm() {
    this.tenantForm = this.formBuilder.group({
      //name: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150), Validators.pattern(AppConstants.fullNamePattern)]],
      name: [
        null,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(150),
          Validators.pattern(AppConstants.addressPattern),
        ],
      ],
      street: [
        null,
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(250),
          Validators.pattern(AppConstants.addressPattern),
        ],
      ],
      //company: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150), Validators.pattern(AppConstants.fullNamePattern)]],
      company: [
        null,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(150),
          Validators.pattern(AppConstants.addressPattern),
        ],
      ],
      email: [
        null,
        [Validators.email, Validators.required, this.validateEmailId],
      ],
      phone: [
        null,
        [
          Validators.required,
          Validators.pattern(AppConstants.numberPattern),
          Validators.minLength(10),
          Validators.maxLength(15),
        ],
      ],
      state: [
        null,
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          Validators.pattern(AppConstants.addressPattern),
        ],
      ],
      city: [
        null,
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          Validators.pattern(AppConstants.addressPattern),
        ],
      ],
      //state: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(AppConstants.stringPattern)]],
      //city: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(AppConstants.stringPattern)]],
      country: [
        null,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      zipCode: [
        null,
        [
          Validators.required,
          Validators.pattern(AppConstants.numberPattern),
          Validators.minLength(5),
          Validators.maxLength(6),
        ],
      ],
      status: [null],
    });
  }

  validateEmailId(control: AbstractControl): { [key: string]: any } | null {
    if (control.value && Helper.isValidEmail(control.value) == false) {
      return { invalidEmailAddress: true };
    }
    return null;
  }

  onKeyPress(event: any) {
    const regexpNumber = /[0-9\+\-\ ]/;
    let inputCharacter = String.fromCharCode(event.charCode);
    if (event.keyCode != 8 && !regexpNumber.test(inputCharacter)) {
      event.preventDefault();
    }
  }
  back() {
    this.location.back()
    // this.router.navigate(['/tenants']);
  }
  sorting() {
    const sortState: Sort = { active: 'name', direction: 'desc' };
    this.sort.active = sortState.active;
    this.sort.direction = sortState.direction;
    this.sort.sortChange.emit(sortState);
  }

  ngOnInit(): void {
    
    localStorage.removeItem('parentSiteRequest');
    localStorage.removeItem('tenantObj');
    this.indexedDBService
      .getRecordData('PermissionDB', 'permission', 'Tenant Management')
      .then((data: any) => {
        data.previlleges.forEach((pp: any) => {
          if (pp.key === 'Update Tenant') {
            this.canUpdateTenant = pp.value;
          }
        });
      })
      .catch((error) => {
        console.error(error);
      });
    this.indexedDBService
      .getRecordData('PermissionDB', 'permission', 'Site Management')
      .then((data: any) => {
        data.previlleges.forEach((pp: any) => {
          if (pp.key === 'Create Site') {
            this.canCreateSite = pp.value;
          }
          if (pp.key === 'Transfer Site') {
            this.canTransferSite = pp.value;
          }
          if (pp.key === 'Delete Site') {
            this.canDeleteSite = pp.value;
          }
        });
      })
      .catch((error) => {
        console.error(error);
      });
    if (localStorage.getItem('parentTenantRequest')) {
      this.parentTenantRequest =
        localStorage.getItem('parentTenantRequest') === 'true' ? true : false;
    }
    this.tenantName = localStorage.getItem('tenantName');
    this.dataSource.data = [];
    this.translateConfigService.localEvent.subscribe((data) => {
      this.translator();
    });
    this.buildTenantForm();
    // this.sorting();

    this.tenantId = this.routerExtService.getRouteValue(AppConstants.TenantID);
    // this.dataSource.paginator = this.paginator;

    // this.activatedRoute.params.subscribe(params => {
    //   this.tenantId = params['tenantId'];
    // });
    this.getTenantById();
    // Overrride default filter behaviour of Material Datatable
    // debugger;
    //this.dataSource.filterPredicate = this.filterService.createFilter();
    this.siteNameControl.valueChanges.subscribe((value) => {
      this.filterName = value;
      if(value.length > 3)
      {
        this.getSites(this.tenantId);
      }
    });
    this.locationControl.valueChanges.subscribe((value) => {
      this.filterLocation = value;
      if(value.length > 3)
      {
        this.getSites(this.tenantId);
      }
    });
  }

  getTenantById() {
    this.httpDataService
      .getById(AppConstants.APIUrlGetTenantById, this.tenantId)
      .subscribe(
        (result: Tenant) => {
          this.setTenant(result);
          this.getSites(this.tenantId);
          // Overrride default filter behaviour of Material Datatable
          this.dataSource.filterPredicate = this.filterService.createFilter();

          if (result.status == AppConstants.Pending)
            this.signUpInviteFlag = true;
          else this.signUpInviteFlag = false;
        },
        (error) => {
          if (!Helper.isNullOrWhitespace(error)) {
            if (!Helper.isNullOrWhitespace(error.error.errors)) {
              const validationErrors = error.error.errors;
              this.serverError(validationErrors);
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

  // Called on Filter change
  filterChange(filter: any, event: any) {
    if (event.option != undefined) {
      this.filterValues[filter?.columnProp] = event.option.value
        .toString()
        .trim()
        .toLowerCase();
    } else {
      if (!Helper.isNullOrEmpty(this.siteNameControl.value))
        this.filterValues[filter?.columnProp] = this.siteNameControl.value
          .toString()
          .trim()
          .toLowerCase();
      else if (!Helper.isNullOrEmpty(this.locationControl.value))
        this.filterValues[filter?.columnProp] = this.locationControl.value
          .toString()
          .trim()
          .toLowerCase();
     
    }

    this.dataSource.filter = JSON.stringify(this.filterValues);
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Reset table filters
  resetFilters() {
    this.deletedRecords = false;
    this.siteNameControl.setValue('');
    this.locationControl.setValue('');
    this.filterValues = {};
    this.getSites(this.tenantId);
    this.filterSelectObj.forEach((value: any, key: any) => {
      value.modelValue = undefined;
    });
    this.dataSource.filter = '';
  }

  getSiteNameAutoComplete() {
    this.siteNameValues = this.filterService.getFilterObject(
      this.dataSource.data,
      'name'
    );
    this.filteredBySiteName = this.siteNameControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value, this.siteNameValues))
    );
    this.filteredSiteList = this.siteNameValues.slice();
  }

  getLocationAutoComplete() {
    this.locationValues = this.filterService.getFilterObject(
      this.dataSource.data,
      'location'
    );
    this.filteredByLocation = this.locationControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value, this.locationValues))
    );
  }

  togglechnage() {
    this.chnageicon =
      this.chnageicon == 'keyboard_arrow_right'
        ? 'keyboard_arrow_down'
        : 'keyboard_arrow_right';
  }
  translator() {
    this.translate.get('singleBinding.itemPage').subscribe((data) => {
      this.paginator._intl.itemsPerPageLabel = data;
      this.paginator._intl.changes.next();
    });
  }

  showEditForm() {
    var retrievedObject = localStorage.getItem('tenantObj');
    var jsonTenantObj = JSON.parse(retrievedObject);
    
    if(retrievedObject != null){
      this.tenantForm.setValue({
        name: jsonTenantObj.name,
        company: jsonTenantObj.company,
        street: jsonTenantObj.address.street,
        state: jsonTenantObj.address.state,
        city: jsonTenantObj.address.city,
        country: jsonTenantObj.address.country,
        email: jsonTenantObj.email,
        phone: jsonTenantObj.phone,
        zipCode: jsonTenantObj.address.zipcode,
        status: jsonTenantObj.status,
      });
    }
    
    document.getElementById('Description').style.display = 'none';
    document.getElementById('EditForm').style.display = 'block';
    
  }
  setTenant(tenant: Tenant) {
    console.log('Tenants = ', tenant);
    this.tenant = tenant;
    this.Prename = tenant.name;
    this.Precompany = tenant.company;
    this.Prestreet = tenant.address.street;
    this.Prestate = tenant.address.state;
    this.Precity = tenant.address.city;
    this.Precountry = tenant.address.country;
    this.Preemail = tenant.email;
    this.Prephone = tenant.phone;
    this.PrezipCode = tenant.address.zipcode;
    this.Prestatus = tenant.status;
    this.PremerchantKey = tenant.isOwnMerchantKey ? 'Own Merchant Key' : 'Universal EV';
    this.tenantForm.setValue({
      name: tenant.name,
      company: tenant.company,
      street: tenant.address.street,
      state: tenant.address.state,
      city: tenant.address.city,
      country: tenant.address.country,
      email: tenant.email,
      phone: tenant.phone,
      zipCode: tenant.address.zipcode,
      status: tenant.status,
    });
    localStorage.setItem('tenantObj', JSON.stringify(tenant));
  }

  updateTenant() {
    this.mapTenant();
    // if (
    //   this.tenantForm.dirty &&
    //   this.tenantForm.valid &&
    //   this.tenantForm.touched
    // ) {
      this.httpDataService
        .put(AppConstants.APIUrlTenantUpdate + this.tenantId, {
          ...this.tenant,
          type: 'Customer',
        })
        .subscribe(
          (result: any) => {
            this.tenantForm.markAsUntouched();
            this.popUpService.showMsg(
              AppConstants.TenantUpdated,
              AppConstants.EmptyUrl,
              AppConstants.Success,
              AppConstants.Success
            );
            this.getTenantById();
            document.getElementById('Description').style.display = 'block';
            document.getElementById('EditForm').style.display = 'none';
          },
          (error) => {
            if (!Helper.isNullOrWhitespace(error)) {
              if (!Helper.isNullOrWhitespace(error.error.errors)) {
                const validationErrors = error.error.errors;
                this.serverError(validationErrors);
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
    // } else {
    //   if (this.tenantForm.valid) {
    //     this.popUpService.showMsg(
    //       AppConstants.NoTenantChanges,
    //       AppConstants.EmptyUrl,
    //       AppConstants.Warning,
    //       AppConstants.Warning
    //     );
    //   }
    // }
  }

  mapTenant() {
    this.tenant.tenantId = this.tenantId;
    this.tenant.name = this.tenantForm.get('name')?.value?.trim();
    this.tenant.company = this.tenantForm.get('company')?.value?.trim();
    this.tenant.street = this.tenantForm.get('street')?.value?.trim();
    this.tenant.email = this.tenantForm.get('email')?.value?.trim();
    this.tenant.phone = this.tenantForm.get('phone')?.value?.trim();
    this.tenant.state = this.tenantForm.get('state')?.value?.trim();
    this.tenant.city = this.tenantForm.get('city')?.value?.trim();
    this.tenant.country = this.tenantForm.get('country')?.value?.trim();
    this.tenant.zipCode = this.tenantForm.get('zipCode')?.value?.trim();
    this.tenant.status = this.tenantForm.get('status')?.value?.trim();
  }

  cancel() {
    document.getElementById('Description').style.display = 'block';
    document.getElementById('EditForm').style.display = 'none';
    // this.router.navigate([AppConstants.NavigateTenants]);
    this.tenantForm.reset();
  }

  toggleDeletedRecords() {
    // this.deletedRecords = !this.deletedRecords;
    this.getSites(this.tenantId);
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageNumber = event.pageIndex;
    this.getSites(this.tenantId);
  }

  getSites(tenantId: Guid) {
    this.process = true;
    this.dataSource.data = [];
    let URL = '';
    if (this.filterName || this.filterLocation) {
      URL = AppConstants.APIUrlGetSites +
            tenantId +
            '/' +
            this.deletedRecords +
            '/' +
            Number(this.pageNumber + 1) +
            '/' +
            this.pageSize +
            '?name=' +
            this.filterName +
            '&location=' +
            this.filterLocation;
    } else {
      URL = AppConstants.APIUrlGetSites +
            tenantId +
            '/' +
            this.deletedRecords +
            '/' +
            Number(this.pageNumber + 1) +
            '/' +
            this.pageSize
    }
    this.httpDataService
      .get(URL)
      .subscribe(
        (res) => {
          let data: any = [];
          if (res && res.length + 1) {
            data = res;
          } else {
            data = res;
          }
          res.forEach((currentObj: any, currentObjIndex: any) => {
            currentObj.location =
              currentObj.street +
              currentObj.city +
              ', ' +
              currentObj.state +
              ', ' +             
              currentObj.zipCode;
          });
          this.dataSource.data = res; 
          this.totalCount =
            res && res.length ? res.totalCount : res.length;
          this.sites = res;
          this.getSiteNameAutoComplete();
          this.getLocationAutoComplete();
          this.process = false;
          this.cdref.detectChanges();
        },
        (error) => {
          this.process = false;
          if (!Helper.isNullOrWhitespace(error.error)) {
            this.popUpData = this.serverErrorMsgResponse(error.error);
          }
          this.popUpService.showMsg(
            this.popUpData,
            AppConstants.EmptyUrl,
            AppConstants.Warning,
            AppConstants.Warning
          );
        }
      );
  }

  navigateSite() {
    this.routerExtService.setRouteValue(
      AppConstants.TenantID,
      this.tenantId.toString()
    );
    this.router.navigate([AppConstants.SiteCreationUrl]);
  }

  siteEdit(site: any) {
    if (site.isRequestRaised) {
      localStorage.setItem('parentSiteRequest', site.isRequestRaised);
    }
    const ids: any = `${this.tenantId}/${site.siteId}`;
    this.routerExtService.clearRouteValue();
    this.routerExtService.setRouteValue(
      AppConstants.TenantID,
      this.tenantId.toString()
    );
    this.routerExtService.setRouteValue(
      AppConstants.SiteID,
      site.siteId.toString()
    );
    this.routerExtService.setRouteValue(
      AppConstants.siteName,
      site.name.toString()
    );
    if (site.name) {
      localStorage.setItem('siteName', site.name.toString());
    }
    //this.router.navigate([AppConstants.SiteEditUrl + ids]);
    this.router.navigate([AppConstants.SiteEditUrl]);
  }

  signUpInvite() {
    this.httpDataService
      .getById(AppConstants.APIUrlSignUpInvite, this.tenantId)
      .subscribe(
        (res) => {
          this.popUpData = res;
          this.popUpService.showMsg(
            this.popUpData,
            AppConstants.EmptyUrl,
            AppConstants.Success,
            AppConstants.Success
          );
        },
        (error) => {
          if (!Helper.isNullOrWhitespace(error.error)) {
            this.popUpData = this.serverErrorMsgResponse(error.error);
          }
          this.popUpService.showMsg(
            this.popUpData,
            AppConstants.EmptyUrl,
            AppConstants.Error,
            AppConstants.Error
          );
        }
      );
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

  serverError(validationErrors: any) {
    Object.keys(validationErrors).forEach((prop) => {
      const formControl = this.tenantForm.get(prop);
      if (formControl) {
        formControl.setErrors({
          serverError: validationErrors[prop].join(','),
        });
      }
    });
  }

  generateReport(site: any) {
    this.dialogRef = this.dialog.open(MatDeleteDialogComponent, {
      width: '600px',
      panelClass: 'confirm-dialog-container',
      data: {
        title: 'Are you sure, you want to generate the report for this site ?',
      },
    });
    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.pageloader = true
        this.httpDataService
          .post(AppConstants.APIUrlGenerateReport, {
            tenantId: this.tenantId,
            siteId: site.siteId,
            registrationDate: Helper.getFormattedDate(site.registrationDate),
          })
          .subscribe((res) => {
            this.getSites(this.tenantId)
            this.pageloader = false
            this.popUpService.showMsg(
              `Report for ${site.name} has been generated successfully.`,
              AppConstants.EmptyUrl,
              AppConstants.Success,
              AppConstants.Success
            );
          });
      }
    });
  }

  deleteSite(site: any) {
    this.dialogRef = this.dialog.open(MatDeleteDialogComponent, {
      width: '450px',
      panelClass: 'confirm-dialog-container',
      data: {
        title: 'Are you sure, you want to request for deleting the site ?',
      },
    });
    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.httpDataService
          .post(AppConstants.APIUrlCreateDeleteRequest, {
            tenantId: this.tenantId,
            tenantName: this.tenantName,
            siteId: site.siteId,
            siteName: site.name,
          })
          .subscribe((res) => {
            this.getSites(this.tenantId);
          });
      }
    });
  }

  unDeleteSite(site: any) {
    this.dialogRef = this.dialog.open(MatDeleteDialogComponent, {
      width: '600px',
      panelClass: 'confirm-dialog-container',
      data: {
        title:
          'Are you sure, you want to cancel the request for deleting the site ?',
      },
    });
    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.httpDataService
          .put(AppConstants.APIUrlUpdateDeleteRequest, {
            id: site.deleteRequestId,
            status: 'Cancel',
          })
          .subscribe((res) => {
            this.getSites(this.tenantId);
          });
      }
    });
  }

  openMerchantPopup() {
    this.dialogRef = this.dialog.open(MatMerchantDialogComponent, {
      width: '600px',
      panelClass: 'confirm-dialog-container',
      data: this.tenant,
    });
    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.tenant.isOwnMerchantKey = (result.merchantKey === '2') ? true : false;
        this.tenant.keyName = result.keyName ? result.keyName : '';
        this.tenant.apiLoginID = result.apiLoginID ? result.apiLoginID : '';
        this.tenant.apiTransactionKey = result.apiTransactionKey ? result.apiTransactionKey : '';
      }
    });
  }

  downloadCsvReport() {
    let csvData = this.ConvertToCSV(this.dataSource.data, [
      'customerId',
      'name',
      'level2Rate',
      'dcFastRate',
      'utilityOwner',
      'numberChargePorts',
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
    dwldLink.setAttribute('download', 'Site-List-Report.csv');
    dwldLink.style.visibility = 'hidden';
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink); 
  }

  ConvertToCSV(objArray: any, headerList: any) {
    objArray.push({});
    objArray.push({});
    // objArray.push({name: 'Start Date : ', email: Helper.getFormattedDate(this.startDate)});
    // objArray.push({name: 'End Date : ', email: Helper.getFormattedDate(this.endDate)});
    // objArray.push({name: 'Total User Count : ', email: this.totalUserCount});
    // objArray.push({name: 'User Count : ', email: this.userCount});
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let row = '';
    let newHeaders = ['Customer ID', 'SIte Address', 'Charging Rate Level 2', 'DC', 'Utility Owner', 'Number of Ports'];
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
        element.customerId,
        element.name ? element.name : '-',
        element.level2Rate ? element.level2Rate : '-',
        element.dcFastRate ? element.dcFastRate : '-',
        element.utilityOwner ? element.utilityOwner : '-',
        element.numberChargePorts ? element.numberChargePorts : '-',
      ]);
    });
    autoTable(doc, {
      showHead: 'everyPage',
      pageBreak: 'auto',
      margin: { top: 35 },
      head: [['Sr. No.', 'Customer ID', 'SIte Address', 'Charging Rate Level 2', 'DC', 'Utility Owner', 'Number of Ports']],
      body: data,
      didDrawPage: function (data) {
        img.src = 'assets/EV-Chargers-Logo.png';
        doc.addImage(img, 'png', 13, 10, 50, 20);
        doc.setFontSize(24);
        doc.setTextColor(0, 150, 0);
        doc.text('Site List Report', 85, 23);
      },
    });
    doc.addPage();
    img.src = 'assets/EV-Chargers-Logo.png';
    doc.addImage(img, 'png', 13, 10, 50, 20);
    doc.setFontSize(24);
    doc.setTextColor(0, 150, 0);
    doc.text('Site List Report', 85, 23);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    // doc.text('Start Date : ' + Helper.getFormattedDate(this.startDate), 15, 40);
    // doc.text('End Date : ' + Helper.getFormattedDate(this.endDate), 115, 40);
    // doc.text('Total User Count : ' + this.totalUserCount, 15, 50);
    // doc.text('User Count : ' + this.userCount, 115, 50);
    doc.save('Site-List-Report.pdf');
  }
}
