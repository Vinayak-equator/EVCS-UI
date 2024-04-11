import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppConstants } from '@app/constants';
import { RouterExtService } from '@app/shared/services/routerExt.service';
import { IndexedDBService } from '@app/shared/utility/indexed-db.service';
import { PopUpService } from '@app/shared/utility/popup.service';
import { Guid } from 'guid-typescript';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { Site } from 'src/app/models/site.model';
import { HttpDataService } from 'src/app/shared/services/http-data.service';
import Helper from 'src/app/shared/utility/Helper';

@Component({
  selector: 'app-site-creation',
  templateUrl: './site-creation.component.html',
  styleUrls: ['./site-creation.component.css'],
})
export class SiteCreationComponent implements OnInit {

  siteForm: UntypedFormGroup;
  site: Site;
  stringJson: any;
  msg: string;
  tenantId: Guid;
  tenantName: any;
  markupThreshold: number = 0;
  markupError = false;
  markupDCError = false;
  invalidFileSize: boolean = false;
  invalidFileType: boolean = false;
  canModifyPreAuth = false;
  canModifyMarkupCharge = false;
  selectedFileSizeInBytes: number = 0;
  selectedFileSizeInMiB: number = 0;
  maxFileSizeInBytes: number = 10 * 1024 * 1024;
  maxFileSizeInMiB: number = 0;
  fileContent: File;
  originalFileName: string;
  showUploadContent = false;
  imageSource: string;
  fileName: string;
  timePricing: any = [];
  isOwnSetting: any = false;
  masterGlobalSettings: any;

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
  @ViewChild('myUpload') myUploadVariable: ElementRef;

  supportedFileTypes: string = `.pdf,.doc,.docx,.ppt,.pptx,.txt,.rtf,.csv,.eps,.bmp,.svg,.png,.jpg,.jpeg,.gif,.tiff,.tif,.mp3,.mp4,.wmv`;

  errors: string[];
  popUpData: string;

  data = {};
  private modelError: { [key: string]: { errors: string[] } } = {};

  get name(): boolean {
    return (
      !Helper.isNullOrWhitespace(this.siteForm.get('name')?.value) &&
      (this.siteForm.get('name')?.value.length <= 3 ||
        this.siteForm.get('name')?.value.length > 150)
    );
  }

  get phone(): boolean {
    return (
      !Helper.isNullOrWhitespace(this.siteForm.get('phone')?.value) &&
      (this.siteForm.get('phone')?.value.length <= 10 ||
        this.siteForm.get('phone')?.value.length > 15)
    );
  }

  get city(): boolean {
    return (
      !Helper.isNullOrWhitespace(this.siteForm.get('city')?.value) &&
      (this.siteForm.get('city')?.value.length <= 3 ||
        this.siteForm.get('city')?.value.length > 100)
    );
  }

  get country(): boolean {
    return (
      !Helper.isNullOrWhitespace(this.siteForm.get('country')?.value) &&
      (this.siteForm.get('country')?.value.length <= 3 ||
        this.siteForm.get('country')?.value.length > 100)
    );
  }

  get state(): boolean {
    return (
      !Helper.isNullOrWhitespace(this.siteForm.get('state')?.value) &&
      (this.siteForm.get('state')?.value.length <= 3 ||
        this.siteForm.get('state')?.value.length > 100)
    );
  }

  get provider(): boolean {
    return (
      !Helper.isNullOrWhitespace(this.siteForm.get('utilityProvider')?.value) &&
      this.siteForm.get('utilityProvider')?.value.length <= 3
    );
  }

  get utilitytdu(): boolean {
    return !Helper.isNullOrWhitespace(this.siteForm.get('utilitytdu')?.value);
  }

  get priceType(): boolean {
    return !Helper.isNullOrWhitespace(this.siteForm.get('priceType')?.value);
  }

  get networkingFees(): boolean {
    return !Helper.isNullOrWhitespace(this.siteForm.get('networkingFees')?.value);
  }

  get processingFees(): boolean {
    return !Helper.isNullOrWhitespace(this.siteForm.get('processingFees')?.value);
  }

  get cloudServiceFees(): boolean {
    return !Helper.isNullOrWhitespace(this.siteForm.get('cloudServiceFees')?.value);
  }

  get meterServiceFees(): boolean {
    return !Helper.isNullOrWhitespace(this.siteForm.get('meterServiceFees')?.value);
  }

  get salesTax(): boolean {
    return !Helper.isNullOrWhitespace(this.siteForm.get('salesTax')?.value);
  }

  get street(): boolean {
    return (
      !Helper.isNullOrWhitespace(this.siteForm.get('street')?.value) &&
      (this.siteForm.get('street')?.value.length <= 15 ||
        this.siteForm.get('street')?.value.length > 250)
    );
  }

  get zip(): boolean {
    return (
      !Helper.isNullOrWhitespace(this.siteForm.get('zipCode')?.value) &&
      (this.siteForm.get('zipCode')?.value.length <= 5 ||
        this.siteForm.get('zipCode')?.value.length > 11)
    );
  }

  get address(): boolean {
    return (
      !Helper.isNullOrWhitespace(this.siteForm.get('street')?.value) &&
      (this.siteForm.get('street')?.value.length <= 15 ||
        this.siteForm.get('street')?.value.length > 250)
    );
  }

  get hasBillUrl(): boolean {
    return !Helper.isNullOrEmpty(this.imageSource);
  }

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly httpDataService: HttpDataService,
    private toastr: ToastrService,
    private router: Router,
    private popUpService: PopUpService,
    private routerExtService: RouterExtService,
    private indexedDBService: IndexedDBService
  ) {
    this.site = new Site();
  }

  buildSiteForm() {
    this.siteForm = this.formBuilder.group({
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
        [Validators.required, Validators.pattern(AppConstants.addressPattern)],
      ],
      phone: [
        null,
        [
          Validators.required,
          Validators.pattern('^[0-9]*$'),
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
      country: [
        null,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
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
      zipCode: [
        null,
        [
          Validators.required,
          Validators.pattern(AppConstants.numberPattern),
          Validators.minLength(5),
          Validators.maxLength(6),
        ],
      ],
      utilityProvider: [null, []],
      utilityBill: [null, []],
      utilitytdu: [null, []],
      level2Rate: [null, []],
      level2RateUnit: [null, []],
      dcFastRate: [null, []],
      dcFastRateUnit: [null, []],
      preAuthAmount: [0, []],
      markupCharge: [0, []],
      markupPercentForDC: [0, []],
      status: [null],
      priceType:[null, []],
      networkingFees:[0, []],
      processingFees: [0, []],
      cloudServiceFees: [0, []],
      meterServiceFees: [0, []],
      salesTax: [0, []],
      customerId: [null, []],
      vendorId: [null, []],
      siteManager: [null, []],
      revenueShare: [0, []],
      meterNumber:  [0, []],
      utilityOwner: [null, []],
      utilityCost: [0, []],
      maintenanceCharges: [0, []],
      maintenanceChargesReason: [null, []]
    });
  }

  addTime() {
    this.timePricing.push({
      startTime: '',
      endTime: '',
      level2Rate: '',
      level2RateUnit: '',
      dcFastRate: '',
      dcFastRateUnit: ''
    });
    this.checkIsOwnSetting();
  }

  removeTime(index: any) {
    if (index > -1) {
      this.timePricing.splice(index, 1);
    }
    this.checkIsOwnSetting();
  }

  onKeyPress(event: any) {
    const regexpNumber = /[0-9\+\-\ ]/;
    let inputCharacter = String.fromCharCode(event.charCode);
    if (event.keyCode != 8 && !regexpNumber.test(inputCharacter)) {
      event.preventDefault();
    }
  }

  ngOnInit(): void {
    this.indexedDBService
      .getRecordData('PermissionDB', 'permission', 'Site Management')
      .then((data: any) => {
        data.previlleges.forEach((pp: any) => {
          if (pp.key === 'Update Site PreAuth') {
            this.canModifyPreAuth = pp.value;
          }
          if (pp.key === 'Update Site Markup') {
            this.canModifyMarkupCharge = pp.value;
          }
          if (pp.key === 'Markup Threshold') {
            this.markupThreshold = parseFloat(pp.markupThreshold);
          }
        });
      })
      .catch((error: any) => {
        console.error(error);
      });
    this.buildSiteForm();
    // this.onChanges();
    this.tenantName = localStorage.getItem('tenantName');
    // this.tenantName = this.localStorage.retrieve('tenantName');
    this.tenantId = this.routerExtService.getRouteValue(AppConstants.TenantID);
    // this.activatedRoute.params.subscribe(params => {
    //   this.tenantId = params['tenantId'];
    // });

    this.setDefaultValueForRateUnit();
  }

  onChanges(): void {
    // this.siteForm.get('level2RateUnit')?.valueChanges.subscribe((val) => {
    //   if (Helper.hasAny(val) && val == 'Min') {
    //     this.siteForm
    //       .get('level2Rate')
    //       ?.setValue(AppConstants.DefaultLevel2Rate);
    //   } else {
    //     this.siteForm.get('level2Rate')?.setValue(0);
    //   }
    // });

    // this.siteForm.get('dcFastRateUnit')?.valueChanges.subscribe((val) => {
    //   if (Helper.hasAny(val) && val == 'Min') {
    //     this.siteForm
    //       .get('dcFastRate')
    //       ?.setValue(AppConstants.DefaultDcFastRate);
    //   } else {
    //     this.siteForm.get('dcFastRate')?.setValue(0);
    //   }
    // });
  }

  /**
   * Set Default Values for
   * Rate Unit Form Control
   * After 300 mic seconds
   */
  setDefaultValueForRateUnit() {
    this.siteForm.get('level2Rate')?.setValue(AppConstants.DefaultLevel2Rate);
    this.siteForm.get('dcFastRate')?.setValue(AppConstants.DefaultDcFastRate);
    setTimeout(() => {
      this.siteForm.get('level2RateUnit')?.setValue('Min');
      this.siteForm.get('dcFastRateUnit')?.setValue('Min');
    }, 300);
  }

  cancel() {
    if (!Helper.isNullOrEmpty(localStorage.getItem('siteDashboardUrl'))) {
      this.router.navigate([localStorage.getItem('siteDashboardUrl')]);
      localStorage.removeItem('siteDashboardUrl');
    } else {
      this.routerExtService.setRouteValue(
        AppConstants.TenantID,
        this.tenantId.toString()
      );
      this.router.navigate([AppConstants.TenantDetailPage]);
      localStorage.removeItem('selectedTenant');
    }
  }
  mapSite() {
    if (this.siteForm.valid) {
      this.site.name = this.siteForm.get('name')?.value;
      this.site.status = this.siteForm.get('status')?.value;
      this.site.street = this.siteForm.get('street')?.value;
      this.site.utilityProvider = this.siteForm.get('utilityProvider')?.value;
      this.site.utilityBill = this.fileContent;
      this.site.utilitytdu = this.siteForm.get('utilitytdu')?.value;
      this.site.level2Rate = this.siteForm.get('level2Rate')?.value;
      this.site.level2RateUnit = this.siteForm.get('level2RateUnit')?.value;
      this.site.dcFastRate = this.siteForm.get('dcFastRate')?.value;
      this.site.dcFastRateUnit = this.siteForm.get('dcFastRateUnit')?.value;
      this.site.phone = this.siteForm.get('phone')?.value;
      this.site.state = this.siteForm.get('state')?.value;
      this.site.city = this.siteForm.get('city')?.value;
      this.site.country = this.siteForm.get('country')?.value;
      this.site.zipCode = this.siteForm.get('zipCode')?.value;
      this.site.preAuthAmount = this.siteForm.get('preAuthAmount')?.value ? this.siteForm.get('preAuthAmount')?.value : 0;
      this.site.markupCharge = this.siteForm.get('markupCharge')?.value ? this.siteForm.get('markupCharge')?.value : 0;
      this.site.markupPercentForDC = this.siteForm.get('markupPercentForDC')?.value ? this.siteForm.get('markupPercentForDC')?.value : 0;
      this.site.priceType = this.siteForm.get('priceType')?.value ? this.siteForm.get('priceType')?.value : '';
      this.site.networkingFees = this.siteForm.get('networkingFees')?.value ? this.siteForm.get('networkingFees')?.value : 0;
      this.site.processingFees = this.siteForm.get('processingFees')?.value ? this.siteForm.get('processingFees')?.value : 0;
      this.site.cloudServiceFees = this.siteForm.get('cloudServiceFees')?.value ? this.siteForm.get('cloudServiceFees')?.value : 0;
      this.site.meterServiceFees = this.siteForm.get('meterServiceFees')?.value ? this.siteForm.get('meterServiceFees')?.value : 0;
      this.site.salesTax = this.siteForm.get('salesTax')?.value ? this.siteForm.get('salesTax')?.value : 0;
      this.site.customerId = this.siteForm.get('customerId')?.value ? this.siteForm.get('customerId')?.value : '';
      this.site.vendorId = this.siteForm.get('vendorId')?.value ? this.siteForm.get('vendorId')?.value : '';
      this.site.siteManager = this.siteForm.get('siteManager')?.value ? this.siteForm.get('siteManager')?.value : '';
      this.site.revenueShare = this.siteForm.get('revenueShare')?.value ? this.siteForm.get('revenueShare')?.value : 0;
      this.site.meterNumber = this.siteForm.get('meterNumber')?.value ? this.siteForm.get('meterNumber')?.value : 0;
      this.site.utilityOwner = this.siteForm.get('utilityOwner')?.value ? this.siteForm.get('utilityOwner')?.value : '';
      this.site.utilityCost = this.siteForm.get('utilityCost')?.value ? this.siteForm.get('utilityCost')?.value : 0;
      this.site.maintenanceCharges = this.siteForm.get('maintenanceCharges')?.value ? this.siteForm.get('maintenanceCharges')?.value : 0;
      this.site.maintenanceChargesReason = this.siteForm.get('maintenanceChargesReason')?.value ? this.siteForm.get('maintenanceChargesReason')?.value : '';
    }
  }

  clearUpload() {
    this.myUploadVariable.nativeElement.value = '';
    this.siteForm.get('utilityBill')?.setValidators([Validators.required]);
    this.siteForm.get('utilityBill')?.updateValueAndValidity();
    this.siteForm.get('utilityBill')?.setErrors({ required: true });
    this.imageSource = '';
  }

  validateMarkupThreshold(event: any) {
    let value = parseFloat(event.target.value);
    if (value > this.markupThreshold) {
      this.markupError = true;
      this.siteForm.controls['markupCharge'].setErrors({'error': true});
    } else {
      this.markupError = false;
      this.siteForm.controls['markupCharge'].updateValueAndValidity();
    }
  }

  validateDCMarkupThreshold(event: any) {
    let value = parseFloat(event.target.value);
    if (value > this.markupThreshold) {
      this.markupDCError = true;
      this.siteForm.controls['markupPercentForDC'].setErrors({'error': true});
    } else {
      this.markupDCError = false;
      this.siteForm.controls['markupPercentForDC'].updateValueAndValidity();
    }
  }

  saveSite() {
    this.errors = [];
    this.mapSite();
    if (this.siteForm.dirty && this.siteForm.valid && this.siteForm.touched) {
      // this.createSite({...this.site, isOwnSetting: this.isOwnSetting, timePricing: this.timePricing }).subscribe(
      this.httpDataService.post(AppConstants.APIUrlSiteCreationUrl + this.tenantId, {...this.site, isOwnSetting: this.isOwnSetting, timePricing: this.timePricing }).subscribe(
        (result: any) => {
          this.siteForm.markAsUntouched();
          this.popUpService.showMsg(
            AppConstants.SiteCreatedMsg,
            AppConstants.TenantDetailPage,
            AppConstants.Success,
            AppConstants.Success
          );
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
      );
    } else {
      if (this.siteForm.valid) {
        this.popUpService.showMsg(
          AppConstants.NoSiteChanges,
          AppConstants.EmptyUrl,
          AppConstants.Warning,
          AppConstants.Warning
        );
      }
    }
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
      const formControl = this.siteForm.get(prop);
      if (formControl) {
        formControl.setErrors({
          serverError: validationErrors[prop].join(','),
        });
      }
    });
  }

  // createSite(site: Site): Observable<Site> {
  //   let formData = new FormData();
  //   let stringJson = JSON.stringify(site);
  //   let jsonObject: any = JSON.parse(stringJson);

  //   Object.keys(jsonObject).forEach((key) => {
  //     if (key != 'utilityBill') {
  //       formData.append(key, jsonObject[key]);
  //     }
  //   });

  //   formData.append('utilityBill', this.fileContent);

  //   return this.httpDataService.upload(
  //     AppConstants.APIUrlSiteCreationUrl + this.tenantId,
  //     formData
  //   );
  // }

  onFileChange(event: Event) {
    this.invalidFileSize = false;
    this.invalidFileType = false;
    this.selectedFileSizeInMiB = 0;
    this.selectedFileSizeInBytes = 0;

    const element = event.target as HTMLInputElement;
    if (element.files && element.files.length) {
      // check fileSize
      this.selectedFileSizeInBytes = element.files[0].size;
      this.selectedFileSizeInMiB = this.selectedFileSizeInBytes / (1024 * 1024);
      this.invalidFileSize =
        this.selectedFileSizeInBytes > this.maxFileSizeInBytes;
      this.invalidFileType = Helper.isFileTypeNotSuported(
        element.files[0].name,
        this.supportedFileTypes.split(',')
      );
      // get content
      if (!this.invalidFileSize && !this.invalidFileType) {
        this.fileContent = element.files[0];
        this.siteForm.get('utilityBill')?.setValue(this.fileContent);
        this.originalFileName = element.files[0].name;
        if (!Helper.isNullOrEmpty(element.files[0].name)) {
          this.imageSource = element.files[0].name;
        }
      } else {
        const errorMsg =
          'Invalid File' +
          (this.invalidFileSize
            ? ' Size '
            : this.invalidFileType
            ? ' Type '
            : '') +
          'Selected';
        this.toastr.warning(errorMsg);
      }
    }
  }

  // pricingChange() {
  //   if (this.priceType === '1') {
  //     this.timePricing = [];
  //   } else if (this.priceType === '2') {
  //     this.dcFastRate = 0;
  //     this.dcFastRateUnit = '';
  //     this.level2Rate = 0;
  //     this.level2RateUnit = '';
  //   } 
  // }

  fetchSettings() {
    if (this.isOwnSetting) {
      this.httpDataService
      .get(
        AppConstants.APIUrlGetGlobalSettings
      )
      .subscribe(
        (res: any) => {
          this.masterGlobalSettings = JSON.parse(JSON.stringify(res));
          this.siteForm.get('priceType')?.setValue(String(res?.priceType));
          this.siteForm.get('networkingFees')?.setValue(String(res?.networkingFees));
          this.siteForm.get('processingFees')?.setValue(String(res?.processingFees));
          this.siteForm.get('cloudServiceFees')?.setValue(String(res?.cloudServiceFees));
          this.siteForm.get('meterServiceFees')?.setValue(String(res?.meterServiceFees));
          this.siteForm.get('salesTax')?.setValue(String(res?.salesTax));
          this.siteForm.get('level2Rate')?.setValue(String(res.level2Rate));
          this.siteForm.get('level2RateUnit')?.setValue(res.level2RateUnit);
          this.siteForm.get('dcFastRate')?.setValue(String(res.dcFastRate));
          this.siteForm.get('dcFastRateUnit')?.setValue(res.dcFastRateUnit);
          this.timePricing = res?.timePricing;
        },
        (err) => {
          console.log(err);
        }
      );
    }
  }

  checkIsOwnSetting() {
    if (this.masterGlobalSettings.priceType == this.siteForm.get('priceType')?.value && 
    this.masterGlobalSettings.networkingFees == this.siteForm.get('networkingFees')?.value && 
    this.masterGlobalSettings.processingFees == this.siteForm.get('processingFees')?.value &&
    this.masterGlobalSettings.cloudServiceFees == this.siteForm.get('cloudServiceFees')?.value &&
    this.masterGlobalSettings.meterServiceFees == this.siteForm.get('meterServiceFees')?.value &&
    this.masterGlobalSettings.salesTax == this.siteForm.get('salesTax')?.value) {
      if (this.siteForm.get('priceType')?.value === '1') {
        if (this.masterGlobalSettings.level2Rate == this.siteForm.get('level2Rate')?.value &&
        this.masterGlobalSettings.level2RateUnit == this.siteForm.get('level2RateUnit')?.value &&
        this.masterGlobalSettings.dcFastRate == this.siteForm.get('dcFastRate')?.value &&
        this.masterGlobalSettings.dcFastRateUnit == this.siteForm.get('dcFastRateUnit')?.value) {
          this.isOwnSetting = true;
        } else {
          this.isOwnSetting = false;
        }
      } else if (this.siteForm.get('priceType')?.value === '2') {
        let flag = false;
        for (let index = 0; index < this.masterGlobalSettings.timePricing.length; index++) {
          if (this.masterGlobalSettings.timePricing.length === this.timePricing.length &&
            this.masterGlobalSettings.timePricing[index].startTime === this.timePricing[index].startTime &&
            this.masterGlobalSettings.timePricing[index].endTime === this.timePricing[index].endTime &&
            this.masterGlobalSettings.timePricing[index].level2Rate == this.timePricing[index].level2Rate &&
            this.masterGlobalSettings.timePricing[index].level2RateUnit == this.timePricing[index].level2RateUnit &&
            this.masterGlobalSettings.timePricing[index].dcFastRate == this.timePricing[index].dcFastRate &&
            this.masterGlobalSettings.timePricing[index].dcFastRateUnit == this.timePricing[index].dcFastRateUnit) {
            flag = true;
          } else {
            this.isOwnSetting = false;
            break;
          }
          if (this.masterGlobalSettings.timePricing.length - 1 === index) {
            this.isOwnSetting = flag;
          }
        }
      }
    } else {
      this.isOwnSetting = false;
    }
  }
}
