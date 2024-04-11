import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, of, throwError } from 'rxjs';
import { AppConstants, TenantConstants } from 'src/app/constants';
import { Tenant } from 'src/app/models/tenant.model';
import { DialogService } from 'src/app/shared/services/dialog.service';
import { HttpDataService } from 'src/app/shared/services/http-data.service';
import Helper from 'src/app/shared/utility/Helper';
import * as Country from 'src/app/shared/country.json';
import { PopUpService } from '@app/shared/utility/popup.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatMerchantDialogComponent } from '@app/mat-merchant-dialog/mat-merchant-dialog.component';

@Component({
  selector: 'app-tenant-creation',
  templateUrl: './tenant-creation.component.html',
  styleUrls: ['./tenant-creation.component.css']
})
export class TenantCreationComponent implements OnInit {
  tenantForm: FormGroup;
  tenant: Tenant;
  stringJson: any;
  msg: string;
  errors: string[];
  dialogRef: MatDialogRef<any>;
  popUpData: string;
  // countryList : any  = (Country  as  any).default;
  countryList = [
    {
      "country": "Canada"
    },
    {
      "country": "Mexico"
    },
    {
      "country": "United States"
    },
  ];
  data = {};
  public tenantConstants = TenantConstants;

  get name(): boolean {
    return !Helper.isNullOrWhitespace(this.tenantForm.get('name')?.value) && (this.tenantForm.get('name')?.value.length <= 3 || this.tenantForm.get('name')?.value.length > 150);
  }

  get email(): boolean {
    return !Helper.isNullOrWhitespace(this.tenantForm.get('email')?.value) && this.tenantForm.get('email')?.errors?.email;
  }

  get companyName(): boolean {
    return !Helper.isNullOrWhitespace(this.tenantForm.get('company')?.value) && (this.tenantForm.get('company')?.value.length <= 3 || this.tenantForm.get('company')?.value.length > 150);
  }

  get phone(): boolean {
    return !Helper.isNullOrWhitespace(this.tenantForm.get('phone')?.value) && (this.tenantForm.get('phone')?.value.length <= 10 || this.tenantForm.get('phone')?.value.length > 15);
  }

  get city(): boolean {
    return !Helper.isNullOrWhitespace(this.tenantForm.get('city')?.value) && (this.tenantForm.get('city')?.value.length <= 2 || this.tenantForm.get('city')?.value.length > 100);
  }

  get state(): boolean {
    return !Helper.isNullOrWhitespace(this.tenantForm.get('state')?.value) && (this.tenantForm.get('state')?.value.length <= 2 || this.tenantForm.get('state')?.value.length > 100);
  }

  get country(): boolean {
    return !Helper.isNullOrWhitespace(this.tenantForm.get('country')?.value) && (this.tenantForm.get('country')?.value.length <= 3 || this.tenantForm.get('country')?.value.length > 100);
  }

  get street(): boolean {
    return !Helper.isNullOrWhitespace(this.tenantForm.get('street')?.value) && (this.tenantForm.get('street')?.value.length <= 1 || this.tenantForm.get('street')?.value.length > 250);
  }

  get zip(): boolean {
    return !Helper.isNullOrWhitespace(this.tenantForm.get('zipCode')?.value) && (this.tenantForm.get('zipCode')?.value.length <= 5 || this.tenantForm.get('zipCode')?.value.length > 11);
  }

  get address(): boolean {
    return !Helper.isNullOrWhitespace(this.tenantForm.get('street')?.value) && (this.tenantForm.get('street')?.value.length <= 15 || this.tenantForm.get('street')?.value.length > 250);
  }

  constructor(private readonly formBuilder: FormBuilder, private readonly httpDataService: HttpDataService, public dialog: MatDialog,
    private toastr: ToastrService, private dialogService: DialogService, private router: Router, private popUpService: PopUpService) {
    this.tenant = new Tenant();
  }

  buildTenantForm() {
    this.tenantForm = this.formBuilder.group({  // ^[#.0-9a-zA-Z\s,-]+$ Helper.specialCharactersValidator
      //name: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150), Validators.pattern(AppConstants.fullNamePattern) ]],
      name: [null ],
      street: [null, [Validators.required]],
      company: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150), Validators.pattern(AppConstants.addressPattern)]],
      //company: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150), Validators.pattern(AppConstants.fullNamePattern)]],
      email: [null, [Validators.email, Validators.required, this.validateEmailId]],
      phone: [null, [Validators.required, Validators.pattern(AppConstants.numberPattern), Validators.minLength(10), Validators.maxLength(15)]],
      state: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(AppConstants.addressPattern)]],
      city: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(AppConstants.addressPattern)]],
      //state: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(AppConstants.stringPattern)]],
      //city: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(AppConstants.stringPattern)]],
      country: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      zipCode: [null, [Validators.required, Validators.pattern(AppConstants.numberPattern), Validators.minLength(5), Validators.maxLength(6)]]
    });
    this.errors = [];
    this.tenant.isOwnMerchantKey = false;
    this.tenant.keyName = '';
    this.tenant.apiLoginID = '';
    this.tenant.apiTransactionKey = '';
  }

  validateEmailId(control: AbstractControl): {[key: string]: any} | null  {
    if (control.value && Helper.isValidEmail(control.value) == false) {
      return { 'invalidEmailAddress': true };
    }
    return null;
  }

  ngOnInit(): void {
    this.buildTenantForm();
  }
  
  onKeyPress(event: any) {
    const regexpNumber = /[0-9\+\-\ ]/;
    let inputCharacter = String.fromCharCode(event.charCode);
    if (event.keyCode != 8 && !regexpNumber.test(inputCharacter)) {
      event.preventDefault();
    }
  }
  
  cancel() {
    this.router.navigate([AppConstants.NavigateDashboard]);
  }
  mapTenant() {
    this.tenant.name = this.tenantForm.get('name')?.value?.trim();
    this.tenant.company = this.tenantForm.get('company')?.value?.trim();
    this.tenant.street = this.tenantForm.get('street')?.value?.trim();
    this.tenant.email = this.tenantForm.get('email')?.value?.trim();
    this.tenant.phone = this.tenantForm.get('phone')?.value?.trim();
    this.tenant.country = this.tenantForm.get('country')?.value?.trim();
    this.tenant.state = this.tenantForm.get('state')?.value?.trim();
    this.tenant.city = this.tenantForm.get('city')?.value?.trim();
    this.tenant.zipCode = this.tenantForm.get('zipCode')?.value?.trim();
    this.tenant.type = 'Consumer';
  }
  saveTenant() {
    this.mapTenant();
    if(this.tenantForm.dirty && this.tenantForm.valid && this.tenantForm.touched){
    this.createTenant(this.tenant).subscribe(
      (result:any) => {
        this.tenantForm.markAsUntouched();        
        this.popUpService.showMsg(AppConstants.TenantCreated, AppConstants.NavigateDashboard, AppConstants.Success, AppConstants.Success);
      },
      (error) => {
        if (!Helper.isNullOrWhitespace(error)) {
          if (!Helper.isNullOrWhitespace(error.error.errors)) {
            const validationErrors = error.error.errors;
            this.serverError(validationErrors);
          }
          else {
            this.popUpData = this.serverErrorMsgResponse(error.error);
            this.popUpService.showMsg(this.popUpData, AppConstants.EmptyUrl, AppConstants.Error, AppConstants.Error);
          }
        }
      });
    }
    else {
      if(this.tenantForm.valid){
        this.popUpService.showMsg(AppConstants.NoTenantChanges, AppConstants.EmptyUrl, AppConstants.Warning, AppConstants.Warning);
      }
    }
  }

  createTenant(tenant: Tenant): Observable<Tenant> {
    return this.httpDataService.post(AppConstants.APIUrlTenantCreate, tenant);
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

  serverError(validationErrors: any) {
    Object.keys(validationErrors).forEach(prop =>{
      const formControl = this.tenantForm.get(prop);
      if(formControl){
        formControl.setErrors({                
          serverError:validationErrors[prop].join(','),
        })
      }
    });
  }

  openMerchantPopup() {
    this.dialogRef = this.dialog.open(MatMerchantDialogComponent, {
      width: '600px',
      panelClass: 'confirm-dialog-container',
      data: {
        isOwnMerchantKey: this.tenant.isOwnMerchantKey,
        keyName: this.tenant.keyName,
        apiLoginID: this.tenant.apiLoginID,
        apiTransactionKey: this.tenant.apiTransactionKey
      },
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
}
