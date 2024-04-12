import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import {
  UntypedFormControl,
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import Helper from '@app/shared/utility/Helper';
import { GridFilterService } from '@app/shared/utility/grid-filter.service';
import { AppConstants } from 'src/app/constants';
import { Tenant } from '@app/models/tenant.model';
import { Site } from '@app/models/site.model';
import { ChargePoint } from '@app/models/chargepoint.model';
import { HttpDataService } from '@app/shared/services/http-data.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDeleteDialogComponent } from '@app/mat-delete-dialog/mat-delete-dialog.component';
import { DataService } from '../../../shared/services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-promo-code',
  templateUrl: './promo-code.component.html',
  styleUrls: ['./promo-code.component.css'],
})
export class PromoCodeComponent implements OnInit {
  showDeleted = false;
  promoExistErr = false;
  viewRecord = false;
  process = true;
  promocodeId = '';
  promocodeForm: UntypedFormGroup;
  promocodeObj: any = {};
  today = new Date();
  tenantList: any;
  siteList: any;
  pageNumber: number = 0;
  pageSize: number = 10;
  totalCount: number = 0;
  filterPromocode = '';
  chnageicon = 'keyboard_arrow_right';
  promoCodeControl = new UntypedFormControl();
  tenants: Tenant[];
  sites: Site[];
  chargePoints: ChargePoint[];
  dataSource = new MatTableDataSource();
  selectedValue: string = 'Percentage';
  values: string[] = ['Percentage', 'Flat'];
  displayedColumns: string[] = [
    'promoCode',
    'discountPercentage',
    'flatDiscount',
    'validityStartDate',
    'validityEndDate',
    'maxUsage',
    'used',
    'status',
    'action',
  ];
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
  errors: string[];
  dialogRef: MatDialogRef<any>;

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
    this.getPromoCodes();
    this.buildPromoCodeForm();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageNumber = event.pageIndex;
    this.getPromoCodes();
  }

  sendDetails(object: any, action: string) {
    localStorage.setItem(
      'promocodedetails',
      JSON.stringify({ ...object, action: action })
    );
    this.dataService.changeMessage({ ...object, action: action });
    this.router.navigate(['/promo-code-details']);
  }
  togglechnage() {
    this.chnageicon =
      this.chnageicon == 'keyboard_arrow_right'
        ? 'keyboard_arrow_down'
        : 'keyboard_arrow_right';
  }
  radioChange(event: any) {
    if (event.value === 'Percentage') {
      this.promocodeForm.controls['flatdiscount'].setValue(0);
      this.promocodeForm.controls['flatdiscount'].disable();
      this.promocodeForm.controls['discountpercentage'].enable();
    } else if (event.value === 'Flat') {
      this.promocodeForm.controls['discountpercentage'].setValue(0);
      this.promocodeForm.controls['flatdiscount'].enable();
      this.promocodeForm.controls['discountpercentage'].disable();
    }
  }

  buildPromoCodeForm() {
    this.promocodeForm = this.formBuilder.group({
      promoCode: [
        null,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(150),
        ],
      ],
      promocodedesc: [
        null,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(150),
        ],
      ],
      discountpercentage: [null, [Validators.required]],
      flatdiscount: [{ value: 0, disabled: true }, [Validators.required]],
      validitystartdate: [null, [Validators.required]],
      validityenddate: [null, [Validators.required]],
      maxusage: [null, [Validators.required]],
      tenants: [null, [Validators.required]],
      sites: [null, [Validators.required]],
      chargePoints: [null, [Validators.required]],
      status: [false, []],
      radioGroup: [null, []],
    });
    this.errors = [];
    this.promoCodeControl.valueChanges.subscribe((value) => {
      this.filterPromocode = value;
      this.getPromoCodes();
    });
  }

  get promoCode(): boolean {
    return (
      !Helper.isNullOrWhitespace(this.promocodeForm.get('promoCode')?.value) &&
      (this.promocodeForm.get('promoCode')?.value.length <= 3 ||
        this.promocodeForm.get('promoCode')?.value.length > 150)
    );
  }

  get promocodedesc(): boolean {
    return (
      !Helper.isNullOrWhitespace(
        this.promocodeForm.get('promocodedesc')?.value
      ) &&
      (this.promocodeForm.get('promocodedesc')?.value.length <= 3 ||
        this.promocodeForm.get('promocodedesc')?.value.length > 150)
    );
  }

  get discountpercentage(): boolean {
    return !Helper.isNullOrWhitespace(
      this.promocodeForm.get('discountpercentage')?.value
    );
  }

  get flatdiscount(): boolean {
    return !Helper.isNullOrWhitespace(
      this.promocodeForm.get('flatdiscount')?.value
    );
  }

  get validitystartdate(): boolean {
    return !Helper.isNullOrWhitespace(
      this.promocodeForm.get('validitystartdate')?.value
    );
  }

  get validityenddate(): boolean {
    return !Helper.isNullOrWhitespace(
      this.promocodeForm.get('validityenddate')?.value
    );
  }

  get maxusage(): boolean {
    return !Helper.isNullOrWhitespace(
      this.promocodeForm.get('maxusage')?.value
    );
  }

  validatepromocode() {
    this.httpDataService
      .get(
        AppConstants.APIUrlValidatePromocode +
          this.promocodeForm.get('promoCode')?.value?.trim()
      )
      .subscribe(
        (res: any) => {
          this.promoExistErr = false;
        },
        (err) => {
          this.promoExistErr = true;
          this.promocodeForm.controls.promoCode.setErrors({ valid: false });
        }
      );
  }

  getPromoCodes(pageNumber = "") {
    pageNumber ? this.pageNumber = 0 : this.pageNumber;
    this.process = true;
    this.dataSource.data = [];
    let URL = '';
    if (this.filterPromocode) {
      URL = this.showDeleted
        ? AppConstants.APIUrlDeletedPromocodeList +
          Number(this.pageNumber + 1) +
          '/' +
          this.pageSize +
          '?promocodename=' +
          this.filterPromocode
        : AppConstants.APIUrlPromocodeList +
          Number(this.pageNumber + 1) +
          '/' +
          this.pageSize +
          '?promocodename=' +
          this.filterPromocode;
    } else {
      URL = this.showDeleted
        ? AppConstants.APIUrlDeletedPromocodeList +
          Number(this.pageNumber + 1) +
          '/' +
          this.pageSize
        : AppConstants.APIUrlPromocodeList +
          Number(this.pageNumber + 1) +
          '/' +
          this.pageSize;
    }
    this.httpDataService.get(URL).subscribe((res) => {
      let data: any = [];
      if (res && res.list && res.list.length + 1) {
        data = res.list;
      } else {
        data = res;
      }
      data.forEach((element: any) => {
        let startdate = new Date(element.validityStartDate);
        let enddate = new Date(element.validityEndDate);
        if (startdate.getFullYear()) {
          let year = startdate.getFullYear();
          let month = (1 + startdate.getMonth()).toString().padStart(2, '0');
          let day = startdate.getDate().toString().padStart(2, '0');
          element.validityStartDate = month + '/' + day + '/' + year;
        } else {
          element.validityStartDate = '-';
        }
        if (enddate.getFullYear()) {
          let year = enddate.getFullYear();
          let month = (1 + enddate.getMonth()).toString().padStart(2, '0');
          let day = enddate.getDate().toString().padStart(2, '0');
          element.validityEndDate = month + '/' + day + '/' + year;
        } else {
          element.validityEndDate = '-';
        }
      });
      this.dataSource.data = data;
      this.totalCount =
        res && res.list && res.list.length ? res.totalCount : res.length;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.cdref.detectChanges();
      this.process = false;
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

  resetFilters() {
    this.showDeleted = false;
    this.getPromoCodes();
    this.promoCodeControl.setValue('');
  }

  deletePromocode(promoCodeID: any) {
    this.dialogRef = this.dialog.open(MatDeleteDialogComponent, {
      width: '450px',
      panelClass: 'confirm-dialog-container',
      data: {
        title: 'Are you sure, you want to delete the PromoCode ?',
      },
    });
    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.httpDataService
          .put(AppConstants.APIUrlPromocodeDelete + promoCodeID.promoCodeID, {
            isDeleted: true,
          })
          .subscribe((res) => {
            this.getPromoCodes();
          });
      }
    });
  }

  undeletePromocode(promoCodeID: any) {
    this.dialogRef = this.dialog.open(MatDeleteDialogComponent, {
      width: '450px',
      panelClass: 'confirm-dialog-container',
      data: {
        title: 'Are you sure, you want to undelete the promocode ?',
      },
    });
    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.httpDataService
          .put(AppConstants.APIUrlPromocodeDelete + promoCodeID, {
            isDeleted: false,
          })
          .subscribe((res) => {
            this.getPromoCodes();
          });
      }
    });
  }
}
