import { map } from 'rxjs/operators';
import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Tenant } from '@app/models/tenant.model';
import { Site } from 'src/app/models/site.model';
import { AppConstants } from '@app/constants';
import { HttpDataService } from '@app/shared/services/http-data.service';
import Helper from '@app/shared/utility/Helper';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ChartDataset as ChartDataSets, ChartOptions,Color } from 'chart.js';
//import { Color, Label } from 'ng2-charts';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { environment } from '@env';
import { Router } from '@angular/router';
import { RoleType } from '@app/shared/services/roles.enum';
import { RouterExtService } from '@app/shared/services/routerExt.service';
import { AgmMap } from '@agm/core';
import { MouseEvent, MapsAPILoader } from '@agm/core';
type Label = string;
@Component({
  selector: 'app-analytics',
  templateUrl: './analyticsorg.component.html',
  styleUrls: ['./analyticsorg.component.css'],
})
export class AnalyticsorgComponent implements OnInit {
  // dtOptions: DataTables.Settings = {};
  address = ''; // Replace with the desired address

 

  maplist: any = [];
  public isMasterAdmin = false;
  tenants: Tenant[];
  selectedTenant: any = '';
  displayStyle = 'none';
  

  constructor(
    private httpDataService: HttpDataService,
    private cdref: ChangeDetectorRef,
    private routerExtService: RouterExtService,
    public router: Router,
    private mapsAPILoader: MapsAPILoader
  ) {}

  ngOnInit(): void {
    this.displayStyle = 'block';
    this.getTenantNames();
   
    const sessionRole = localStorage.getItem('role') || '';
  }

  getTenantNames() {
    return this.httpDataService
      .get(AppConstants.APIUrlTenantNameListtUrl)
      .subscribe((res: Tenant[]) => {
        this.tenants = res.sort(this.SortArray);
        if (this.tenants.length) {
          localStorage.setItem(
            'selectedTenantId',
            this.tenants[0].tenantId.toString()
          );
         
          
        }
      });
  }
  closePopupModal() {
    this.displayStyle = 'none';
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
  tenantSelection(tenant: any) {
    console.log("tenant = ",tenant);

    localStorage.setItem(
      'selectedTenantIdforOrg',
      JSON.stringify(tenant)
    );
    localStorage.setItem('tenantName', JSON.stringify(tenant.name));
    localStorage.setItem('selectedTenant', JSON.stringify(tenant.tenantId));
    this.routerExtService.setRouteValue(
      AppConstants.TenantID,
      (tenant.tenantId).toString()
    );

    this.router.navigate(['/dashboard']);
    
  
  }


}
