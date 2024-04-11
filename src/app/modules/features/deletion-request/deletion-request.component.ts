import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { GridFilterService } from '@app/shared/utility/grid-filter.service';
import { AppConstants } from 'src/app/constants';
import { HttpDataService } from '@app/shared/services/http-data.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDeleteDialogComponent } from '@app/mat-delete-dialog/mat-delete-dialog.component';
import { DataService } from '@app/shared/services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-deletion-request',
  templateUrl: './deletion-request.component.html',
  styleUrls: ['./deletion-request.component.css'],
})
export class DeletionRequestComponent implements OnInit {

  process = true;
  dialogRef: MatDialogRef<any>;
  userControl = new FormControl();
  userStatusControl = new FormControl();
  dataSource = new MatTableDataSource();
  displayedColumns: string[] = [
    'userName',
    'tenantName',
    'siteName',
    'chargePointName',
    'createdon',
    'status',
    'action',
  ];
  pageNumber: number = 0;
  pageSize: number = 10;
  totalCount: number = 0;
  @ViewChild(MatPaginator, { static: true })
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
  filterName = '';
  filterStatus = '';

  constructor(
    public filterService: GridFilterService,
    private cdref: ChangeDetectorRef,
    private httpDataService: HttpDataService,
    public dialog: MatDialog,
    public dataService: DataService,
    public router: Router
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.dataSource.filterPredicate = this.filterService.createFilter();
    this.getDeletionRequests();
    this.userControl.valueChanges.subscribe(value => {
      this.pageNumber = 0
      this.filterName = value;
      this.getDeletionRequests();
    });
    this.userStatusControl.valueChanges.subscribe(value => {
      this.pageNumber = 0
      this.filterStatus = value;
      this.getDeletionRequests();
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageNumber = event.pageIndex;
    this.getDeletionRequests();
  }

  getDeletionRequests() {
    this.process = true;
    this.dataSource.data = [];
    let URL = '';
    if (this.filterName || this.filterStatus) {
      URL = AppConstants.APIUrlGetAllDeleteRequests + '/' + Number(this.pageNumber + 1) + '/' + this.pageSize + '?userName=' + this.filterName + '&status=' + this.filterStatus
    } else {
      URL = AppConstants.APIUrlGetAllDeleteRequests + '/' + Number(this.pageNumber + 1) + '/' + this.pageSize
    }
    this.httpDataService
      .get(URL)
      .subscribe((res) => {
        res.list.forEach((element: any) => {
          let createdon = new Date(element.createdon);
          if (createdon.getFullYear()) {
            let year = createdon.getFullYear();
            let month = (1 + createdon.getMonth()).toString().padStart(2, '0');
            let day = createdon.getDate().toString().padStart(2, '0');
            element.createdon = month + '/' + day + '/' + year;
          } else {
            element.createdon = '-';
          }
        });
        this.dataSource.data = res.list;
        this.totalCount = res.totalCount;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.cdref.detectChanges();
        this.process = false;
      });
  }

  resetFilters() {
    this.userControl.setValue('');
    this.userStatusControl.setValue('');
  }

  deleteResource(resource: any) {
    if (resource.chargePointId && resource.chargepointname) {
      this.dialogRef = this.dialog.open(MatDeleteDialogComponent, {
        width: '450px',
        panelClass: 'confirm-dialog-container',
        data: {
          title: 'Are you sure, you want to delete the chargepoint ?',
        },
      });
      this.dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.httpDataService
            .put(
              AppConstants.APIUrlDeleteChargePoint + resource.chargePointId,
              {}
            )
            .subscribe((res) => {
              this.httpDataService
                .put(AppConstants.APIUrlUpdateDeleteRequest, {
                  id: resource.id,
                  status: 'Approve',
                })
                .subscribe((res) => {
                  this.getDeletionRequests();
                });
            });
        }
      });
    } else if (resource.siteId && resource.sitename) {
      this.dialogRef = this.dialog.open(MatDeleteDialogComponent, {
        width: '450px',
        panelClass: 'confirm-dialog-container',
        data: {
          title: 'Are you sure, you want to delete the site ?',
        },
      });
      this.dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.httpDataService
            .put(
              AppConstants.APIUrlDeleteSite +
                resource.tenantId +
                '/' +
                resource.siteId,
              {}
            )
            .subscribe((res) => {
              this.httpDataService
                .put(AppConstants.APIUrlUpdateDeleteRequest, {
                  id: resource.id,
                  status: 'Approve',
                })
                .subscribe((res) => {
                  this.getDeletionRequests();
                });
            });
        }
      });
    } else if (resource.tenantId && resource.tenantname) {
      this.dialogRef = this.dialog.open(MatDeleteDialogComponent, {
        width: '450px',
        panelClass: 'confirm-dialog-container',
        data: {
          title: 'Are you sure, you want to delete the organization ?',
        },
      });
      this.dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.httpDataService
            .put(AppConstants.APIUrlDeleteTenant + resource.tenantId, {})
            .subscribe((res) => {
              this.httpDataService
                .put(AppConstants.APIUrlUpdateDeleteRequest, {
                  id: resource.id,
                  status: 'Approve',
                })
                .subscribe((res) => {
                  this.getDeletionRequests();
                });
            });
        }
      });
    }
  }

  rejectRequest(resource: any) {
    this.dialogRef = this.dialog.open(MatDeleteDialogComponent, {
      width: '450px',
      panelClass: 'confirm-dialog-container',
      data: {
        title: 'Are you sure, you want to reject the delete request ?',
      },
    });
    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.httpDataService
          .put(AppConstants.APIUrlUpdateDeleteRequest, {
            id: resource.id,
            status: 'Rejected',
          })
          .subscribe((res) => {
            this.getDeletionRequests();
          });
      }
    });
  }
}
