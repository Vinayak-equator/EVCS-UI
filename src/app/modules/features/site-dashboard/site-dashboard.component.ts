import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AppConstants } from '@app/constants';
import { SiteCard } from '@app/models/sitecard.model';
import { SiteList } from '@app/models/sitelist.model';
import { Tenant } from '@app/models/tenant.model';
import { HttpDataService } from '@app/shared/services/http-data.service';
import { TranslateConfigService } from '@app/shared/services/translate-config.service';
import Helper from '@app/shared/utility/Helper';
import { TranslateService } from '@ngx-translate/core';
import { Guid } from 'guid-typescript';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Observable } from 'rxjs';
import { GridFilterService } from '@app/shared/utility/grid-filter.service';
import { map, startWith } from 'rxjs/operators';
import { Address } from '@app/models/address.model';
import { PopUpService } from '@app/shared/utility/popup.service';
import { RouterExtService } from '@app/shared/services/routerExt.service';
import { IndexedDBService } from '@app/shared/utility/indexed-db.service';

@Component({
  selector: 'app-site-dashboard',
  templateUrl: './site-dashboard.component.html',
  styleUrls: ['./site-dashboard.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class SiteDashboardComponent implements OnInit {
  siteDashboardForm: UntypedFormGroup;
  tenantCount: number;
  sitesCount: number;
  chargePointsCount: number;
  tenantId: any;
  siteId: any;
  chargePointId: any;
  tenants: Tenant[];
  sites: SiteList[];
  data: {};
  tenantName: string;
  panelOpenState = true;
  siteCards: SiteCard;
  siteList: SiteList[];
  mapList: SiteList[];
  selectedTenantSelect: any;
  userRole: string;
  occupied: number[] = [];
  faulted: number[] = [];
  available: number[] = [];
  offline: number[] = [];
  canCreateSite = false;
  isTableExpanded = false;
  isMapViewEnabled = false;
  deletedRecords = false;
  process = false;
  public selectedVal: string;
  chnageicon = 'keyboard_arrow_right';
  //Grid columns
  filterSelectObj = [
    {
      name: 'name',
      columnProp: 'name',
      type: 'text',
      options: [] as string[],
      modelValue: '',
    },
    {
      name: 'location',
      columnProp: 'location',
      type: 'text',
      options: [] as string[],
      modelValue: '',
    },
    {
      name: 'chargePointId',
      columnProp: 'chargePointId',
      type: 'text',
      options: [] as string[],
      modelValue: '',
    },
    {
      name: 'chargePointStatus',
      columnProp: 'chargePointStatus',
      type: 'text',
      options: [] as string[],
      modelValue: '',
    },
  ];

  filterValues: any = {};

  siteNameControl = new UntypedFormControl();
  filteredBySiteName: Observable<string[]>;
  sitename: any[];
  siteNameValues: any[];

  locationControl = new UntypedFormControl();
  statusControl = new UntypedFormControl();
  filteredByLocation: Observable<string[]>;
  filteredByStatus: Observable<string[]>;
  locationValues: any[];
  statusValues: any[];
  location: any[];

  chargePointControl = new UntypedFormControl();
  filteredByChargePoint: Observable<string[]>;
  chargePointValues: any[];
  chargePoint: any[];
  selectedTenant: any = '';
  popUpData: string;
  userId: any;
  email: any;

  public onValChange(val: string) {
    this.selectedVal = val;
  }

  get hasTenantAdmin(): boolean {
    return this.userRole == 'Tenant_Admin';
  }

  private _filter(value: string, input: string[]): string[] {
    const filterValue = value.toString().toLowerCase();

    return input?.filter(
      (v) => v?.toString().toLowerCase().indexOf(filterValue) === 0
    );
  }

  zoom: number = 8;

  // initial center position for the map
  lat: any;
  long: any;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private indexedDBService: IndexedDBService,
    private httpDataService: HttpDataService,
    public filterService: GridFilterService,
    private router: Router,
    private translate: TranslateService,
    public translateConfigService: TranslateConfigService,
    private popUpService: PopUpService,
    private routerExtService: RouterExtService
  ) {
    this.siteCards = new SiteCard();
    this.siteList = new Array<SiteList>();
  }

  dataSource = new MatTableDataSource();
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
  displayedColumns: string[] = [
    'chargePointId',
    'name',
    'location',
    'status',
    'connector',
    'connector1',
  ];

  ngOnInit(): void {
    this.indexedDBService
      .getRecordData('PermissionDB', 'permission', 'Site Management')
      .then((data: any) => {
        data.previlleges.forEach((pp: any) => {
          if (pp.key === 'Create Site') {
            this.canCreateSite = pp.value;
          }
        });
      })
      .catch((error: any) => {
        console.error(error);
      });
    this.selectedVal = 'listView';
    this.dataSource.data = [];
    this.buildSiteDashboardForm();
    this.getTenantNames();

    this.translateConfigService.localEvent.subscribe((data) => {
      this.translator();
    });

    
   
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  buildSiteDashboardForm() {
    this.siteDashboardForm = this.formBuilder.group({
      tenantName: [null],
    });
  }

  selectTenant(tenats : any){
    console.log("tenats" , tenats);
    this.process = true;
    var selectorg
    for (let index = 0; index < this.tenants.length; index++) {
      if(this.tenants[index].name == tenats.value){
        selectorg = this.tenants[index]
        break;
      }
    }
    var selectTenatOrd = selectorg
    this.tenantName = selectTenatOrd.name;
    this.selectedTenantSelect = this.tenantName
    this.tenantId = selectTenatOrd.tenantId;
    console.log('tenantName', selectTenatOrd);
    console.log('tenantName', this.tenantId);
    
    localStorage.setItem('tenantName', this.tenantName);
    localStorage.setItem('selectedTenant', this.tenantId);
    this.routerExtService.setRouteValue(
      AppConstants.TenantID,
      this.tenantId?.toString()
    );
    this.getSiteDashboard(this.tenantId);
    this.getSites(this.tenantId);
    // Overrride default filter behaviour of Material Datatable
    this.dataSource.filterPredicate = this.filterService.createFilter();
  

  }

  translator() {
    this.translate.get('singleBinding.itemPage').subscribe((data) => {
      this.paginator._intl.itemsPerPageLabel = data;
      this.paginator._intl.changes.next();
    });
  }

  getSiteNameAutoComplete() {
    this.siteNameValues = this.filterService.getFilterObject(
      this.dataSource.data,
      'name'
    );
    this.filteredBySiteName = this.siteNameControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value, this.siteNameValues))
    );
  }

  getLocationAutoComplete() {
    this.locationValues = this.filterService.getFilterObject(
      this.dataSource.data,
      'location'
    );
    this.filteredByLocation = this.locationControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value, this.locationValues))
    );
  }
  getStatusAutoComplete() {
    this.statusValues = this.filterService.getFilterObject(
      this.dataSource.data,
      'chargePointStatus'
    );
    this.filteredByStatus = this.statusControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value, this.statusValues))
    );
  }
  togglechnage() {
    this.chnageicon =
      this.chnageicon == 'keyboard_arrow_right'
        ? 'keyboard_arrow_down'
        : 'keyboard_arrow_right';
  }
  getChargePointAutoComplete() {
    this.chargePointValues = this.filterService.getFilterObject(
      this.dataSource.data,
      'chargePointId'
    );
    this.filteredByChargePoint = this.chargePointControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value, this.chargePointValues))
    );
  }

  getUserValid() {
    const ids: any = `${this.tenantId}/${this.userId}/${this.email}`;
    return this.httpDataService
      .get(AppConstants.APIUrlUserValidatetUrl + ids)
      .subscribe(
        (res: any) => {
          if (!Helper.isNullOrEmpty(res)) {
            if (res.status == AppConstants.Pending) {
              this.popUpData = AppConstants.UserNotActive;
              this.popUpService.showMsg(
                this.popUpData,
                AppConstants.EmptyUrl,
                AppConstants.Warning,
                AppConstants.Warning
              );
              // this.authService.logout();
            } else {
              this.getSiteDashboard(this.tenantId);
              this.getSites(this.tenantId);
            }
          }
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
        setTimeout(() => {
          if (this.tenants.length) {
            this.process = true;
            var selecttenat = JSON.parse(localStorage.getItem('selectedTenantIdforOrg'))|| '';
            if(selecttenat !=''){
              // setTimeout(() => {
                this.selectedTenant = selecttenat;
                // document.getElementById(selecttenat.name).selected=true;
                this.selectedTenantSelect = selecttenat.name
                console.log("test = ", this.selectedTenant);
              // }, 5000)
              this.tenantName = selecttenat.name;
              this.tenantId = selecttenat.tenantId;
              
        
              // localStorage.setItem('tenantName', this.tenantName);
              localStorage.setItem('selectedTenant', this.tenantId.toString());
              localStorage.setItem('tenantName', selecttenat.name);
              // localStorage.setItem('tenantName', this.tenantName);
              // localStorage.setItem('selectedTenant', this.tenantId);
              localStorage.setItem(
                'selectedTenant',
                selecttenat.tenantId
              );
              
              this.routerExtService.setRouteValue(
                AppConstants.TenantID,
                selecttenat.tenantId?.toString()
              );
              this.getSiteDashboard(selecttenat.tenantId);
              this.getSites(selecttenat.tenantId);
              this.dataSource.filterPredicate = this.filterService.createFilter();
            }else{
              this.selectedTenant = this.tenants[0];
              console.log("test = ", this.selectedTenant);
              
              this.tenantName = this.tenants[0].name;
              this.tenantId = this.tenants[0].tenantId;
              localStorage.setItem('tenantName', this.tenants[0].name);
              localStorage.setItem(
                'selectedTenant',
                this.tenants[0].tenantId.toString()
              );
              this.routerExtService.setRouteValue(
                AppConstants.TenantID,
                this.tenants[0].tenantId?.toString()
              );
              this.getSiteDashboard(this.tenants[0].tenantId);
              this.getSites(this.tenants[0].tenantId);
              this.dataSource.filterPredicate = this.filterService.createFilter();

            }
            
            
          }
        }, 1000);
      });
  }

  getSiteDashboard(tenantId: any) {
    return this.httpDataService
      .getById(AppConstants.APIUrlSiteDashboardtUrl, tenantId)
      .subscribe(
        (res) => {
          console.log('site kruti', res);
          this.siteCards.sites = res.sites;
          this.siteCards.chargePoints = res.chargePoints;
          this.siteCards.connectors_Available = res.connectors_Available;
          this.siteCards.connectors_InUse = res.connectors_InUse;
          this.siteCards.connectors = res.connectors;
          this.siteCards.connectors_Offline = res.connectors_Offline;
          this.siteCards.connectors_Authorize = res.connectors_Authorize;
          this.siteCards.connectors_Faulted = res.connectors_Faulted;
          this.siteCards.connectors_Finishing = res.connectors_Finishing;
          this.siteCards.connectors_Preparing = res.connectors_Preparing;
          this.siteCards.kwh = res.kwh;
        },
        (error) => {
          if (!Helper.isNullOrWhitespace(error)) {
            if (!Helper.isNullOrWhitespace(error.error.errors)) {
              const validationErrors = error.error.errors;
              this.serverError(validationErrors);
            } else {
              this.popUpData = this.serverErrorMsgResponse(error.error);
              this.popUpService.showMsg(
                this.popUpData,
                AppConstants.EmptyUrl,
                AppConstants.Error,
                AppConstants.Error
              );
            }
          } else {
            this.popUpData = this.serverErrorMsgResponse(error.error);
            this.popUpService.showMsg(
              this.popUpData,
              AppConstants.EmptyUrl,
              AppConstants.Error,
              AppConstants.Error
            );
          }
        }
      );
  }

  chargerEdit(chargerData: any) {
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

  siteUpdate(siteData: any) {
    localStorage.setItem('siteName', siteData.name);
    this.routerExtService.setRouteValue(
      AppConstants.SiteID,
      siteData.siteId.toString()
    );
    this.router.navigate([AppConstants.SiteEditUrl]);
  }

  toggleDeletedRecords() {
    //this.deletedRecords = !this.deletedRecords;
    this.getSites(this.tenantId);
  }

  getSites(tenantId: Guid) {
    this.dataSource.data = [];
    // console.log(this.selectedTenant);
    this.httpDataService
      .get(
        AppConstants.APIUrlSiteListUrl + tenantId + '/' + this.deletedRecords
      )
      .subscribe(
        (res: SiteList[]) => {
          // res.filter((s: any) => {
            console.log(res)
          this.siteList = [];
          this.mapList = [];
          let duplicateSite: any;
          this.selectedVal = 'listView';
          res.forEach((currentSite: any, currentSiteIndex: any) => {

            // currentSite.location = currentSite.address.city + '-' + currentSite.address.state + '-' + currentSite.address.country;
            //Initalize the connector count variables
            let totalConnectors: number = 0;
            let availableConnectors: number = 0;
            let offlineConnectors: number = 0;
            let occupiedConnectors: number = 0;
            let faultedConnectors: number = 0;
            let otherStatusConnectors: number = 0;

            if (currentSite?.chargePointList?.length > 0) {
              currentSite?.chargePointList?.forEach(
                (currentChargePoint: any, chargePointIndex: any) => {
                  let siteObj = new SiteList();
                  let mapObj = new SiteList();
                  duplicateSite = this.mapList.filter(
                    (s) => s.address.street == currentSite.address?.street
                  );
                  siteObj.siteId = currentSite.siteId;
                  siteObj.name = currentSite.name;

                  mapObj.name = currentSite.name;
                  mapObj.siteId = currentSite.siteId;
                  if (duplicateSite.length > 0) {
                    mapObj.noOfChargePoints =
                      duplicateSite[0].noOfChargePoints +
                      currentSite?.chargePointList?.length;
                    // console.log(mapObj.noOfChargePoints);
                  } else
                    mapObj.noOfChargePoints =
                      currentSite?.chargePointList?.length;

                  if (currentSiteIndex == 0) {
                    this.lat = parseFloat(currentSite.address?.lat);
                    this.long = parseFloat(currentSite.address?.long);
                    mapObj.lat = currentSite.address?.lat;
                    mapObj.long = currentSite.address?.long;
                    currentSiteIndex = currentSiteIndex + 1;
                    mapObj.label = currentSiteIndex.toString();
                    mapObj.draggable = false;
                  } else {
                    if (duplicateSite.length == 0) {
                      mapObj.lat = currentSite.address?.lat;
                      mapObj.long = currentSite.address?.long;
                      currentSiteIndex = currentSiteIndex + 1;
                      mapObj.label = currentSiteIndex.toString();
                      mapObj.draggable = false;
                    }
                  }

                  // siteObj.address.city = currentSite.address?.city;
                  // siteObj.address.state = currentSite.address?.state;
                  // siteObj.address.country = currentSite.address?.country;
                  siteObj.address.street = currentSite.address?.street;

                  siteObj.location =
                    currentSite.address.city +
                    ', ' +
                    currentSite.address.state +
                    ', ' +
                    currentSite.address.country;

                  mapObj.address.city = currentSite.address?.city;
                  mapObj.address.state = currentSite.address?.state;
                  mapObj.address.country = currentSite.address?.country;
                  mapObj.address.street = currentSite.address?.street;
                  mapObj.status = currentSite.status;

                  siteObj.chargePointId = currentChargePoint.chargePointId;
                  siteObj.chargePointTenantId = currentChargePoint.tenantId;
                  siteObj.chargePointName = currentChargePoint.name;
                  siteObj.chargePointStatus = currentChargePoint.status;

                  siteObj.numberOfConnectors =
                    currentChargePoint.numberOfConnectors;

                  currentChargePoint?.connectors?.forEach(
                    (currentConnector: any, connectorIndex: any) => {
                      if (connectorIndex > 0 && connectorIndex < 3) {
                        // Calculate the connector count base on the status, this will be used in MAP Tooltip
                        if (
                          currentConnector.status == AppConstants.Occupied &&
                          currentChargePoint.status == AppConstants.Online
                        ) {
                          occupiedConnectors++;
                        } else if (
                          currentConnector.status == AppConstants.Faulted &&
                          currentChargePoint.status == AppConstants.Online
                        ) {
                          faultedConnectors++;
                        } else if (
                          currentConnector.status == AppConstants.Available &&
                          currentChargePoint.status == AppConstants.Online
                        ) {
                          availableConnectors++;
                        } else if (
                          currentConnector.status == AppConstants.Offline &&
                          currentChargePoint.status == AppConstants.Online
                        ) {
                          offlineConnectors++;
                        } else {
                          if (currentChargePoint.status == AppConstants.Online)
                            otherStatusConnectors++;
                        }
                      }

                      if (connectorIndex == 1) {
                        totalConnectors++;
                        siteObj.connector1Name =
                          currentConnector.meter != null
                            ? currentConnector.meter
                            : null;
                        siteObj.connector1Status = currentConnector.status;
                      }
                      if (connectorIndex == 2) {
                        totalConnectors++;
                        siteObj.connector2Name =
                          currentConnector.meter != null
                            ? currentConnector.meter
                            : null;
                        siteObj.connector2Status = currentConnector.status;
                      }
                    }
                  );

                  this.siteList.push(siteObj);
                }
              );
            } else {
              let siteObj = new SiteList();
              siteObj.siteId = currentSite.siteId;
              siteObj.name = currentSite.name;
              siteObj.lat = currentSite.address?.lat;
              siteObj.long = currentSite.address?.long;
              // siteObj.address.city = currentSite.address?.city;
              // siteObj.address.state = currentSite.address?.state;
              // siteObj.address.country = currentSite.address?.country;
              siteObj.status = currentSite.status;

              siteObj.location =
                currentSite.address.city +
                ', ' +
                currentSite.address.state +
                ', ' +
                currentSite.address.country;

              siteObj.chargePointId = AppConstants.NotAvailable;
              siteObj.chargePointTenantId = AppConstants.NotAvailable;
              siteObj.chargePointName = AppConstants.NotAvailable;
              siteObj.chargePointStatus = AppConstants.NotAvailable;
              siteObj.connector1Name = AppConstants.NotAvailable;
              // siteObj.connector1Status = AppConstants.NotAvailable;
              siteObj.connector2Name = AppConstants.NotAvailable;
              // siteObj.connector2Status = AppConstants.NotAvailable;

              this.siteList.push(siteObj);
            }
            let address: Address = new Address();
            address.city = currentSite.address?.city;
            address.state = currentSite.address?.state;
            address.country = currentSite.address?.country;

            let mapItem: SiteList = new SiteList();

            mapItem.siteId = currentSite.siteId;
            mapItem.lat = currentSite.address?.lat;
            mapItem.long = currentSite.address?.long;
            mapItem.name = currentSite.name;
            mapItem.address = address;
            mapItem.Available = availableConnectors;
            mapItem.Faulted = faultedConnectors;
            mapItem.Occupied = occupiedConnectors;
            mapItem.Offline = offlineConnectors;
            mapItem.OtherStatus = otherStatusConnectors;
            mapItem.numberOfConnectors = totalConnectors;
            mapItem.noOfChargePoints = totalConnectors; //currentSite.chargePointList?.length;

            this.mapList.push(mapItem);
          });

          this.dataSource.data = this.siteList;
          // console.table(res);
          // console.table(this.siteList);
          // console.table(this.mapList);
          this.getSiteNameAutoComplete();
          this.getLocationAutoComplete();
          this.getStatusAutoComplete();
          this.getChargePointAutoComplete();
          this.listView();
          this.process = false;
        },
        (error) => {
          if (!Helper.isNullOrWhitespace(error.error?.errors)) {
            this.dataSource.data = [];
            // this.popUpService.showMsg(error.error.message, AppConstants.EmptyUrl, AppConstants.Warning, AppConstants.Warning);
            this.listView();
          } else if (!Helper.isNullOrWhitespace(error.error)) {
            this.dataSource.data = [];
            // this.popUpService.showMsg(error.error.message, AppConstants.EmptyUrl, AppConstants.Warning, AppConstants.Warning);
            this.listView();
          } else {
          }
        }
      );
  }

  newSite() {
    localStorage.setItem('tenantName', this.tenantName);
    this.router.navigate([AppConstants.SiteCreationUrl]);
    localStorage.setItem('siteDashboardUrl', AppConstants.SiteDashboardUrl);
  }

  siteDetail() {
    const ids: any = `${this.tenantId}/${this.siteId}`;
    this.routerExtService.setRouteValue(
      AppConstants.TenantID,
      this.tenantId.toString()
    );
    this.routerExtService.setRouteValue(
      AppConstants.SiteID,
      this.siteId.toString()
    );
    this.router.navigate([AppConstants.SiteEditUrl]);
  }

  chargeDetail() {
    const ids: any = `${this.tenantId}/${this.siteId}/${this.chargePointId}`;
    this.routerExtService.setRouteValue(
      AppConstants.TenantID,
      this.tenantId.toString()
    );
    this.routerExtService.setRouteValue(
      AppConstants.SiteID,
      this.siteId.toString()
    );
    this.routerExtService.setRouteValue(
      AppConstants.ChargePointID,
      this.chargePointId.toString()
    );
    this.router.navigate([AppConstants.ChargerEditUrl]);
  }

  // Called on Filter change
  filterChange(filter: any, event: any) {
    if (event.option != undefined) {
      this.filterValues[filter?.columnProp] = event.option.value
        .toString()
        .trim()
        .toLowerCase();
    } else {
      if (!Helper.isNullOrEmpty(this.siteNameControl.value))
        this.filterValues[filter?.columnProp] = this.siteNameControl.value
          .toString()
          .trim()
          .toLowerCase();
      else if (!Helper.isNullOrEmpty(this.locationControl.value))
        this.filterValues[filter?.columnProp] = this.locationControl.value
          .toString()
          .trim()
          .toLowerCase();
      else if (!Helper.isNullOrEmpty(this.statusControl.value))
        this.filterValues[filter?.columnProp] = this.statusControl.value
          .toString()
          .trim()
          .toLowerCase();
      else if (!Helper.isNullOrEmpty(this.chargePointControl.value))
        this.filterValues[filter?.columnProp] = this.chargePointControl.value
          .toString()
          .trim()
          .toLowerCase();
    }

    this.dataSource.filter = JSON.stringify(this.filterValues);
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Reset table filters
  resetFilters() {
    this.deletedRecords = false;
    this.getSites(this.tenantId);
    this.siteNameControl.setValue('');
    this.locationControl.setValue('');
    this.statusControl.setValue('');
    this.chargePointControl.setValue('');
    this.filterValues = {};
    this.filterSelectObj.forEach((value: any, key: any) => {
      value.modelValue = undefined;
    });
    this.dataSource.filter = '';
  }

  mapView() {
    this.isMapViewEnabled = true;
  }

  listView() {
    this.isMapViewEnabled = false;
  }

  siteEdit(event: any, tenantId: any, siteId: any) {
    const siteById: any = `${tenantId}/${siteId}`;
    event.preventDefault();
    event.stopPropagation();
    this.routerExtService.setRouteValue(AppConstants.SiteID, siteId.toString());
    window.open(AppConstants.SiteEditUrl, '_blank');
  }

  serverError(validationErrors: any) {
    Object.keys(validationErrors).forEach((prop) => {
      const formControl = this.siteDashboardForm.get(prop);
      if (formControl) {
        formControl.setErrors({
          serverError: validationErrors[prop].join(','),
        });
      }
    });
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

  goToSite() {
    if (this.selectedTenant) {
      localStorage.setItem(
        'parentTenantRequest',
        this.selectedTenant.isRequestRaised
      );
      localStorage.setItem('tenantName', this.selectedTenant.name);
      localStorage.setItem('tenantId', this.selectedTenant.tenantId);
      this.routerExtService.clearRouteValue();
      this.routerExtService.setRouteValue(
        AppConstants.TenantID,
        this.selectedTenant.tenantId.toString()
      );
      this.router.navigate([AppConstants.TenantDetailPage]);
    }
  }
}
