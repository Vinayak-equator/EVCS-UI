import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppConstants } from 'src/app/constants';
import { HttpDataService } from '@app/shared/services/http-data.service';
import { IndexedDBService } from '@app/shared/utility/indexed-db.service';
import { PopUpService } from '@app/shared/utility/popup.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit {

  settings: any = [];
  authAmount = '';
  accountTeamEmail = '';
  subscription: Subscription;
  updateSetting = false;

  constructor(private httpDataService: HttpDataService, private indexedDBService: IndexedDBService, private popUpService: PopUpService) { }

  ngOnInit(): void {
    this.indexedDBService.getRecordData('PermissionDB', 'permission', 'Settings').then((data: any) => {
      data.previlleges.forEach((pp: any) => {
        if (pp.key === 'View Settings') {
          this.updateSetting = pp.value;
        }
      });
    }).catch(error => {
      console.error(error);
    });
    this.getSettings();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getSettings() {
    this.subscription = this.httpDataService
      .get(
        AppConstants.APIUrlGetSettings
      )
      .subscribe(
        (res: any) => {
          this.settings = res;
          this.authAmount = res[0]?.authAmount;
          this.accountTeamEmail = res[0]?.inProgressEmailId;
        },
        (err) => {
          console.log(err);
        }
      );
  }

  updateSettings() {
    this.subscription = this.httpDataService
      .put(
        AppConstants.APIUrlUpdateSettings + this.settings[0].id, {
          authAmount: this.authAmount,
          inprogressemailid: this.accountTeamEmail
        }
      )
      .subscribe(
        (res: any) => {
          this.popUpService.showMsg(
            'Financial Data Updated.',
            AppConstants.EmptyUrl,
            AppConstants.Success,
            AppConstants.Success
          );
          this.getSettings();
        },
        (err) => {
          this.popUpService.showMsg(
            'Financial Data Error',
            AppConstants.EmptyUrl,
            AppConstants.Error,
            AppConstants.Error
          );
          console.log(err);
        }
      );
  }

}
