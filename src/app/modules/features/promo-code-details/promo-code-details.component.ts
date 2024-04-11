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
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { DataService } from '../../../shared/services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-promo-code-details',
  templateUrl: './promo-code-details.component.html',
  styleUrls: ['./promo-code-details.component.css'],
})
export class PromoCodeDetailsComponent implements OnInit {
  allTenantSelected = false;
  allSiteSelected = false;
  allChargePointSelected = false;
  promoExistErr = false;
  promocodeId = '';
  PromocodeCreatedOn = '';
  promocodeForm: UntypedFormGroup;
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
  promoCodeDetails: any;

  constructor(
    public filterService: GridFilterService,
    private cdref: ChangeDetectorRef,
    private readonly formBuilder: UntypedFormBuilder,
    private popUpService: PopUpService,
    private httpDataService: HttpDataService,
    public dialog: MatDialog,
    public dataService: DataService,
    public router: Router
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.getTenantNames();
    this.buildPromoCodeForm();
    this.subscription = this.dataService.currentMessage.subscribe(
      (message: any) => {
        if (message && message.action) {
          this.promoCodeDetails = message;
        } else {
          this.promoCodeDetails = JSON.parse(
            localStorage.getItem('promocodedetails') || ''
          );
        }
      }
    );
  }

  ngAfterViewInit(): void {
    if (this.promoCodeDetails.promoCodeID) {
      this.edit(this.promoCodeDetails);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  radioChange(event: any) {
    if (event.value === 'Percentage') {
      this.promocodeForm.controls['flatdiscount'].setValue(0);
      this.promocodeForm.controls['flatdiscount'].disable();
      this.promocodeForm.controls['discountpercentage'].enable();
    } else if (event.value === 'Flat') {
      this.promocodeForm.controls['discountpercentage'].setValue(0);
      this.promocodeForm.controls['flatdiscount'].enable();
      this.promocodeForm.controls['discountpercentage'].disable();
    }
  }

  buildPromoCodeForm() {
    this.promocodeForm = this.formBuilder.group({
      promoCode: [
        null,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(150),
        ],
      ],
      promocodedesc: [
        null,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(150),
        ],
      ],
      discountpercentage: [null, [Validators.required]],
      flatdiscount: [{ value: 0, disabled: true }, [Validators.required]],
      validitystartdate: [null, [Validators.required]],
      validityenddate: [null, [Validators.required]],
      maxusage: [null, [Validators.required]],
      tenants: [null, [Validators.required]],
      sites: [null, [Validators.required]],
      chargePoints: [null, [Validators.required]],
      status: [false, []],
      radioGroup: [null, []],
    });
  }

  get promoCode(): boolean {
    return (
      !Helper.isNullOrWhitespace(this.promocodeForm.get('promoCode')?.value) &&
      (this.promocodeForm.get('promoCode')?.value.length <= 3 ||
        this.promocodeForm.get('promoCode')?.value.length > 150)
    );
  }

  get promocodedesc(): boolean {
    return (
      !Helper.isNullOrWhitespace(
        this.promocodeForm.get('promocodedesc')?.value
      ) &&
      (this.promocodeForm.get('promocodedesc')?.value.length <= 3 ||
        this.promocodeForm.get('promocodedesc')?.value.length > 150)
    );
  }

  get discountpercentage(): boolean {
    return !Helper.isNullOrWhitespace(
      this.promocodeForm.get('discountpercentage')?.value
    );
  }

  get flatdiscount(): boolean {
    return !Helper.isNullOrWhitespace(
      this.promocodeForm.get('flatdiscount')?.value
    );
  }

  get validitystartdate(): boolean {
    return !Helper.isNullOrWhitespace(
      this.promocodeForm.get('validitystartdate')?.value
    );
  }

  get validityenddate(): boolean {
    return !Helper.isNullOrWhitespace(
      this.promocodeForm.get('validityenddate')?.value
    );
  }

  get maxusage(): boolean {
    return !Helper.isNullOrWhitespace(
      this.promocodeForm.get('maxusage')?.value
    );
  }

  validatepromocode() {
    this.httpDataService
      .get(
        AppConstants.APIUrlValidatePromocode +
          this.promocodeForm.get('promoCode')?.value?.trim()
      )
      .subscribe(
        (res: any) => {
          this.promoExistErr = false;
        },
        (err) => {
          this.promoExistErr = true;
          this.promocodeForm.controls.promoCode.setErrors({ valid: false });
        }
      );
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

  toggleAllTenantSelection() {
    this.allTenantSelected = !this.allTenantSelected;
    let tenantArray: any[] = [];
    if (this.allTenantSelected) {
      tenantArray.push('select-all');
      for (let index = 0; index < this.tenants.length; index++) {
        tenantArray.push(this.tenants[index].tenantId);
        if (this.tenants.length - 1 === index) {
          this.promocodeForm.controls['tenants'].setValue(tenantArray);
          this.getSitesFromTenants(tenantArray);
        }
      }
    } else {
      this.sites = [];
      this.chargePoints = [];
      this.promocodeForm.controls['tenants'].setValue([]);
      this.promocodeForm.controls['sites'].reset();
      this.promocodeForm.controls['chargePoints'].reset();
    }
  }

  tenantSelection() {
    let tenantArray: string[] = this.promocodeForm.get('tenants')?.value;
    const index = tenantArray.indexOf('select-all');
    if (index > -1) {
      tenantArray.splice(index, 1);
      this.allTenantSelected = !this.allTenantSelected;
    }
    this.sites = [];
    this.chargePoints = [];
    this.tenantList = tenantArray;
    this.promocodeForm.controls['tenants'].setValue(tenantArray);
    this.getSitesFromTenants(tenantArray);
  }

  getSitesFromTenants(tenantList: any) {
    this.sites = [];
    this.chargePoints = [];
    const index = tenantList.indexOf('select-all');
    if (index > -1) {
      tenantList.splice(index, 1);
    }
    this.httpDataService
      // .get(AppConstants.APIUrlTenantToSiteList + String(tenantList))
      .post(AppConstants.APIUrlTenantToSiteList, {
        'tenantId':this.tenantList.toString()
      })
      .subscribe((res) => {
        this.sites = res;
        this.promocodeForm.controls['sites'].reset();
        this.promocodeForm.controls['chargePoints'].reset();
      });
  }

  toggleAllSiteSelection() {
    this.allSiteSelected = !this.allSiteSelected;
    let siteArray: any[] = [];
    if (this.allSiteSelected) {
      siteArray.push('select-all');
      for (let index = 0; index < this.sites.length; index++) {
        siteArray.push(this.sites[index].siteId);
        if (this.sites.length - 1 === index) {
          this.promocodeForm.controls['sites'].setValue(siteArray);
          this.getChargePointsFromSite(siteArray);
        }
      }
    } else {
      this.chargePoints = [];
      this.promocodeForm.controls['sites'].setValue([]);
      this.promocodeForm.controls['chargePoints'].reset();
    }
  }

  siteSelection() {
    let siteArray: string[] = this.promocodeForm.get('sites')?.value;
    const index = siteArray.indexOf('select-all');
    if (index > -1) {
      siteArray.splice(index, 1);
      this.allSiteSelected = !this.allSiteSelected;
    }
    this.chargePoints = [];
    this.siteList = siteArray;
    this.promocodeForm.controls['sites'].setValue(siteArray);
    this.getChargePointsFromSite(siteArray);
  }

  getChargePointsFromSite(siteList: any) {
    this.chargePoints = [];
    const index = siteList.indexOf('select-all');
    if (index > -1) {
      siteList.splice(index, 1);
    }
    this.httpDataService
      // .get(
      //   AppConstants.APIUrlSiteToChargePointList +
      //     String(siteList) +
      //     '/' +
      //     String(this.tenantList)
      // )
      .post(AppConstants.APIUrlSiteToChargePointList ,{
        'tenantId':this.tenantList.toString(),
        'siteId':siteList.toString()
      })
      .subscribe((res) => {
        this.chargePoints = res;
        this.promocodeForm.controls['chargePoints'].reset();
      });
  }

  toggleAllChargePointSelection() {
    this.allChargePointSelected = !this.allChargePointSelected;
    let chargePointArray: any[] = [];
    if (this.allChargePointSelected) {
      chargePointArray.push('select-all');
      for (let index = 0; index < this.chargePoints.length; index++) {
        chargePointArray.push(this.chargePoints[index].chargePointId);
        if (this.chargePoints.length - 1 === index) {
          this.promocodeForm.controls['chargePoints'].setValue(
            chargePointArray
          );
        }
      }
    } else {
      this.promocodeForm.controls['chargePoints'].setValue([]);
    }
  }

  chargePointSelection() {
    let chargePointArray: string[] =
      this.promocodeForm.get('chargePoints')?.value;
    const index = chargePointArray.indexOf('select-all');
    if (index > -1) {
      chargePointArray.splice(index, 1);
      this.allChargePointSelected = !this.allChargePointSelected;
    }
    this.promocodeForm.controls['chargePoints'].setValue(chargePointArray);
  }

  edit(element: any) {
    console.log(element);
    let tenantsArray: any[] = [];
    let sitesArray: any[] = [];
    let chargepointsArray: any[] = [];
    this.promocodeId = element.promoCodeID;
    this.PromocodeCreatedOn = element.createdOn;
    element.tenants.forEach((element: any) => {
      tenantsArray.push(element.tenants);
    });
    element.sites.forEach((element: any) => {
      sitesArray.push(element.sites);
    });
    element.chargePoints.forEach((element: any) => {
      chargepointsArray.push(element.chargepoints);
    });
    this.tenantList = tenantsArray;
    if (this.tenantList.length) {
      this.httpDataService
        // .get(AppConstants.APIUrlTenantToSiteList + String(this.tenantList))
        .post(AppConstants.APIUrlTenantToSiteList, {
          'tenantId':this.tenantList.toString()
        })
        .subscribe((res) => {
          this.sites = res;
        });
    }
    this.siteList = sitesArray;
    if (this.siteList.length) {
      this.httpDataService
        // .get(
        //   AppConstants.APIUrlSiteToChargePointList +
        //     String(this.siteList) +
        //     '/' +
        //     String(this.tenantList)
        // )
        .post(AppConstants.APIUrlSiteToChargePointList ,{
          'tenantId':this.tenantList.toString(),
          'siteId':this.siteList.toString()
        })
        .subscribe((res) => {
          this.chargePoints = res;
        });
    }
    if (element.discountPercentage === 0) {
      setTimeout(() => {
        this.selectedValue = 'Flat';
        this.promocodeForm.controls['flatdiscount'].enable();
        this.promocodeForm.controls['discountpercentage'].disable();
      }, 500);
    } else if (element.flatDiscount === 0) {
      setTimeout(() => {
        this.selectedValue = 'Percentage';
        this.promocodeForm.controls['flatdiscount'].disable();
        this.promocodeForm.controls['discountpercentage'].enable();
      }, 500);
    }
    this.promocodeForm.setValue({
      promoCode: element.promoCode,
      promocodedesc: element.promoCodeDescription,
      discountpercentage: element.discountPercentage,
      flatdiscount: element.flatDiscount,
      tenants: tenantsArray,
      sites: sitesArray,
      chargePoints: chargepointsArray,
      validitystartdate: new Date(element.validityStartDate),
      validityenddate: new Date(element.validityEndDate),
      maxusage: element.maxUsage,
      status: element.isActive,
      radioGroup: '',
    });
    this.cdref.detectChanges();
  }

  mapPromocode() {
    let tenantsArray: { tenants: any }[] = [];
    let sitesArray: { sites: any }[] = [];
    let chargepointsArray: { chargePoints: any }[] = [];
    this.promocodeForm.get('tenants')?.value &&
      this.promocodeForm.get('tenants')?.value.forEach((element: any) => {
        if (element !== 'select-all') {
          tenantsArray.push({
            tenants: element,
          });
        }
      });
    this.promocodeForm.get('sites')?.value &&
      this.promocodeForm.get('sites')?.value.forEach((element: any) => {
        if (element !== 'select-all') {
          sitesArray.push({
            sites: element,
          });
        }
      });
    this.promocodeForm.get('chargePoints')?.value &&
      this.promocodeForm.get('chargePoints')?.value.forEach((element: any) => {
        if (element !== 'select-all') {
          chargepointsArray.push({
            chargePoints: element,
          });
        }
      });
    this.promocodeObj.promoCode = this.promocodeForm
      .get('promoCode')
      ?.value?.trim();
    this.promocodeObj.promoCodeDescription = this.promocodeForm
      .get('promocodedesc')
      ?.value?.trim();
    this.promocodeObj.discountPercentage = parseFloat(
      this.promocodeForm.get('discountpercentage')?.value
    );
    this.promocodeObj.flatDiscount = parseFloat(
      this.promocodeForm.get('flatdiscount')?.value
    );
    this.promocodeObj.validityStartDate = this.promocodeForm.get(
      'validitystartdate'
    )?.value
      ? new Date(this.promocodeForm.get('validitystartdate')?.value)
      : '';
    this.promocodeObj.validityEndDate = this.promocodeForm.get(
      'validityenddate'
    )?.value
      ? new Date(this.promocodeForm.get('validityenddate')?.value)
      : '';
    this.promocodeObj.maxUsage = parseInt(
      this.promocodeForm.get('maxusage')?.value
    );
    this.promocodeObj.isActive = this.promocodeForm.get('status')?.value;
    this.promocodeObj.tenants = this.promocodeForm.get('tenants')?.value
      ? tenantsArray
      : '';
    this.promocodeObj.sites = this.promocodeForm.get('sites')?.value
      ? sitesArray
      : '';
    this.promocodeObj.chargePoints = this.promocodeForm.get('chargePoints')
      ?.value
      ? chargepointsArray
      : '';
    this.promocodeObj.isDeleted = false;
  }

  saveupdate() {
    this.mapPromocode();
    var validityStartDate: Date;
    var validityEndDate: Date;
    if (
      this.promocodeForm.dirty &&
      this.promocodeForm.valid &&
      this.promocodeForm.touched &&
      !this.promoExistErr &&
      (this.promocodeObj.discountPercentage !== 0 ||
        this.promocodeObj.flatDiscount !== 0)
    ) {

      let UTCStartDate = Date.UTC(this.promocodeForm.get('validitystartdate')?.value.getFullYear(), this.promocodeForm.get('validitystartdate')?.value.getMonth(), this.promocodeForm.get('validitystartdate')?.value.getDate()) - this.promocodeForm.get('validitystartdate')?.value.getTimezoneOffset();
      let UTCEndDate = Date.UTC(this.promocodeForm.get('validityenddate')?.value.getFullYear(), this.promocodeForm.get('validityenddate')?.value.getMonth(), this.promocodeForm.get('validityenddate')?.value.getDate()) - this.promocodeForm.get('validityenddate')?.value.getTimezoneOffset();
      validityStartDate = new Date(UTCStartDate);
      validityEndDate = new Date(UTCEndDate);
      this.promocodeObj.validityStartDate = validityStartDate;
      this.promocodeObj.validityEndDate = validityEndDate;
        
      if (this.promoCodeDetails.action === 'edit') {
        this.httpDataService
          .put(AppConstants.APIUrlPromocodeUpdate + this.promocodeId, {
            ...this.promocodeObj,
            CreatedOn: this.PromocodeCreatedOn,
            UpdatedOn: new Date(),
          })
          .subscribe((res) => {
            this.popUpService.showMsg(
              'Promocode Updated.',
              AppConstants.EmptyUrl,
              AppConstants.Success,
              AppConstants.Success
            );
            this.promocodeForm.reset();
            this.router.navigate(['/promo-code']);
          });
      } else if (this.promoCodeDetails.action === 'new') {
        this.httpDataService
          .post(AppConstants.APIUrlPromocodeAdd, {
            ...this.promocodeObj,
            CreatedOn: new Date(),
          })
          .subscribe((res) => {
            this.popUpService.showMsg(
              'Promocode Created.',
              AppConstants.EmptyUrl,
              AppConstants.Success,
              AppConstants.Success
            );
            this.promocodeForm.reset();
            this.router.navigate(['/promo-code']);
          });
      }
    } else {
      if (
        this.promocodeObj.discountPercentage === 0 &&
        this.promocodeObj.flatDiscount === 0
      ) {
        this.popUpService.showMsg(
          "Discount Percentage or Flat Discount can't be 0",
          AppConstants.EmptyUrl,
          AppConstants.Error,
          AppConstants.Error
        );
      } else {
        this.popUpService.showMsg(
          'Invalid Promocode Data',
          AppConstants.EmptyUrl,
          AppConstants.Error,
          AppConstants.Error
        );
      }
    }
  }

  cancel(promocodeGeneration: FormGroupDirective) {
    promocodeGeneration.resetForm();
    this.promocodeForm.reset();
    this.selectedValue = 'Percentage';
    this.promocodeForm.controls['flatdiscount'].disable();
    this.promocodeForm.controls['discountpercentage'].enable();
    this.router.navigate(['/promo-code']);
  }
}
