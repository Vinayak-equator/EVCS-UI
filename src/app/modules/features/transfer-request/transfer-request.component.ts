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
import { PopUpService } from '@app/shared/utility/popup.service';

@Component({
  selector: 'app-deletion-request',
  templateUrl: './transfer-request.component.html',
  styleUrls: ['./transfer-request.component.css'],
})
export class TransferRequestComponent implements OnInit {

  process = true;
  dialogRef: MatDialogRef<any>;
  filteredByUser: Observable<string[]>;
  chargePointId = new FormControl();
  userControl = new FormControl();
  userStatusControl = new FormControl();
  dataSource = new MatTableDataSource();
  displayedColumns: string[] = [
    'username',
    'chargepointid',
    'chargertypedetails',
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
  filterchargePointId = '';
  filterName = '';
  filterStatus = '';

  constructor(
    public filterService: GridFilterService,
    private cdref: ChangeDetectorRef,
    private httpDataService: HttpDataService,
    public dialog: MatDialog,
    public dataService: DataService,
    public router: Router,
    private popUpService: PopUpService
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.dataSource.filterPredicate = this.filterService.createFilter();
    this.getTransferRequests();
    this.chargePointId.valueChanges.subscribe(value => {
      this.pageNumber = 0;
      this.filterchargePointId = value;
      this.getTransferRequests();
    });
    this.userControl.valueChanges.subscribe(value => {
      this.pageNumber = 0;
      this.filterName = value;
      this.getTransferRequests();
    });
    this.userStatusControl.valueChanges.subscribe(value => {
      this.pageNumber = 0;
      this.filterStatus = value;
      this.getTransferRequests();
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageNumber = event.pageIndex;
    this.getTransferRequests();
  }

  getTransferRequests() {
    this.process = true;
    this.dataSource.data = [];
    let URL = '';
    if (this.filterchargePointId || this.filterName || this.filterStatus) {
      URL = AppConstants.APIUrlGetAllTransferRequests + '/' + Number(this.pageNumber + 1) + '/' + this.pageSize + '?userName=' + this.filterName + '&status=' + this.filterStatus + '&chargePointId=' +  this.filterchargePointId
    } else {
      URL = AppConstants.APIUrlGetAllTransferRequests + '/' + Number(this.pageNumber + 1) + '/' + this.pageSize
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
    this.chargePointId.setValue('');
    this.userControl.setValue('');
    this.userStatusControl.setValue('');
  }

  approveRequest(resource: any) {
    this.dialogRef = this.dialog.open(MatDeleteDialogComponent, {
      width: '450px',
      panelClass: 'confirm-dialog-container',
      data: {
        title: 'Are you sure, you want to approve the request ?',
      },
    });
    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.httpDataService
          .put(
            AppConstants.APIUrlTransferChargePoint + resource.id,
            {}
          )
          .subscribe((res) => {
            this.popUpService.showMsg(
              'ChargePoint Transferred Successfully.',
              AppConstants.EmptyUrl,
              AppConstants.Success,
              AppConstants.Success
            );
            this.getTransferRequests();
          }, (err) => {
            this.popUpService.showMsg(
              'ChargePoint Transfer Error.',
              AppConstants.EmptyUrl,
              AppConstants.Error,
              AppConstants.Error
            );
          });
      }
    });
  }

  rejectRequest(resource: any) {
    this.dialogRef = this.dialog.open(MatDeleteDialogComponent, {
      width: '450px',
      panelClass: 'confirm-dialog-container',
      data: {
        title: 'Are you sure, you want to reject the transfer request ?',
      },
    });
    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.httpDataService
          .put(
            AppConstants.APIUrlUpdateTransferRequest,
            {
              id: resource.id,
              ChargePointId: resource.chargepointid,
              isRequestRaised: false,
              status: 'Rejected'
            }
          )
          .subscribe((res) => {
            this.popUpService.showMsg(
              'ChargePoint Transferred Rejected.',
              AppConstants.EmptyUrl,
              AppConstants.Success,
              AppConstants.Success
            );
            this.getTransferRequests();
          }, (err) => {
            this.popUpService.showMsg(
              'ChargePoint Rejection Error.',
              AppConstants.EmptyUrl,
              AppConstants.Error,
              AppConstants.Error
            );
          });
      }
    });
  }
}
