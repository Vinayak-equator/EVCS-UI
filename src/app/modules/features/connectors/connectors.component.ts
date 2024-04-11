import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import Helper from '@app/shared/utility/Helper';
import { GridFilterService } from '@app/shared/utility/grid-filter.service';
import { map, startWith } from 'rxjs/operators';
import { AppConstants } from 'src/app/constants';
import { HttpDataService } from '@app/shared/services/http-data.service';
import { DataService } from '@app/shared/services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterExtService } from '@app/shared/services/routerExt.service';

@Component({
  selector: 'app-connectors',
  templateUrl: './connectors.component.html',
  styleUrls: ['./connectors.component.css'],
})
export class ConnectorsComponent implements OnInit {
  status: string;
  process = false;
  tenantId: string;
  filteredByUser: Observable<string[]>;
  userControl = new FormControl();
  userValues: any[];
  filterSelectObj = [
    {
      name: 'userName',
      columnProp: 'userName',
      type: 'text',
      options: [] as string[],
      modelValue: '',
    },
  ];
  filterValues: any = {};
  filteredByUserStatus: Observable<string[]>;
  userStatusControl = new FormControl();
  userStatusValues: any[];
  filterstatusSelectObj = [
    {
      name: 'status',
      columnProp: 'status',
      type: 'text',
      options: [] as string[],
      modelValue: '',
    },
  ];
  filterStatusValues: any = {};
  dataSource = new MatTableDataSource();
  displayedColumns: string[] = [
    'idx',
    'customerId',
    // 'name',
    'chargePointId',
    'location',
    'chargerType',
    'status'  
  ];
  unavailableDisplayedColumns: string[] = [
    'idx',
    'customerId',
    // 'name',
    'chargePointId',
    'location',
    'status',
    'chargerType',
    'numberOfConnectors',
    'connectorStatus1',
    'connectorStatus2'  
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

  private _filter(value: string, input: string[]): string[] {
    const filterValue = value.toString().toLowerCase();
    return input?.filter(
      (v) => v?.toString().toLowerCase().indexOf(filterValue) === 0
    );
  }

  constructor(
    public filterService: GridFilterService,
    private cdref: ChangeDetectorRef,
    private httpDataService: HttpDataService,
    public dataService: DataService,
    public router: Router,
    private route: ActivatedRoute,
    private routerExtService: RouterExtService
  ) {}

  ngOnInit(): void {
    this.status = this.route.snapshot.paramMap.get('status') || '';
    if (this.status === 'AllChargers'){      
      document.getElementById("connectorsDetails").innerHTML = "All Chargers Details";
    }
    this.tenantId = JSON.parse(localStorage.getItem('selectedTenantId') || '');
    window.scrollTo(0, 0);
    this.dataSource.filterPredicate = this.filterService.createFilter();
    this.getConnectorDetails();
  }
  back() {
    this.router.navigate(['/dashboard']);
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getConnectorDetails() {
    this.process = true;
    if (this.status === 'Unavailable') {
      this.httpDataService
        .get(
          AppConstants.APIUrlOfflineConnectorDetails +
            '?status=Not Available' +
            '&tenantId=' +
            this.tenantId
        )
        .subscribe((res) => {
          res.forEach((element: any, index: number) => {
            element.idx = index + 1;
            element.location = (element.street || element.city || element.zipCode || element.state ||  element.country) ? element.street+ ',' + element?.city+ ' - ' +element?.zipCode+', '+element?.state+ ', '+element?.country : '-';
          });
          this.dataSource.data = res;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.process = false;
          this.cdref.detectChanges();
        });
    } else if (this.status === 'All') {
      this.httpDataService
        .get(AppConstants.APIUrlConnectorDetails + '?tenantId=' + this.tenantId + '&status=AllChargepoints')
        .subscribe((res) => {
          res.forEach((element: any, index: number) => {
            element.idx = index + 1;
            element.location = (element.street || element.city || element.zipCode || element.state ||  element.country) ? element.street+ ',' + element?.city+ ' - ' +element?.zipCode+', '+element?.state+ ', '+element?.country : '-';
          });
          this.dataSource.data = res;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.process = false;
          this.cdref.detectChanges();
        });
    } else {
      this.httpDataService
        .get(
          AppConstants.APIUrlConnectorDetails +
            '?status=' +
            this.status +
            '&tenantId=' +
            this.tenantId
        )
        .subscribe((res) => {
          res.forEach((element: any, index: number) => {
            element.idx = index + 1;
            element.location = (element.street || element.city || element.zipCode || element.state ||  element.country) ? element.street+ ',' + element?.city+ ' - ' +element?.zipCode+', '+element?.state+ ', '+element?.country : '-';
          });
          this.dataSource.data = res;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.process = false;
          // this.getUserAutoComplete();
          // this.getUserStatusAutoComplete();
          this.cdref.detectChanges();
        });
    }
  }

  filterChange(filter: any, event: any) {
    if (event.option != undefined) {
      this.filterValues[filter?.columnProp] = event.option.value
        .toString()
        .trim()
        .toLowerCase();
    } else {
      if (!Helper.isNullOrEmpty(this.userControl.value))
        this.filterValues[filter?.columnProp] = this.userControl.value
          .toString()
          .trim()
          .toLowerCase();
    }
    this.dataSource.filter = JSON.stringify(this.filterValues);
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  statusFilterChange(filter: any, event: any) {
    if (event.option != undefined) {
      this.filterStatusValues[filter?.columnProp] = event.option.value
        .toString()
        .trim()
        .toLowerCase();
      console.log(this.filterStatusValues);
    } else {
      if (!Helper.isNullOrEmpty(this.userStatusControl.value))
        this.filterStatusValues[filter?.columnProp] =
          this.userStatusControl.value.toString().trim().toLowerCase();
    }
    this.dataSource.filter = JSON.stringify(this.filterStatusValues);
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getUserAutoComplete() {
    this.userValues = this.filterService.getFilterObject(
      this.dataSource.data,
      'userName'
    );
    this.filteredByUser = this.userControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value, this.userValues))
    );
  }

  getUserStatusAutoComplete() {
    this.userStatusValues = this.filterService.getFilterObject(
      this.dataSource.data,
      'status'
    );
    this.filteredByUserStatus = this.userStatusControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value, this.userStatusValues))
    );
  }

  resetFilters() {
    this.userControl.setValue('');
    this.userStatusControl.setValue('');
    this.filterValues = {};
    this.filterStatusValues = {};
    this.filterSelectObj.forEach((value: any, key: any) => {
      value.modelValue = undefined;
    });
    this.filterstatusSelectObj.forEach((value: any, key: any) => {
      value.modelValue = undefined;
    });
    this.dataSource.filter = '';
  }

  goToCharger(chargerData: any) {
    localStorage.setItem('siteName', chargerData.name);
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

  downloadReport(){
    console.log(this.dataSource.data);
    if(this.dataSource.data.length > 0)
    {
      let csvData ="";
    if(this.status != 'Offline')
    {
      csvData = this.ConvertToCSV(this.dataSource.data, [
        'chargePointId',
        'location',
        'status',
        'chargerType',
        'numberOfConnectors',
        'connetorStatus1',
        'connetorStatus2',
        'customerId']);
    }
    else if(this.status == 'Offline'){
      csvData = this.ConvertToCSV(this.dataSource.data, [
    'chargePointId',
    'location',
    'chargerType',
    'status',
    'customerId']);
    }
    let blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
    let dwldLink = document.createElement("a");
    let url = URL.createObjectURL(blob);
    let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
    if (isSafariBrowser) {
        dwldLink.setAttribute("target", "_blank");
    }
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", "Connector-List.csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
    }
  }

  ConvertToCSV(objArray: any, headerList: any) {  
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let row = 'Sr. No.,';
    if(this.status != 'Offline')
    {
      let newHeaders = ['ChargePoint Id', 'Location', 'Status', 'chargerType', 'Number Of Connectors', 'Connector Status1', 'Connector Status2', 'Customer Id'];
      for (let index in newHeaders) {
        row += newHeaders[index] + ',';
      }
      row = row.slice(0, -1);
      str += row + '\r\n';
      var newArr =[];
      for (let i = 0; i < array.length; i++) {
        let line = (i + 1) + '';
        if(array[i].connectors[0] != null)
        {
          array[i].connetorStatus1 = array[i].connectors[0].status;
        }
        if(array[i].connectors[1]!=null)
        {
          array[i].connetorStatus2 = array[i].connectors[1].status;
        }
        console.log(array[i]);
        for (let index in headerList) {
          let head = headerList[index];
          console.log(array[i][head]);
          line += ',' + this.strRep(array[i][head]);
        }
       
        // for (let index in headerList) {
        //   let head = headerList[index];
        //   //line += ',' + this.strRep(array[i][head]);
        // }
        str += line + '\r\n';
      }
    }
    if(this.status == 'Offline')
    {
      let newHeaders = ['ChargePoint Id', 'Location', 'Charger Type','Status', 'Customer Id'];
      for (let index in newHeaders) {
        row += newHeaders[index] + ',';
      }
      row = row.slice(0, -1);
      str += row + '\r\n';
      var newArr =[];
      for (let i = 0; i < array.length; i++) {
        let line = (i + 1) + '';
        for (let index in headerList) {
          let head = headerList[index];
          console.log(array[i][head]);
          line += ',' + this.strRep(array[i][head]);
        }
       
        // for (let index in headerList) {
        //   let head = headerList[index];
        //   //line += ',' + this.strRep(array[i][head]);
        // }
        str += line + '\r\n';
      }
    }
    
    return str;
  }

  strRep(data: any) {
    if (typeof data == 'undefined') {
      return '';
    }
    else if(typeof data == 'string') {
      let newData = data.replace(/,/g, " ");
       return newData;
    }
    else if(typeof data == 'object') {
      return "-";
    }
    else if(typeof data == 'number') {
      return  data.toString();
    }
    else {
      return data;
    }
  }

}
