import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import Helper from '@app/shared/utility/Helper';
import { GridFilterService } from '@app/shared/utility/grid-filter.service';
import { AppConstants } from 'src/app/constants';
import { RoleType } from '@app/shared/services/roles.enum';
import { HttpDataService } from '@app/shared/services/http-data.service';
import { DataService } from '@app/shared/services/data.service';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDeleteDialogComponent } from '@app/mat-delete-dialog/mat-delete-dialog.component';

@Component({
  selector: 'app-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.css'],
})
export class QueryComponent implements OnInit {

  process = true;
  userControl = new FormControl();
  userStatusControl = new FormControl();
  dataSource = new MatTableDataSource();
  displayedColumns: string[] = [
    'userName',
    'tenantName',
    'siteName',
    'chargePointName',
    'createdon',
    'description',
    'status',
    'action'
  ];
  roleType = RoleType;
  userRole = '';
  isMasterAdmin = false;
  dialogRef: MatDialogRef<any>;
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
  ) {
    const sessionRole = localStorage.getItem('role') || '';
    if (sessionRole) {
      this.userRole = Helper.decodeRole(sessionRole);
      if (this.userRole === this.roleType.MasterAdmin) {
        this.isMasterAdmin = true;
      }
    }
  }

  ngOnInit(): void {
    if (!this.isMasterAdmin) {
      this.displayedColumns.shift();
    }
    window.scrollTo(0, 0);
    this.dataSource.filterPredicate = this.filterService.createFilter();
    this.getQueries();
    this.userControl.valueChanges.subscribe(value => {
      this.filterName = value;
      this.getQueries();
    });
    this.userStatusControl.valueChanges.subscribe(value => {
      this.filterStatus = value;
      this.getQueries();
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageNumber = event.pageIndex;
    this.getQueries();
  }

  getQueries() {
    this.process = true;
    this.dataSource.data = [];
    let URL = '';
    if (this.filterName || this.filterStatus) {
      URL = AppConstants.APIUrlGetAllTickets + '/' + Number(this.pageNumber + 1) + '/' + this.pageSize + '?userName=' + this.filterName + '&status=' + this.filterStatus
    } else {
      URL = AppConstants.APIUrlGetAllTickets + '/' + Number(this.pageNumber + 1) + '/' + this.pageSize
    }
    this.httpDataService
      .get(URL)
      .subscribe((res: any) => {
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

  sendQueryDetails(object: any, action: string) {
    localStorage.setItem('querydetails', JSON.stringify({...object, action: action}));
    this.dataService.changeMessage({...object, action: action});
    this.router.navigate(['/query-details']);
  }

  deleteQuery(id: any) {
    this.dialogRef = this.dialog.open(MatDeleteDialogComponent, {
      width: '450px',
      panelClass: 'confirm-dialog-container',
      data: {
        title: 'Are you sure, you want to delete the query ?',
      },
    });
    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.httpDataService
          .delete(AppConstants.APIUrlDeleteTicket + id)
          .subscribe((res) => {
            this.getQueries();
          });
      }
    });
  }
}
