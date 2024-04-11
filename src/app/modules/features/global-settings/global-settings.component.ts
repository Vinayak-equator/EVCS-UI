import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppConstants } from 'src/app/constants';
import { HttpDataService } from '@app/shared/services/http-data.service';
import { IndexedDBService } from '@app/shared/utility/indexed-db.service';
import { PopUpService } from '@app/shared/utility/popup.service';

@Component({
  selector: 'app-settings',
  templateUrl: './global-settings.component.html',
  styleUrls: ['./global-settings.component.css'],
})
export class GlobalSettingsComponent implements OnInit {

  settingsId = '';
  cloudServiceFees = '';
  dcFastRate: any;
  dcFastRateUnit: any;
  level2Rate: any;
  level2RateUnit: any;
  meterServiceFees = '';
  networkingFees = '';
  processingFees = '';
  salesTax = '';
  timePricing: any = [];
  // transactionfees = '';
  // utilityFees = '';
  utilityOtherCost = '';
  utilityUniversalEVCost = '';
  priceType = '';
  subscription: Subscription;
  // updateSetting = false;

  constructor(private httpDataService: HttpDataService, private indexedDBService: IndexedDBService, private popUpService: PopUpService) { }

  ngOnInit(): void {
    // this.indexedDBService.getRecordData('PermissionDB', 'permission', 'Settings').then((data: any) => {
    //   data.previlleges.forEach((pp: any) => {
    //     if (pp.key === 'View Settings') {
    //       this.updateSetting = pp.value;
    //     }
    //   });
    // }).catch(error => {
    //   console.error(error);
    // });
    this.getGlobalSettings();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getGlobalSettings() {
    this.subscription = this.httpDataService
      .get(
        AppConstants.APIUrlGetGlobalSettings
      )
      .subscribe(
        (res: any) => {
          this.settingsId = res?.id;
          this.priceType = res?.priceType ? String(res?.priceType) : '';
          this.cloudServiceFees = res?.cloudServiceFees;
          this.dcFastRate = res?.dcFastRate;
          this.dcFastRateUnit = res?.dcFastRateUnit;
          this.level2Rate = res?.level2Rate;
          this.level2RateUnit = res?.level2RateUnit;
          this.meterServiceFees = res?.meterServiceFees;
          this.networkingFees = res?.networkingFees;
          this.processingFees = res?.processingFees;
          this.salesTax = res?.salesTax;
          this.timePricing = res?.timePricing;
          // this.transactionfees = res?.transactionfees;
          // this.utilityFees = res?.utilityFees;
          this.utilityOtherCost = res?.utilityOtherCost;
          this.utilityUniversalEVCost = res?.utilityUniversalEVCost;
        },
        (err) => {
          console.log(err);
        }
      );
  }

  updateSettings() {
    this.pricingChange();
    if (this.settingsId) {
      this.subscription = this.httpDataService
      .put(
        AppConstants.APIUrlUpdateGlobalSettings + this.settingsId, {
          priceType: this.priceType,
          cloudServiceFees: this.cloudServiceFees,
          dcFastRate: this.dcFastRate,
          dcFastRateUnit: this.dcFastRateUnit,
          level2Rate: this.level2Rate,
          level2RateUnit: this.level2RateUnit,
          meterServiceFees: this.meterServiceFees,
          networkingFees: this.networkingFees,
          processingFees: this.processingFees,
          salesTax: this.salesTax,
          timePricing: this.timePricing,
          // transactionfees: this.transactionfees,
          // utilityFees: this.utilityFees,
          utilityOtherCost: this.utilityOtherCost,
          utilityUniversalEVCost: this.utilityUniversalEVCost
        }
      )
      .subscribe(
        (res: any) => {
          this.popUpService.showMsg(
            'Global Settings Data Updated.',
            AppConstants.EmptyUrl,
            AppConstants.Success,
            AppConstants.Success
          );
          this.getGlobalSettings();
        },
        (err) => {
          this.popUpService.showMsg(
            'Global Settings Data Error',
            AppConstants.EmptyUrl,
            AppConstants.Error,
            AppConstants.Error
          );
          console.log(err);
        }
      );
    } else {
      this.subscription = this.httpDataService
      .post(
        AppConstants.APIUrlAddGlobalSettings, {
          priceType: this.priceType,
          cloudServiceFees: this.cloudServiceFees,
          dcFastRate: this.dcFastRate,
          dcFastRateUnit: this.dcFastRateUnit,
          level2Rate: this.level2Rate,
          level2RateUnit: this.level2RateUnit,
          meterServiceFees: this.meterServiceFees,
          networkingFees: this.networkingFees,
          processingFees: this.processingFees,
          salesTax: this.salesTax,
          timePricing: this.timePricing,
          // transactionfees: this.transactionfees,
          // utilityFees: this.utilityFees,
          utilityOtherCost: this.utilityOtherCost,
          utilityUniversalEVCost: this.utilityUniversalEVCost
        }
      )
      .subscribe(
        (res: any) => {
          this.popUpService.showMsg(
            'Global Settings Data Updated.',
            AppConstants.EmptyUrl,
            AppConstants.Success,
            AppConstants.Success
          );
          this.getGlobalSettings();
        },
        (err) => {
          this.popUpService.showMsg(
            'Global Settings Data Error',
            AppConstants.EmptyUrl,
            AppConstants.Error,
            AppConstants.Error
          );
          console.log(err);
        }
      );
    }
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
  }

  pricingChange() {
    if (this.priceType === '1') {
      this.timePricing = [];
    } else if (this.priceType === '2') {
      this.dcFastRate = 0;
      this.dcFastRateUnit = '';
      this.level2Rate = 0;
      this.level2RateUnit = '';
    } 
  }

  removeTime(index: any) {
    if (index > -1) {
      this.timePricing.splice(index, 1);
    }
  }

}
