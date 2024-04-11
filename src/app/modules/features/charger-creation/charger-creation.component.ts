import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppConstants } from '@app/constants';
import { RouterExtService } from '@app/shared/services/routerExt.service';
import { PopUpService } from '@app/shared/utility/popup.service';
import { Guid } from 'guid-typescript';
import { Observable } from 'rxjs';
import { ChargePoint } from 'src/app/models/chargepoint.model';
import { HttpDataService } from 'src/app/shared/services/http-data.service';
import Helper from 'src/app/shared/utility/Helper';

@Component({
  selector: 'app-charger-creation',
  templateUrl: './charger-creation.component.html',
  styleUrls: ['./charger-creation.component.css']
})
export class ChargerCreationComponent implements OnInit {

  chargerForm: UntypedFormGroup;
  stringJson: any;
  chargePoint: ChargePoint;
  msg: string;
  tenantId: Guid;
  siteId: Guid;
  tenantName: any;
  siteName: any;
  fromRegister = false;
  errors: string[];
  siteAddress: any;
  data = {};
  popUpData: string;

  get name(): boolean {
    return !Helper.isNullOrWhitespace(this.chargerForm.get('name')?.value) && (this.chargerForm.get('name')?.value.length <= 3 || this.chargerForm.get('name')?.value.length > 150);
  }

  get chargePointId(): boolean {
    return !Helper.isNullOrWhitespace(this.chargerForm.get('chargePointId')?.value) && (this.chargerForm.get('chargePointId')?.value.length < 3 || this.chargerForm.get('chargePointId')?.value.length > 20);
  }

  constructor(private readonly formBuilder: UntypedFormBuilder, private readonly httpDataService: HttpDataService,
    private router: Router, private popUpService: PopUpService, private location: Location,
    private routerExtService: RouterExtService) {
    this.chargePoint = new ChargePoint();
  }

  buildSiteForm() {
    this.chargerForm = this.formBuilder.group({
      name: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
      //chargePointId: [null, [Validators.required, Validators.pattern("^$|^[A-Za-z0-9]+"), Validators.minLength(3), Validators.maxLength(20)]],
      chargePointId: [null, [Validators.required, Validators.pattern("^[#.0-9a-zA-Z\s /,-]+$"), Validators.minLength(3), Validators.maxLength(20)]],
      connector: [null, [Validators.required]],
      chargerType: [null, [Validators.required]],
      availabilityStatus: [null, [Validators.required]],
      connectorType1: [null, [Validators.required]],
      connectorType2: [null, []],
    });
  }

  ngOnInit(): void {
    this.buildSiteForm();
    this.tenantName = localStorage.getItem('tenantName');
    this.siteName = localStorage.getItem('siteName');
    // this.siteAddress = JSON.parse(localStorage.getItem('SiteAddress') || '');
    this.siteAddress = localStorage.getItem('SiteAddress') ? JSON.parse(localStorage.getItem('SiteAddress')) : '';
    this.fromRegister = (localStorage.getItem('fromRegister') === 'true') ? true : false;
    this.tenantId = this.routerExtService.getRouteValue(AppConstants.TenantID);
    this.siteId = this.routerExtService.getRouteValue(AppConstants.SiteID);
    // this.activatedRoute.params.subscribe(params => {
    //   this.tenantId = params['tenantId'];
    //   this.siteId = params['siteId'];
    // });
  }
  
  cancel() {
    localStorage.removeItem('fromRegister');
    if (this.fromRegister) {
      this.location.back();
    } else {
      const ids: any = `${this.tenantId}/${this.siteId}`;
      this.routerExtService.setRouteValue(AppConstants.TenantID, this.tenantId.toString());
      this.routerExtService.setRouteValue(AppConstants.SiteID, this.siteId.toString());
      this.router.navigate([AppConstants.SiteEditUrl]);
    }
  }

  saveCharger() {
    this.mapCharger();
    if(this.chargerForm.dirty && this.chargerForm.valid && this.chargerForm.touched){
    this.createCharge(this.chargePoint).subscribe(
      (result: any) => {
        const ids: any = `${this.tenantId}/${this.siteId}`;
        this.routerExtService.setRouteValue(AppConstants.TenantID, this.tenantId.toString());
        this.routerExtService.setRouteValue(AppConstants.SiteID, this.siteId.toString());
        if (this.fromRegister) {
          this.popUpService.showMsg(AppConstants.ChargePointCreatedMsg, '/register-chargepoint', AppConstants.Success, AppConstants.Success);  
        } else {
          this.popUpService.showMsg(AppConstants.ChargePointCreatedMsg, AppConstants.SiteEditUrl, AppConstants.Success, AppConstants.Success);  
        }
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
        else {
          this.popUpData = this.serverErrorMsgResponse(error.error);
          this.popUpService.showMsg(this.popUpData, AppConstants.EmptyUrl, AppConstants.Error, AppConstants.Error);
        }
      }
    );
  }
  else {
    if(this.chargerForm.valid){
      this.popUpService.showMsg(AppConstants.NoChargerChanges, AppConstants.EmptyUrl, AppConstants.Warning, AppConstants.Warning);
    }
  }
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

  mapCharger() {
    if (this.chargerForm.valid) {
      this.chargePoint.chargePointId = this.chargerForm.get('chargePointId')?.value.trim();
      this.chargePoint.tenantId = this.tenantId.toString();
      this.chargePoint.siteId = this.siteId.toString();
      this.chargePoint.name = this.chargerForm.get('name')?.value.trim();
      this.chargePoint.chargerType = this.chargerForm.get('chargerType')?.value;
      this.chargePoint.availabilityStatus = this.chargerForm.get('availabilityStatus')?.value;
      this.chargePoint.numberOfConnectors = this.chargerForm.get('connector')?.value;
      this.chargePoint.connectorType1 = this.chargerForm.get('connectorType1')?.value;
      this.chargePoint.connectorType2 = this.chargerForm.get('connectorType2')?.value;
      this.chargePoint.status = AppConstants.Offline;
      this.chargePoint.address = this.siteAddress.address;
    }
  }

  createCharge(chargePoint: ChargePoint): Observable<ChargePoint> {
    const ids: any = `${this.tenantId}/${this.siteId}`;
    return this.httpDataService.post(AppConstants.APIUrlChargeCreate + ids, chargePoint);
  }

  serverError(validationErrors: any) {
    Object.keys(validationErrors).forEach(prop => {
      const formControl = this.chargerForm.get(prop);
      if (formControl) {
        formControl.setErrors({
          serverError: validationErrors[prop].join(','),
        });
      }
    });
  }
}
