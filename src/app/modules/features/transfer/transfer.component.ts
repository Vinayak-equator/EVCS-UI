import { Component, OnInit } from '@angular/core';
import { Tenant } from '@app/models/tenant.model';
import { Site } from 'src/app/models/site.model';
import { HttpDataService } from '@app/shared/services/http-data.service';
import { AppConstants } from '@app/constants';
import { PopUpService } from '@app/shared/utility/popup.service';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.css'],
})
export class TransferComponent implements OnInit {

  tenants: Tenant[];
  tenantsTo: Tenant[];
  sites: Site[];
  selectedFromTenant: any = '';
  selectedFromTenantSelect: any = '';
  selectedToTenant: any = '';
  selectedSite: any = '';

  constructor(
    private httpDataService: HttpDataService,
    private popUpService: PopUpService
  ) {}

  ngOnInit(): void {
    this.getTenantNames();
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
      .get(AppConstants.APIUrlTenantNameListtUrl)
      .subscribe((res: Tenant[]) => {
        this.tenants = res.sort(this.SortArray);
        var selecttenat = JSON.parse(localStorage.getItem('selectedTenantIdforOrg'))|| '';
            if(selecttenat !=''){
              // setTimeout(() => {
                this.selectedFromTenant = selecttenat;
                // document.getElementById(selecttenat.name).selected=true;
                this.selectedFromTenantSelect = selecttenat.name
                console.log("test = ", this.selectedFromTenant);
              // }, 5000)
              
              
        
              // localStorage.setItem('tenantName', this.tenantName);
              localStorage.setItem('selectedTenant', this.selectedFromTenant.tenantId.toString());
              localStorage.setItem('tenantName', selecttenat.name);
              this.tenantFromSelection(selecttenat.name)
              // localStorage.setItem('tenantName', this.tenantName);
              // localStorage.setItem('selectedTenant', this.tenantId);
              localStorage.setItem(
                'selectedTenant',
                selecttenat.tenantId
              );
             
            }
      });
  }

  tenantFromSelection(tenant: any) {
    for (let index = 0; index < this.tenants.length; index++) {
      if(this.tenants[index].name == tenant){
        tenant = this.tenants[index]
        break;
      }
    }
    this.selectedToTenant = '';
    let tList: any = [];
    this.tenants.forEach((t: any) => {
      if (t.tenantId !== tenant.tenantId) {
        tList.push(t);
      }
    });
    this.tenantsTo = tList.sort(this.SortArray);
    this.httpDataService
      .get(AppConstants.APIUrlGetSites + tenant.tenantId + '/' + false)
      .subscribe(
        (res) => {
          this.sites = res;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  transfer() {
    this.httpDataService
      .put(
        AppConstants.APIUrlTenantTransfer +
          this.selectedFromTenant.tenantId +
          '/' +
          this.selectedToTenant.tenantId +
          '/' +
          this.selectedSite.siteId,
        {}
      )
      .subscribe(
        (res: any) => {
          this.selectedFromTenant = '';
          this.selectedToTenant = '';
          this.selectedSite = '';
          this.popUpService.showMsg(
            'Site Transferred.',
            AppConstants.EmptyUrl,
            AppConstants.Success,
            AppConstants.Success
          );
        },
        (err: any) => {
          this.popUpService.showMsg(
            'Site Transfer Error',
            AppConstants.EmptyUrl,
            AppConstants.Error,
            AppConstants.Error
          );
        }
      );
  }
}
