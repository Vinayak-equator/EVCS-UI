import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import {
  UntypedFormControl,
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import Helper from '@app/shared/utility/Helper';
import { GridFilterService } from '@app/shared/utility/grid-filter.service';
import { map, startWith } from 'rxjs/operators';
import { AppConstants } from 'src/app/constants';
import { HttpDataService } from '@app/shared/services/http-data.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDeleteDialogComponent } from '@app/mat-delete-dialog/mat-delete-dialog.component';
import { DataService } from '../../../shared/services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
  process = false;
  showDeleted = false;
  userForm: UntypedFormGroup;
  filteredByUserName: Observable<string[]>;
  userControl = new UntypedFormControl();
  userNameValues: any[];
  userRoleControl = new UntypedFormControl();
  userRoleValues: any[];
  errors: string[];
  dialogRef: MatDialogRef<any>;
  dataSource = new MatTableDataSource();
  displayedColumns: string[] = ['name', 'email', 'role', 'status', 'action'];
  pageNumber: number = 0;
  pageSize: number = 10;
  totalCount: number = 0;
  chnageicon = 'keyboard_arrow_right';
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
  filterRole = '';

  constructor(
    public filterService: GridFilterService,
    private cdref: ChangeDetectorRef,
    private readonly formBuilder: UntypedFormBuilder,
    private httpDataService: HttpDataService,
    public dialog: MatDialog,
    public dataService: DataService,
    public router: Router
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.dataSource.filterPredicate = this.filterService.createFilter();
    this.getUsers();
    this.buildUserForm();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  sendDetails(object: any, action: string) {
    localStorage.setItem(
      'userdetails',
      JSON.stringify({ ...object, action: action })
    );
    this.dataService.changeMessage({ ...object, action: action });
    this.router.navigate(['/user-details']);
  }
  togglechnage() {
    this.chnageicon =
      this.chnageicon == 'keyboard_arrow_right'
        ? 'keyboard_arrow_down'
        : 'keyboard_arrow_right';
  }
  buildUserForm() {
    this.userForm = this.formBuilder.group({
      name: [null, [Validators.required]],
      email: [null, [Validators.required]],
      role: [null, [Validators.required]],
      status: [false, []],
    });
    this.errors = [];
    this.userControl.valueChanges.subscribe((value) => {
      this.filterName = value;
      this.getUsers();
    });
    this.userRoleControl.valueChanges.subscribe((value) => {
      this.filterRole = value;
      this.getUsers();
    });
  }

  get name(): boolean {
    return !Helper.isNullOrWhitespace(this.userForm.get('name')?.value);
  }

  get email(): boolean {
    return !Helper.isNullOrWhitespace(this.userForm.get('email')?.value);
  }

  get role(): boolean {
    return !Helper.isNullOrWhitespace(this.userForm.get('role')?.value);
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageNumber = event.pageIndex;
    this.getUsers();
  }

  getUsers(showDeleted = '') {
    showDeleted == 'showDeleted' ? this.pageNumber = 0 : this.pageNumber
    this.process = true;
    this.dataSource.data = [];
    let URL = '';
    if (this.filterName || this.filterRole) {
      URL =
        AppConstants.APIUrlGetAllUsers +
        this.showDeleted +
        '/' +
        Number(this.pageNumber + 1) +
        '/' +
        this.pageSize +
        '?name=' +
        this.filterName +
        '&role=' +
        this.filterRole;
    } else {
      URL =
        AppConstants.APIUrlGetAllUsers +
        this.showDeleted +
        '/' +
        Number(this.pageNumber + 1) +
        '/' +
        this.pageSize;
    }
    this.httpDataService.get(URL).subscribe(
      (res: any) => {
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
        this.cdref.detectChanges();
        this.process = false;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  resetFilters() {
    this.showDeleted = false;
    this.userControl.setValue('');
    this.userRoleControl.setValue('');
  }

  deleteUser(id: any) {
    this.dialogRef = this.dialog.open(MatDeleteDialogComponent, {
      width: '450px',
      panelClass: 'confirm-dialog-container',
      data: {
        title: 'Are you sure, you want to delete the user ?',
      },
    });
    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.httpDataService
          .put(AppConstants.APIUrlDeleteUser + id, {})
          .subscribe((res) => {
            this.resetFilters();
            this.getUsers();
          });
      }
    });
  }

  undeleteUser(id: any) {
    this.dialogRef = this.dialog.open(MatDeleteDialogComponent, {
      width: '450px',
      panelClass: 'confirm-dialog-container',
      data: {
        title: 'Are you sure, you want to undelete the user ?',
      },
    });
    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.httpDataService
          .put(AppConstants.APIUrlDeleteUser + id, {})
          .subscribe((res) => {
            this.resetFilters();
            this.getUsers();
          });
      }
    });
  }
}
