import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppConstants } from 'src/app/constants';
import { HttpDataService } from '@app/shared/services/http-data.service';
import Helper from '@app/shared/utility/Helper';
import { IndexedDBService } from '@app/shared/utility/indexed-db.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {

  public email = '';
  public username = '';
  public password = '';
  public loginError = false;
  public inactiveError = false;
  public showForgotPassword = false;
  public showEmailSent = false;
  public showEmailError = false;
  public showProgress = false;

  constructor(
    private httpDataService: HttpDataService,
    private router: Router,
    private indexedDBService: IndexedDBService
  ) {}

  ngOnInit(): void {
    this.indexedDBService.deleteDatabase('PermissionDB');
    const token = localStorage.getItem('accessToken')
      ? localStorage.getItem('accessToken')
      : null;
    if (token !== undefined && token !== null && token) {
      this.router.navigate(['/dashboard']);
    }
    this.indexedDBService.createDatabase('PermissionDB', 1).then(dbdata => {
      this.indexedDBService.createTable('PermissionDB', 2, 'permission', 'feature', null).then(storedata => {
        console.log('IndexedDB initialized!');
      }).catch(error => {
        console.error(error);
      });
    }).catch(error => {
      console.error(error);
    });
  }

  login() {
    this.showProgress = true;
    this.httpDataService
      .post(AppConstants.APIUrlLogin, {
        email: this.username,
        password: this.password,
      })
      .subscribe(
        (res) => {
          localStorage.setItem('accessToken', res.token);
          localStorage.setItem('role', Helper.encodeRole(res.role));
          localStorage.setItem('user', JSON.stringify(res));
          res.rolePermissions.forEach((permission: any) => {
            this.indexedDBService.createRecord('PermissionDB', 'permission', {
              feature: permission.feature,
              previlleges: permission.previlleges
            }).then(data => {
              console.log(permission.feature + ' Permission Created.');
            }).catch(error => {
              console.error(error);
            });
          });
          this.showProgress = false;
          this.router.navigate(['/select-tenant']);
        },
        (err) => {
          this.showProgress = false;
          this.username = '';
          this.password = '';
          if (err?.error?.message === 'User not active') {
            this.inactiveError = true;
            this.loginError = false;
            this.showEmailSent = false;
            this.showEmailError = false;
          } else {
            this.inactiveError = false;
            this.loginError = true;
            this.showEmailSent = false;
            this.showEmailError = false;
          }
          // setTimeout(() => {
          //   this.inactiveError = false;
          //   this.loginError = false;
          // }, 5000);
        }
      );
  }

  forgotPassword() {
    this.httpDataService
      .post(AppConstants.APIUrlForgotPassword, this.email)
      .subscribe(
        (res: any) => {
          this.email = '';
          this.showEmailSent = true;
          this.showEmailError = false;
          this.inactiveError = false;
          this.loginError = false;
          // setTimeout(() => {
          //   this.showEmailSent = false;
          // }, 5000);
        },
        (err) => {
          this.email = '';
          this.showEmailError = true;
          this.showEmailSent = false;
          this.inactiveError = false;
          this.loginError = false;
          // setTimeout(() => {
          //   this.showEmailError = false;
          // }, 5000);
        }
      );
  }

  clearAllMsgs() {
    this.inactiveError = false;
    this.loginError = false;
    this.showEmailSent = false;
    this.showEmailError = false;
  }
}
