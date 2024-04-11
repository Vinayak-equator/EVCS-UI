import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import Helper from '@app/shared/utility/Helper';
import { Observable } from 'rxjs';
import { IndexedDBService } from '@app/shared/utility/indexed-db.service';
import { RoleType } from '@app/shared/services/roles.enum';
import {TooltipPosition, MatTooltipModule} from '@angular/material/tooltip';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css'],
})
export class SidenavComponent implements OnInit, AfterViewInit {

  public toggleClass: string;
  stickyHeader$: Observable<boolean>;
  theme$: Observable<string>;
  lang: string = 'en';
  @Output() sidenavClass = new EventEmitter<string>();
  @ViewChild('sidemenu') public sidenav: MatSidenav;
  public showRole = false;
  public showUser = false;
  public showPromocode = false;
  public showTransaction = false;
  public showDeletionRequest = false;
  public showFinancial = false;
  public showTransfer = false;
  public showChargePoints = false;
  public showRegisterChargePoint = false;
  public ShowChargePointRequest = false;
  public showDRReport = false;
  public showNDRReport = false;
  public showDAReport = false;
  public showFRReport = false;
  public showPDReport = false;
  public showCUReport = false;
  public roleType = RoleType;
  public userRole = '';
  public isMasterAdmin = false;
  public settingsMenuOpened = false;
  public supportMenuOpened = false;
  public reportsMenuOpened = false;

  constructor(
    private indexedDBService: IndexedDBService,
    private router: Router
  ) {
    const sessionRole = localStorage.getItem('role') || '';
    if (sessionRole) {
      this.userRole = Helper.decodeRole(sessionRole);
      if (this.userRole === this.roleType.MasterAdmin) {
        this.isMasterAdmin = true;
      }
    }
    this.indexedDBService
      .getAllRecords('PermissionDB', 'permission')
      .then((data: any) => {
        data.forEach((pf: any) => {
          if (pf.feature === 'Charger Management') {
            pf.previlleges.forEach((pp: any) => {
              if (pp.key === 'Show ChargePoints') {
                this.showChargePoints = pp.value;
              }
              if (pp.key === 'Register ChargePoint') {
                this.showRegisterChargePoint = pp.value;
              }
              if (pp.key === 'View ChargePoint Request') {
                this.ShowChargePointRequest = pp.value;
              }
            });
          }
          if (pf.feature === 'Site Management') {
            pf.previlleges.forEach((pp: any) => {
              if (pp.key === 'Transfer Site') {
                this.showTransfer = pp.value;
              }
            });
          }
          if (pf.feature === 'Role Management') {
            pf.previlleges.forEach((pp: any) => {
              if (pp.key === 'View Role') {
                this.showRole = pp.value;
              }
            });
          }
          if (pf.feature === 'User Management') {
            pf.previlleges.forEach((pp: any) => {
              if (pp.key === 'View User') {
                this.showUser = pp.value;
              }
            });
          }
          if (pf.feature === 'Promocode Management') {
            pf.previlleges.forEach((pp: any) => {
              if (pp.key === 'View Promocode') {
                this.showPromocode = pp.value;
              }
            });
          }
          if (pf.feature === 'Transaction Management') {
            pf.previlleges.forEach((pp: any) => {
              if (pp.key === 'View Transaction Details') {
                this.showTransaction = pp.value;
              }
            });
          }
          if (pf.feature === 'Asset Management') {
            pf.previlleges.forEach((pp: any) => {
              if (pp.key === 'View Deletion Requests') {
                this.showDeletionRequest = pp.value;
              }
            });
          }
          if (pf.feature === 'Settings') {
            pf.previlleges.forEach((pp: any) => {
              if (pp.key === 'View Settings') {
                this.showFinancial = pp.value;
              }
            });
          }
          if (pf.feature === 'Reports') {
            pf.previlleges.forEach((pp: any) => {
              if (pp.key === 'Driver Registration') {
                this.showDRReport = pp.value;
              }
              if (pp.key === 'Non Driver Registration') {
                this.showNDRReport = pp.value;
              }
              if (pp.key === 'Driver Activity') {
                this.showDAReport = pp.value;
              }
              if (pp.key === 'Financial Revenue') {
                this.showFRReport = pp.value;
              }
              if (pp.key === 'Promocode Details') {
                this.showPDReport = pp.value;
              }
              if (pp.key === 'ChargePoint Uptime') {
                this.showCUReport = pp.value;
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  ngOnInit(): void {
    
    if (
      this.router.url.includes('driver-registration-report') ||
      this.router.url.includes('non-registered-driver-report') ||
      this.router.url.includes('driver-activity-report') ||
      this.router.url.includes('financial-revenue-report') ||
      this.router.url.includes('promocode-details-report') ||
      this.router.url.includes('chargepoint-uptime-report')
    ) {
      this.reportsMenuOpened = true;
    } else if (
      this.router.url.includes('query') ||
      this.router.url.includes('deletion-requests') ||
      this.router.url.includes('transfer-requests')
    ) {
      this.supportMenuOpened = true;
    } else if (
      this.router.url.includes('financial') ||
      this.router.url.includes('users') ||
      this.router.url.includes('roles')
    ) {
      this.settingsMenuOpened = true;
    } 
    mobileQuery: MediaQueryList;
  }
  ngAfterViewInit() {}

  toggle() {
    if (Helper.isNullOrEmpty(this.toggleClass)) {
      this.toggleClass = 'toggle';
      this.sidenavClass.emit(this.toggleClass);
    } else {
      this.toggleClass = '';
      this.sidenavClass.emit(this.toggleClass);
    }
  }
}
