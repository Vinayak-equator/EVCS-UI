import { AppConstants } from 'src/app/constants';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Tenant } from 'src/app/models/tenant.model';
import { HttpDataService } from 'src/app/shared/services/http-data.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TranslateConfigService } from '@app/shared/services/translate-config.service';
import { GridFilterService } from '@app/shared/utility/grid-filter.service';
import { FormControl } from '@angular/forms';
import { RouterExtService } from '@app/shared/services/routerExt.service';
import { IndexedDBService } from '@app/shared/utility/indexed-db.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDeleteDialogComponent } from '@app/mat-delete-dialog/mat-delete-dialog.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  tenant: Tenant[];
  createTenant = false;
  canDeleteTenant = false;
  deletedRecords = false;
  chnageicon = 'keyboard_arrow_right';
  showdiv = '';
  process = true;
  dialogRef: MatDialogRef<any>;
  filterName = '';
  filterLocation = '';

  constructor(
    private httpDataService: HttpDataService,
    private router: Router,
    public filterService: GridFilterService,
    private translate: TranslateService,
    public translateConfigService: TranslateConfigService,
    public routerExtService: RouterExtService,
    public dialog: MatDialog,
    private indexedDBService: IndexedDBService
  ) {
    // this.tenant = new Tenant();
  }
  dataSource = new MatTableDataSource();
  displayedColumns: string[] = [
    'name',
    'location',
    'sitescount',
    'chargepointscount',
    'status',
  ];
  pageNumber: number = 0;
  pageSize: number = 10;
  totalCount: number = 0;
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
  data: Tenant[] = [];
  options: any[] = [];
  nameControl = new FormControl();
  locationControl = new FormControl();

  ngOnInit(): void {
    localStorage.removeItem('parentTenantRequest');
    localStorage.removeItem('parentSiteRequest');
    this.indexedDBService
      .getRecordData('PermissionDB', 'permission', 'Tenant Management')
      .then((data: any) => {
        data.previlleges.forEach((pp: any) => {
          if (pp.key === 'Register Tenant') {
            this.createTenant = pp.value;
          }
          if (pp.key === 'Delete Tenant') {
            this.canDeleteTenant = pp.value;
          }
        });
      })
      .catch((error) => {
        console.error(error);
      });
    localStorage.removeItem('sitetransferred');
    this.translateConfigService.localEvent.subscribe((data) => {
      this.translator();
    });

    this.getTenants();

    // Overrride default filter behaviour of Material Datatable
    this.dataSource.filterPredicate = this.filterService.createFilter();
    
    // if(this.nameControl.value.length > 3 || this.nameControl.value.length < 0)
    // {
    //   this.filterName = this.nameControl.value;
    //   this.getTenants();
    // }
    this.nameControl.valueChanges.subscribe((value) => {
      debugger;
      this.filterName = value;
      if(value.length > 3)
      {
        this.getTenants();
      }
    });
    this.locationControl.valueChanges.subscribe((value) => {
      this.filterLocation = value;
      if(value.length > 3)
      {
        this.getTenants();
      }
    });
  }

  translator() {
    this.translate.get('singleBinding.itemPage').subscribe((data) => {
      this.paginator._intl.itemsPerPageLabel = data;
      this.paginator._intl.changes.next();
      // this.paginator.ngOnInit();
      // console.log(data);
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  toggleDeletedRecords() {
    // this.deletedRecords = !this.deletedRecords;
    this.getTenants();
  }
  togglechnage() {
    this.chnageicon =
      this.chnageicon == 'keyboard_arrow_right'
        ? 'keyboard_arrow_down'
        : 'keyboard_arrow_right';
  }

  showhidediv() {
    let showdiv = document.getElementById('ShowFilter');
    if (showdiv != null) {
      console.log('show = ', showdiv.style.display);
      if (showdiv.style.display === 'none') {
        showdiv.style.display = 'block';
      } else {
        showdiv.style.display = 'none';
      }
    }
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageNumber = event.pageIndex;
    this.getTenants();
  }

  getTenants() {
    this.process = true;
    this.dataSource.data = [];
    let URL = '';
    if (this.filterName || this.filterLocation) {
      URL =
        AppConstants.APIUrlDashboardTenantList +
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
      URL =
        AppConstants.APIUrlDashboardTenantList +
        this.deletedRecords +
        '/' +
        Number(this.pageNumber + 1) +
        '/' +
        this.pageSize;
    }
    return this.httpDataService.get(URL).subscribe((res) => {
      let data: any = [];
      if (res && res.list && res.list.length + 1) {
        data = res.list;
      } else {
        data = res;
      }
      data.forEach((currentObj: any, currentObjIndex: any) => {
        currentObj.location =
          currentObj.city +
          ', ' +
          currentObj.state +
          ', ' +
          currentObj.country;
      });
      this.dataSource.data = data;
      this.tenant = data;
      this.totalCount =
        res && res.list && res.list.length ? res.totalCount : res.length;
      this.process = false;
    });
  }

  // Reset table filters
  resetFilters() {
    this.deletedRecords = false;
    this.getTenants();
    this.nameControl.setValue('');
    this.locationControl.setValue('');
  }

  edit(tenant: any) {
    localStorage.setItem('parentTenantRequest', tenant.isRequestRaised);
    localStorage.setItem('tenantName', tenant.name);
    localStorage.setItem('tenantId', tenant.tenantId);
    this.routerExtService.clearRouteValue();
    this.routerExtService.setRouteValue(
      AppConstants.TenantID,
      tenant.tenantId.toString()
    );
    this.router.navigate([AppConstants.TenantDetailPage]);
  }

  navigateTenant() {
    this.router.navigate([AppConstants.TenantCreationPage]);
  }

  deleteTenant(tenant: any) {
    this.dialogRef = this.dialog.open(MatDeleteDialogComponent, {
      width: '450px',
      panelClass: 'confirm-dialog-container',
      data: {
        title: 'Are you sure, you want to request for deleting the tenant ?',
      },
    });
    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.httpDataService
          .post(AppConstants.APIUrlCreateDeleteRequest, {
            tenantId: tenant.tenantId,
            tenantName: tenant.name,
          })
          .subscribe((res) => {
            this.getTenants();
          });
      }
    });
  }

  unDeleteTenant(tenant: any) {
    this.dialogRef = this.dialog.open(MatDeleteDialogComponent, {
      width: '600px',
      panelClass: 'confirm-dialog-container',
      data: {
        title:
          'Are you sure, you want to cancel the request for deleting the tenant ?',
      },
    });
    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.httpDataService
          .put(AppConstants.APIUrlUpdateDeleteRequest, {
            id: tenant.deleteRequestId,
            status: 'Cancel',
          })
          .subscribe((res) => {
            this.getTenants();
          });
      }
    });
  }
}
