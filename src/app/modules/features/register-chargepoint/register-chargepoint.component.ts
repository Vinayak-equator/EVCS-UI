import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatSort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { Tenant } from '@app/models/tenant.model';
import { Site } from 'src/app/models/site.model';
import { HttpDataService } from '@app/shared/services/http-data.service';
import { RouterExtService } from '@app/shared/services/routerExt.service';
import { AppConstants } from '@app/constants';
import { PopUpService } from '@app/shared/utility/popup.service';
import { UntypedFormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import Helper from 'src/app/shared/utility/Helper';
import { GridFilterService } from '@app/shared/utility/grid-filter.service';
import { Router } from '@angular/router';
import { MatDeleteDialogComponent } from '@app/mat-delete-dialog/mat-delete-dialog.component';
import { MatTransferDialogComponent } from '@app/mat-transfer-dialog/mat-transfer-dialog.component';
@Component({
  selector: 'app-register-chargepoint',
  templateUrl: './register-chargepoint.component.html',
  styleUrls: ['./register-chargepoint.component.css'],
})
export class RegisterChargePointComponent implements OnInit {
  tenants: Tenant[];
  sites: Site[];
  selectedTenant: any = '';
  selectedSite: any = '';
  popUpData: string;
  tenantName: string;
  siteName: string;
  deletedRecords = false;
  dialogRef: MatDialogRef<any>;
  chargePointIdControl = new UntypedFormControl();
  filteredByChargePointId: Observable<string[]>;
  chargePointId: any[];
  chargePointIdValues: any[];
  chargeTypeControl = new UntypedFormControl();
  filteredByChargeType: Observable<string[]>;
  chargeTypeValues: any[];
  chargeType: any[];
  statusControl = new UntypedFormControl();
  filteredByStatus: Observable<string[]>;
  statusValues: any[];
  status: any[];
  filterValues: any = {};
  showTransfer = true;
  process = false;
  dataSource = new MatTableDataSource();
  displayedColumns: string[] = [
    'chargePointId',
    'chargerType',
    'availabilityStatus',
    'numberOfConnectors',
    'connectortype1',
    'connectortype2',
    'action',
  ];
  pageNumber: number = 0;
  pageSize: number = 5;
  totalCount: number = 0;
  chnageicon = 'keyboard_arrow_right';
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
  filterChargePointId = '';
  filterChargerType = '';
  filterStatus = '';

  constructor(
    private httpDataService: HttpDataService,
    private popUpService: PopUpService,
    public filterService: GridFilterService,
    private cdref: ChangeDetectorRef,
    private router: Router,
    private routerExtService: RouterExtService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.tenantName = localStorage.getItem('tenantName') || '';
    this.siteName = localStorage.getItem('siteName') || '';    
    this.getTenantNames();
    this.chargePointIdControl.valueChanges.subscribe((value: any) => {
      this.filterChargePointId = value;
      this.getChargePoints();
    });
    this.chargeTypeControl.valueChanges.subscribe((value: any) => {
      this.filterChargerType = value;
      this.getChargePoints();
    });
    this.statusControl.valueChanges.subscribe((value: any) => {
      this.filterStatus = value;
      this.getChargePoints();
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

  getTenantNames() {
    return this.httpDataService
      .get(AppConstants.APIUrlDefaultTenantNameListtUrl)
      .subscribe((res: Tenant[]) => {
        this.tenants = res.sort(this.SortArray);
        if (this.tenantName) {
          this.tenants.forEach((tenant: any) => {
            if (tenant.name === this.tenantName) {
              this.selectedTenant = tenant;
              this.tenantSelection(tenant);
            }
          });
        }
      });
  }
  chargerEdit(chargerData: any) {
    this.routerExtService.setRouteValue(
      AppConstants.TenantID,
      chargerData.tenantId.toString()
    );
    this.routerExtService.setRouteValue(
      AppConstants.SiteID,
      chargerData.siteId.toString()
    );
    this.routerExtService.setRouteValue(
      AppConstants.ChargePointID,
      chargerData.chargePointId.toString()
    );
    this.router.navigate([AppConstants.ChargerEditUrl]);
  }

  togglechnage() {
    this.chnageicon =
      this.chnageicon == 'keyboard_arrow_right'
        ? 'keyboard_arrow_down'
        : 'keyboard_arrow_right';
  }
  tenantSelection(tenant: any) {
    localStorage.setItem('tenantName', tenant.name);
    this.httpDataService
      .get(AppConstants.APIUrlGetSites + tenant.tenantId + '/' + false)
      .subscribe(
        (res) => {
          this.sites = res;
          if (this.siteName) {
            this.sites.forEach((site: any) => {
              if (site.name === this.siteName) {
                this.selectedSite = site;
                this.getChargePoints();
              }
            });
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageNumber = event.pageIndex;
    this.getChargePoints();
  }

  getChargePoints() {
    this.process = true;
    this.dataSource.data = [];
    localStorage.setItem('siteName', this.selectedSite.name);
    let URL = '';
    if (
      this.filterChargePointId ||
      this.filterChargerType ||
      this.filterStatus
    ) {
      URL =
        AppConstants.APIUrlGetTransferingChargePoints +
        this.selectedTenant.tenantId +
        '/' +
        this.selectedSite.siteId +
        '/' +
        this.deletedRecords +
        '/' +
        Number(this.pageNumber + 1) +
        '/' +
        this.pageSize +
        '?chargePointId=' +
        this.filterChargePointId +
        '&chargerType=' +
        this.filterChargerType +
        '&availabilityStatus=' +
        this.filterStatus;
    } else {
      URL =
        AppConstants.APIUrlGetTransferingChargePoints +
        this.selectedTenant.tenantId +
        '/' +
        this.selectedSite.siteId +
        '/' +
        this.deletedRecords +
        '/' +
        Number(this.pageNumber + 1) +
        '/' +
        this.pageSize;
    }
    this.httpDataService.get(URL).subscribe(
      (res) => {
        let data: any = [];
        if (res && res.list && res.list.length + 1) {
          data = res.list;
        } else {
          data = res;
        }
        this.dataSource.data = data;
        this.totalCount =
          res && res.list && res.list.length ? res.totalCount : res.length;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataSource.filterPredicate = this.filterService.createFilter();
        const siteName: string = this.selectedSite.name;
        if (siteName.includes('Inactive')) {
          this.showTransfer = false;
        } else {
          this.showTransfer = true;
        }
        this.cdref.detectChanges();
        this.process = false;
      },
      (error) => {
        this.popUpData = this.serverErrorMsgResponse(error.error);
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

  // Reset table filters
  resetFilters() {
    this.dataSource.data = [];
    this.deletedRecords = false;
    this.getChargePoints();
    this.chargePointIdControl.setValue('');
    this.chargeTypeControl.setValue('');
    this.statusControl.setValue('');
  }

  toggleDeletedRecords() {
    this.dataSource.data = [];
    //  this.deletedRecords = !this.deletedRecords;
    this.getChargePoints();
  }

  chargeEdit(charge: any) {
    // const chargePointById: any = `${this.tenantId}/${this.siteId}/${charge.chargePointId}`;
    // this.routerExtService.setRouteValue(
    //   AppConstants.ChargePointID,
    //   charge.chargePointId.toString()
    // );
    // localStorage.setItem('chargePointId', charge.chargePointId);
    // this.router.navigate([AppConstants.ChargerEditUrl]);
  }

  deleteChargePoint(chargePoint: any) {
    this.dialogRef = this.dialog.open(MatDeleteDialogComponent, {
      width: '450px',
      panelClass: 'confirm-dialog-container',
      data: {
        title:
          'Are you sure, you want to request for deleting the chargepoint ?',
      },
    });
    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.httpDataService
          .post(AppConstants.APIUrlCreateDeleteRequest, {
            tenantId: this.selectedTenant.tenantId,
            tenantName: this.selectedTenant.name,
            siteId: this.selectedSite.siteId,
            siteName: this.selectedSite.name,
            chargePointId: chargePoint.chargePointId,
            chargePointName: chargePoint.name,
          })
          .subscribe((res) => {
            this.getChargePoints();
          });
      }
    });
  }

  unDeleteChargePoint(chargePoint: any) {
    this.dialogRef = this.dialog.open(MatDeleteDialogComponent, {
      width: '600px',
      panelClass: 'confirm-dialog-container',
      data: {
        title:
          'Are you sure, you want to cancel the request for deleting the chargepoint ?',
      },
    });
    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.httpDataService
          .put(AppConstants.APIUrlUpdateDeleteRequest, {
            id: chargePoint.deleteRequestId,
            status: 'Cancel',
          })
          .subscribe((res) => {
            this.getChargePoints();
          });
      }
    });
  }

  navigateCharger() {
    localStorage.setItem('tenantName', this.selectedTenant.name);
    localStorage.setItem('siteName', this.selectedSite.name);
    localStorage.setItem('fromRegister', 'true');
    this.routerExtService.setRouteValue(
      AppConstants.TenantID,
      this.selectedTenant.tenantId.toString()
    );
    this.routerExtService.setRouteValue(
      AppConstants.SiteID,
      this.selectedSite.siteId.toString()
    );
    this.router.navigate([AppConstants.ChargerCreationUrl]);
  }

  transferChargepoint(chargePoint: any) {
    this.dialogRef = this.dialog.open(MatTransferDialogComponent, {
      width: '600px',
      panelClass: 'confirm-dialog-container',
      data: chargePoint,
    });
    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getChargePoints();
      }
    });
  }
}
