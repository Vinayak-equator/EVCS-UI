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
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { environment } from '@env';
import { Router } from '@angular/router';
import { RoleType } from '@app/shared/services/roles.enum';
import { RouterExtService } from '@app/shared/services/routerExt.service';
import { AgmMap } from '@agm/core';
import { MouseEvent, MapsAPILoader } from '@agm/core';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css'],
})
export class AnalyticsComponent implements OnInit {
  // dtOptions: DataTables.Settings = {};
  address = ''; // Replace with the desired address
  filterType: any = 'Daily';
  selected = 'last30Days';
  hideDaily: boolean = false;
  hideWeekly: boolean = false;
  hideMonthly: boolean = false;
  hideQuarterly: boolean = false;
  isDatepickerDisabled: boolean = true;
  lat = 40.7128;
  long = 74.0060;
  zoom = 5;
  pageloader = true
  maplist: any = [];
  public isMasterAdmin = false;
  public isSiteOwner = false;
  tenants: Tenant[];
  selectedTenant: any = '';
  sites: Site[] = [];
  process = false;
  process1 = false;
  selectedSite: any = '';
  chargePoints: any = [];
  selectedChargePoint: any = '';
  maxDate = new Date();
  startDate: any = '';
  endDate: any = '';
  tenantCount: number = 0;
  sitesCount: number = 0;
  chargePointsCount: number = 0;
  energy:number = 0;
  totalKWH:number = 0;
  eco:number = 0;
  environment:number = 0;
  connectorFinishingCount: number = 0;
  connectorFaultedCount: number = 0;
  connectorAuthorizeCount: number = 0;
  connectorPreparingCount: number = 0;
  connectorsAvailableCount: number = 0;
  connectors: number = 0;
  connectorsInUseCount: number = 0;
  displayStyle = 'none';
  UnitdisplayStyle = 'none';
  viewDateRange = 'none';
  connectorsOfflineCount: number = 0;
  connectorsUnavailableCount: number = 0;
  totalchargePoints_Offline: number = 0;
  totalRevenueReimbursement: number = 0;
  totalUtilityReimbursement: number = 0
  totalReimbursement: number = 0
  failedTransactionCount: any = 0;
  successfulTransactionCount: any = 0;
  totalAmount: any = 0;
  totalUnitsConsumed: any = 0;
  registeredUser: any = 0;
  onlineChargers: any = [];
  onlineSiteChargers: any = [];
  offlineChargers: any = [];
  offlineSiteChargers: any = [];
  // iconsUrl: "../assets/img/testMarker.png";
  //pie
  piechartData: ChartDataSets[] = [];
  piechartLabel: Label[] = [];
  piechartLegend = true;
  piechartOptions: ChartOptions = {
    responsive: true,
  };
  piechartColors: Color[] = [];
  piechartPlugins: any = [];
  // current
  chartData: ChartDataSets[] = [];
  chartLabel: Label[] = [];
  chartLegend = true;
  chartOptions: ChartOptions = {
    responsive: true,
  };
  chartColors: Color[] = [
    {
      // Red - Total Revenue
      backgroundColor: '#52BA6C',
      borderColor: '#52BA6C',
    },
    {
      // Orange - Transactions
      backgroundColor: '#184EA2',
      borderColor: '#184EA2',
    },
    {
      // Blue - Registered Users
      backgroundColor: '#FFAA29',
      borderColor: '#FFAA29',
    },
    {
      // Purple - Guest Users
      backgroundColor: '#29A5FF',
      borderColor: '#29A5FF',
    },
    {
      // Green
      backgroundColor: 'rgba(75, 192, 192, 0.4)',
      borderColor: 'rgba(75, 192, 192, 1)',
    },
    {
      // Yellow
      backgroundColor: 'rgba(255, 206, 86, 0.4)',
      borderColor: 'rgba(255, 206, 86, 1)',
    },
  ];
  chartPlugins: any = [];
  //register user
  registerchartData: ChartDataSets[] = [];
  registerchartLabel: Label[] = [];
  registerchartLegend = true;
  registerchartOptions: ChartOptions = {
    responsive: true,
  };
  registerchartColors: Color[] = [
    {
      // Orange
      backgroundColor: '#FFAA29',
      borderColor: '#FFAA29',
    },
    {
      // Blue
      backgroundColor: 'rgba(54, 162, 235, 0.4)',
      borderColor: 'rgba(54, 162, 235, 1)',
    },
    {
      // Purple
      backgroundColor: 'rgba(153, 102, 255, 0.4)',
      borderColor: 'rgba(153, 102, 255, 1)',
    },
    {
      // Green
      backgroundColor: 'rgba(75, 192, 192, 0.4)',
      borderColor: 'rgba(75, 192, 192, 1)',
    },
    {
      // Yellow
      backgroundColor: 'rgba(255, 206, 86, 0.4)',
      borderColor: 'rgba(255, 206, 86, 1)',
    },
  ];
  registerchartPlugins: any = [];
  //unit consumed
  unitchartLabel: Label[] = [];
  unitsConsumeResponse:any = [];
  unitchartData: ChartDataSets[] = [
    // { data: [10, 20, 30, 15, 25], label: 'Series A' },
  ];
  unitchartLegend = true;

  unitchartOptions: ChartOptions = {
    responsive: true,
    //maintainAspectRatio: false,
    // scales: {
    //   yAxes: [
    //     {
    //       ticks: {
    //         min: 0,
    //         max: 10,
    //       },
    //     },
    //   ],
    // },
  };
  unitchartColors: Color[] = [
    {
      // Purple
      backgroundColor: '#29A5FF',
      borderColor: '#29A5FF',
    },
  ];

  unitchartPlugins: any = [];

  //financial
  finacialchartData: ChartDataSets[] = [];
  finacialchartLabel: Label[] = [];
  finacialchartLegend = true;
  finacialchartOptions: ChartOptions = {
    responsive: true,
    // maintainAspectRatio: false,
    // scales: {
    //   yAxes: [
    //     {
    //       ticks: {
    //         min: 0,
    //         max: 10,
    //       },
    //     },
    //   ],
    // },
  };
  finacialchartColors: Color[] = [
    {
      // Red
      backgroundColor: '#184EA2',
      borderColor: '#184EA2',
    },
    {
      // Orange
      backgroundColor: 'rgba(255, 159, 64, 0.4)',
      borderColor: 'rgba(255, 159, 64, 1)',
    },
    {
      // Blue
      backgroundColor: '#184EA2',
      borderColor: '#184EA2',
    },
    {
      // Purple
      backgroundColor: 'rgba(153, 102, 255, 0.4)',
      borderColor: 'rgba(153, 102, 255, 1)',
    },
    {
      // Green
      backgroundColor: 'rgba(75, 192, 192, 0.4)',
      borderColor: 'rgba(75, 192, 192, 1)',
    },
    {
      // Yellow
      backgroundColor: 'rgba(255, 206, 86, 0.4)',
      borderColor: 'rgba(255, 206, 86, 1)',
    },
  ];

  finacialchartPlugins: any = [];

  dataSource = new MatTableDataSource();
  displayedColumns: string[] = [
    'siteName',
    'siteAddress',
    'chargers',
    'connectors',
    'energryUsed',
    'revenue',
  ];
  tableProcess = false;
  pageNumber: number = 0;  
  pageSize: number = 5;
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
  connection: any;
  public roleType = RoleType;
  public userRole = '';
  public countprocess = false;
  public greenprocess = false;

  // chartClicked(event: any) {
  //   console.log(event);
  // }

  // chartHovered(event: any) {
  //   console.log(event);
  // }

  constructor(
    private httpDataService: HttpDataService,
    private cdref: ChangeDetectorRef,
    private routerExtService: RouterExtService,
    public router: Router,
    private mapsAPILoader: MapsAPILoader
  ) {}

  openInfoWindow(): void {
    this.mapsAPILoader.load().then(() => {
      const geocoder = new google.maps.Geocoder();
      for (var i = 0; i < this.maplist.length; i++) {
        const latlng = new google.maps.LatLng(
          this.maplist.lat,
          this.maplist.lng,
          
        );
        geocoder.geocode({ location: latlng }, (results, status) => {
          if (status === 'OK') {
            if (results[0]) {
              this.address = results[0].formatted_address;
            }
          } else {
            console.error('Geocoder failed due to: ' + status);
          }
        });
      }
    });
  }

  closeInfoWindow(): void {
    this.address = '';
  }
  clearCache() {
    caches.keys().then((keyList) => Promise.all(keyList.map((key) => caches.delete(key))));
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations()
      .then(function(registrations) {
         for(let registration of registrations) {
            registration.unregister();
         }
         window.location.reload();
      });
    } 
  }
  ngOnInit(): void {
    // let table = new DataTable('#myTable');
    if (this.selected === 'custom') {
      const currentDate = new Date();
      let startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - 1);
      this.filterType = 'Daily';
      this.startDate = startDate;
      this.endDate = new Date(currentDate);      
      //this.getStatistics();
    }
    this.getTenantNames();
    const sessionRole = localStorage.getItem('role') || '';
    if (sessionRole) {
      this.userRole = Helper.decodeRole(sessionRole);
      this.isSiteOwner = (this.userRole === this.roleType.SiteOwner) ? true : false;
      if (this.userRole === this.roleType.MasterAdmin) {
        this.isMasterAdmin = true;
        this.connection = new HubConnectionBuilder()
          .withUrl(environment.signalRCountURL)
          .build();
        this.connection
          .start()
          .then(() => {
            console.log('connected to SignalR!');
            console.log('connectionId ', this.connection.connectionId);
            this.connection.on('targetupdate', (data: any) => {

              console.log("targetupdate = ",data);
              
              //  this.tenantCount = data.Tenants;
              
              // // this.sitesCount = data.Sites;
              // // this.chargePointsCount = data.ChargePoints;
              // this.connectors = data.Connectors;
              // this.connectorsAvailableCount = data.Connectors_Available;
              // this.connectorsInUseCount = data.Connectors_InUse;
              // // this.totalchargePoints_Offline = data.chargePoints_Offline
              // // this.connectorsOfflineCount = data.Connectors_Offline;
              // // this.connectorsUnavailableCount = data.Connectors_Offline;
              // this.connectorFinishingCount = data.connectors_Finishing;
              // this.connectorFaultedCount = data.connectors_Faulted;
              // this.connectorAuthorizeCount = data.connectors_Authorize;
              // this.connectorPreparingCount = data.connectors_Preparing;

             

              this.piechartData = [
                {
                  data: [
                    this.connectorsAvailableCount,
                    this.connectorsOfflineCount,
                    this.connectorPreparingCount,
                    this.connectorFinishingCount,
                    this.connectorsInUseCount,
                    this.connectorFaultedCount,
                    this.connectorAuthorizeCount,
                  ],
                },
              ];
              console.log('pieeeee', this.piechartData);
              this.piechartColors = [
                {
                  backgroundColor: [
                    'rgba(82, 186, 108, 1)',
                    'rgba(180, 180, 180,0.6)',
                    'rgba(46, 212, 29,1)',
                    'rgba(255, 128, 10, 1)',
                    'rgba(255, 189,46, 1)',
                    'rgba(221, 64, 93, 1)',
                    'rgba(252, 249, 65, 1)',
                    
                  ],
                  borderWidth: 0,
                },
              ];
              this.piechartLabel = [
                'Available',
                'Unavailable',
                'Preparing',
                'Finishing',
                'Occupied',
                'Faulted',
                'Authorized',
              ];
            });
          })
          .catch((err: any) =>
            console.log('error while establishing signalr connection: ' + err)
          );
      }
    }
  }

  refreshConnector(){
    const sessionRole = localStorage.getItem('role') || '';
    if (sessionRole) {
      this.userRole = Helper.decodeRole(sessionRole);
      if (this.userRole === this.roleType.MasterAdmin) {
        this.isMasterAdmin = true;
        this.getCardCount(this.selectedTenant.tenantId)

//         this.connection = new HubConnectionBuilder()
//           .withUrl(environment.signalRCountURL)
//           .build();
//         this.connection
//           .start()
//           .then(() => {
//             console.log('connected to SignalR!');
//             console.log('connectionId ', this.connection.connectionId);
//             this.connection.on('targetupdate', (data: any) => {

//               console.log("targetupdate = ",data);
              
//               //  this.tenantCount = data.Tenants;
              
//               // // this.sitesCount = data.Sites;
//               // // this.chargePointsCount = data.ChargePoints;
//               // this.connectors = data.Connectors;
//               // this.connectorsAvailableCount = data.Connectors_Available;
//               // this.connectorsInUseCount = data.Connectors_InUse;
//               // // this.totalchargePoints_Offline = data.chargePoints_Offline
//               // // this.connectorsOfflineCount = data.Connectors_Offline;
//               // // this.connectorsUnavailableCount = data.Connectors_Offline;
//               // this.connectorFinishingCount = data.connectors_Finishing;
//               // this.connectorFaultedCount = data.connectors_Faulted;
//               // this.connectorAuthorizeCount = data.connectors_Authorize;
//               // this.connectorPreparingCount = data.connectors_Preparing;

             
// debugger
//               this.piechartData = [
//                 {
//                   data: [
//                     this.connectorsAvailableCount,
//                     this.connectorsOfflineCount,
//                     this.connectorPreparingCount,
//                     this.connectorFinishingCount,
//                     this.connectorsInUseCount,
//                     this.connectorFaultedCount,
//                     this.connectorAuthorizeCount,
//                   ],
//                 },
//               ];
//               console.log('pieeeee', this.piechartData);
//               this.piechartColors = [
//                 {
//                   backgroundColor: [
//                     'rgba(82, 186, 108, 1)',
//                     'rgba(180, 180, 180,0.6)',
//                     'rgba(46, 212, 29,1)',
//                     'rgba(255, 128, 10, 1)',
//                     'rgba(255, 189,46, 1)',
//                     'rgba(221, 64, 93, 1)',
//                     'rgba(252, 249, 65, 1)',
                    
//                   ],
//                   borderWidth: 0,
//                 },
//               ];
//               this.piechartLabel = [
//                 'Available',
//                 'Unavailable',
//                 'Preparing',
//                 'Finishing',
//                 'Occupied',
//                 'Faulted',
//                 'Authorized',
//               ];
//             });
//           })
//           .catch((err: any) =>
//             console.log('error while establishing signalr connection: ' + err)
//           );
      }
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  // checkAllZeros(arr){
  //   return arr.every((value) => {  return value === 0;});
  // }

  openPopup() {
    this.displayStyle = 'block';
  }
  closePopup() {
    this.displayStyle = 'none';
  }

  getSiteMap(tenantId: any) {
    this.httpDataService
      // .get(AppConstants.APIUrlDashboardCard + '?tenantId=' + tenantId)
      .get(AppConstants.APIUrlSiteMap + '/' + tenantId)
      .subscribe((res) => {
       

        for (var i = 0; i < res.length; i++) {
          this.maplist.push({
            lat: parseFloat(res[i].siteLat),
            lng: parseFloat(res[i].siteLong),
            label: res[i].siteName,
            NoOfConnectors: res[i].noOfConnectors,
            Available: res[i].connectors_Available,
            Occupied: res[i].connectors_Occupied,
            UnAvailable: res[i].connectors_UnAvailable,
            iconsUrl: "../assets/img/location-pin.png"
          });
        }
      
      });
  }

  getCardCount(tenantId: any) {
    if (this.isSiteOwner) {
      this.httpDataService
      .get(AppConstants.APIUrlGetSiteOwnerCardCounts + tenantId)
      .subscribe(
        (res) => {
          this.totalRevenueReimbursement = res.revenueReimbursement.toFixed(2);
          this.totalUtilityReimbursement = res.utilityReimbursement.toFixed(2);
          this.totalReimbursement = res.totalReimbursement.toFixed(2);
        },
        (error) => {
          console.log(error);
        }
      );
    }
    this.httpDataService
      // .get(AppConstants.APIUrlDashboardCard + '?tenantId=' + tenantId)
      .get(AppConstants.APIUrlDashboardCard + '/' + tenantId)
      .subscribe((res) => {
             
        console.log("ResponsesgetCardCount = ",res);
        
        this.tenantCount = res.tenants;
        this.sitesCount = res.sites;
        this.chargePointsCount = res.chargePoints;
        this.connectors = res.connectors;
        this.connectorsAvailableCount = res.connectors_Available;
        this.connectorsInUseCount = res.connectors_InUse;
        this.connectorsOfflineCount = res.connectors_Offline;
        this.totalchargePoints_Offline = res.chargePoints_Offline
        this.connectorsUnavailableCount = res.connectors_Offline;
        this.connectorFinishingCount = res.connectors_Finishing;
        this.connectorFaultedCount = res.connectors_Faulted;
        this.connectorAuthorizeCount = res.connectors_Authorize;
        this.connectorPreparingCount = res.connectors_Preparing;
        var kwh = parseFloat(res.kwh)
        this.totalKWH = kwh;
        this.pageloader = false
        this.energy =((kwh * 433) / 1000);
        // var en = parseFloat(this.energy);
        // parseFloat(this.energy).toFixed(2)
        this.eco  = (kwh * 48.7) / 1000
        this.environment = (kwh * 7.2) / 1000



        this.countprocess = false;

        this.piechartData = [
          {
            data: [
              this.connectorsAvailableCount,
              this.connectorsOfflineCount,
              this.connectorPreparingCount,
              this.connectorFinishingCount,
              this.connectorsInUseCount,
              this.connectorFaultedCount,
              this.connectorAuthorizeCount,
            ],
          },
        ];
        this.piechartColors = [
          {
            backgroundColor: [
              'rgba(82, 186, 108, 1)',
                    'rgba(180, 180, 180,0.6)',
                    'rgba(46, 212, 29,1)',
                    'rgba(255, 128, 10, 1)',
                    'rgba(255, 189,46, 1)',
                    'rgba(221, 64, 93, 1)',
                    'rgba(252, 249, 65, 1)',
              
            ],
            borderWidth: 0,
          },
        ];
        this.piechartLabel = [
          'Available',
          'Unavailable',
          'Preparing',
          'Finishing',
          'Occupied',
          'Faulted',
          'Authorized',
        ];
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

  getTenantNames() {
    return this.httpDataService
      .get(AppConstants.APIUrlTenantNameListtUrl)
      .subscribe((res: Tenant[]) => {
        this.tenants = res.sort(this.SortArray);
        if (this.tenants.length) {
          if(localStorage.getItem('selectedTenantIdforOrg')){
            
            var selectedTenants = JSON.parse(localStorage.getItem('selectedTenantIdforOrg'));
            this.selectedTenant = selectedTenants;
            console.log("selectedTenants = ",selectedTenants);
            
            localStorage.setItem(
              'selectedTenantId',
              selectedTenants.tenantId.toString()
            );
            // this.displayStyle = 'block';
  
              this.tenantSelection(selectedTenants);
              this.getCardCount(selectedTenants.tenantId);
              this.getSiteMap(selectedTenants.tenantId);
           

          }else{

            localStorage.setItem(
              'selectedTenantId',
              this.tenants[0].tenantId.toString()
            );
            // this.displayStyle = 'block';
  
              this.tenantSelection(this.tenants[0]);
              this.getCardCount(this.tenants[0].tenantId);
              this.getSiteMap(this.tenants[0].tenantId);
           

          }
          
        }
      });
  }

  tenantSelection(tenant: any) {
    // this.process = true;
    this.greenprocess = true;
    // this.countprocess = true;
    this.dataSource.data = [];
    this.sites = [];
    this.chargePoints = [];
    this.onlineChargers = [];
    this.offlineChargers = [];
    this.httpDataService
      .get(AppConstants.APIUrlGetSites + tenant.tenantId + '/' + false)
      .subscribe(
        (res) => {
          this.sites = res;
          this.selectedTenant = tenant;
          console.log("setTanants = ",this.selectedTenant);
          
          this.chargePoints = [];
          this.process = false;
          localStorage.setItem(
            'selectedTenantId',
            JSON.stringify(tenant.tenantId)
          );
          this.getSiteMap(tenant.tenantId);
          this.getCardCount(tenant.tenantId);
          // this.getChargerData();
          this.getOnlineChargers();
          this.getOfflineChargers();
          if(this.endDate == ''){
            this.endDate = new Date();
            this.startDate = new Date(
              this.endDate.getTime() - 30 * 24 * 60 * 60 * 1000
            );
          }
          
          this.getStatistics();
          
        },
        (error) => {
          console.log(error);
        }
      );
  }


  showCustom(){
   
    document.getElementById("custom").style.display = "block"
    document.getElementById("custom1").style.display = "block"

  }

  datefilters(resp:any){
    document.getElementById("custom").style.display = "none"
    document.getElementById("custom1").style.display = "none"
    if(resp =="yearly"){

      this.endDate = new Date();
          this.startDate = new Date(
            this.endDate.getTime() - 365 * 24 * 60 * 60 * 1000
          );
          this.getStatistics();

    }else if(resp =="monthly"){

      this.endDate = new Date();
          this.startDate = new Date(
            this.endDate.getTime() - 30 * 24 * 60 * 60 * 1000
          );
          this.getStatistics();

    }else if(resp =="weekely"){

      this.endDate = new Date();
          this.startDate = new Date(
            this.endDate.getTime() - 7 * 24 * 60 * 60 * 1000
          );
          this.getStatistics();

    }
  }

  siteSelection(site: any) {
    this.httpDataService
      .get(
        AppConstants.APIUrlChargePointsById +
          this.selectedTenant.tenantId +
          '/' +
          site.siteId +
          '/' +
          false
      )
      .subscribe(
        (res) => {
          this.onlineSiteChargers = [];
          this.offlineSiteChargers = [];
          this.chargePoints = res;
          this.selectedSite = site;
          this.onlineChargers.forEach((element: any) => {
            if (element.siteId === this.selectedSite.siteId) {
              this.onlineSiteChargers.push(element);
            }
          });
          this.offlineChargers.forEach((element: any) => {
            if (element.siteId === this.selectedSite.siteId) {
              this.offlineSiteChargers.push(element);
            }
          });
        },
        (error) => {
          console.log(error);
        }
      );
  }

  chargePointSelection(chargepoint: any) {
    this.selectedChargePoint = chargepoint;
  }

  getStatistics() {
    this.viewDateRange = 'none';
    this.process1 = true;
    if (this.startDate && this.endDate) {
      this.chartData = [];
      this.chartLabel = [];

      // this.httpDataService
      //   .get(
      //     AppConstants.APIUrlGetStatistics +
      //       this.selectedTenant.tenantId +
      //       '/' +
      //       Helper.getFormattedDate(this.startDate) +
      //       '/' +
      //       Helper.getFormattedDate(this.endDate)
      //   )
      //   .subscribe(
      //     (res) => {
          
            
      //       this.failedTransactionCount = res?.data?.failedTransactionCount
      //         ? res?.data?.failedTransactionCount
      //         : 0;
      //       this.successfulTransactionCount = res?.data
      //         ?.successfulTransactionCount
      //         ? res?.data?.successfulTransactionCount
      //         : 0;
      //       this.totalAmount = res?.data?.totalAmount
      //         ? parseFloat(res?.data?.totalAmount).toFixed(2)
      //         : 0;
      //       this.totalUnitsConsumed = res?.data?.totalUnitsConsumed
      //         ? parseFloat(res?.data?.totalUnitsConsumed).toFixed(2)
      //         : 0;
      //     },
      //     (error) => {
      //       console.log(error);
      //     }
      //   );
      this.httpDataService
        .post(AppConstants.APIUrlGetRegisteredUsers, {
          // tenantId: this.selectedTenant.tenantId,
          startDate: Helper.getFormattedDate(this.startDate),
          endDate: Helper.getFormattedDate(this.endDate),
        })
        .subscribe(
          (res) => {
            this.registeredUser = res;
          },
          (error) => {
            console.log(error);
          }
        );
        console.log("TenantId : " + this.selectedTenant.tenantId);
      this.httpDataService
        .get(
          AppConstants.APIUrlGetGraphData +
            Helper.getFormattedDate(this.startDate) +
            '/' +
            Helper.getFormattedDate(this.endDate) +
            '/' +
            this.selectedTenant.tenantId +
            '/' +
            this.filterType
        )
        .subscribe(
          (res) => {
            console.log(res);
            // res?.data.revenueTraficResponse.sort(this.dateSort);
            // res?.data.unitsConsumeResponse.sort(this.dateSort);
            this.process1 = false;
            let totalAmountData: any = [];
            let totalTransactionsData: any = [];
            let newUserData: any = [];
            let newGuestUserData: any = [];
            this.finacialchartLabel = [];
            this.unitchartLabel = [];
            this.unitsConsumeResponse = [];
            this.finacialchartData = [];
            this.unitchartData = []

             //Transactions Bar Chart
             
              res?.data.revenueTraficResponse.forEach(
                (element: any, index: number) => {
                  this.chartLabel.push(element.transactionDate);
                
                  this.finacialchartLabel.push(element.transactionDate);
                  this.registerchartLabel.push(element.transactionDate);
  
                  // totalAmountData.push(
                  //   parseFloat(element.totalAmount).toFixed(2)
                  // );
                  totalTransactionsData.push(element.totalCompletedTransactions);               
                  
                  newUserData.push(element.newUser);
                  newGuestUserData.push(element.newGuestUser);
                  if (res.data.revenueTraficResponse.length - 1 === index) {
                    // if (this.isMasterAdmin) {
                      this.chartData = [
                        {
                          label: 'Total Revenue',
                          data: totalAmountData,
                          borderWidth: 1,
                        },
                        {
                          label: 'Transactions',
                          data: totalTransactionsData,
                          borderWidth: 1,
                        },
                        {
                          label: 'Registered User',
                          data: newUserData,
                          borderWidth: 1,
                        },
                        {
                          label: 'Guest User',
                          data: newGuestUserData,
                          borderWidth: 1,
                        },
                      ];
                      this.registerchartData = [
                        {
                          label: 'Registered User',
                          data: newUserData,
                          borderWidth: 1,
                        },
                      ];
                      this.finacialchartData = [
                        {
                          label: 'Transactions',
                          data: totalTransactionsData,
                          borderWidth: 1,
                        },
                      ];
                    // } else {
                    //   this.chartData = [
                    //     {
                    //       label: 'Total Revenue',
                    //       data: totalAmountData,
                    //       borderWidth: 1,
                    //     },
                    //     {
                    //       label: 'Transactions',
                    //       data: totalTransactionsData,
                    //       borderWidth: 1,
                    //     },
                    //   ];
                    // }
                  }
                }
              );
             
            // Unit Consumed Chart  
            
            for (let index = 0; index < res?.data.unitsConsumeResponse.length; index++) {
              this.unitsConsumeResponse.push(res?.data.unitsConsumeResponse[index].totalUnitsConsumed);
              this.unitchartLabel.push(res?.data.unitsConsumeResponse[index].transactionDate);
            }
            res?.data.unitsConsumeResponse.forEach(
              (element: any, index: number) => {
                
                // this.unitchartLabel.push(element.transactionDate);
                
                  // if (this.isMasterAdmin) {
                
                    this.unitchartData = [
                      {
                        label: 'Unit consumed',                    
                        data: this.unitsConsumeResponse,
                        borderWidth: 1,
                      },
                    ];
                  // } else {
                    this.chartData = [
                      {
                        label: 'Total Revenue',
                        data: totalAmountData,
                        borderWidth: 1,
                      },
                      {
                        label: 'Transactions',
                        data: totalTransactionsData,
                        borderWidth: 1,
                      },
                    ];
                  // }
                // }
              }
            );

            this.process1 = false;
           
            
          },
          (error) => {
            this.process1 = false;
            console.log(error);
          }
        );
        
    }
  }

  dateSort(a: any, b: any) {
    return new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime();
  }

  pageChanged(event: PageEvent) {
    this.tableProcess = true;
    this.pageSize = event.pageSize;
    this.pageNumber = event.pageIndex;
    this.getChargerData();
  }

  getChargerData() {
    this.dataSource.data = [];
    this.httpDataService
      .get(
        AppConstants.APIUrlGetChargerData +
          this.selectedTenant.tenantId +
          '/' +
          Number(this.pageNumber + 1) +
          '/' +
          this.pageSize
      )
      .subscribe(
        (res) => {
          this.dataSource.data = res.list;
          this.totalCount = res.totalCount;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.cdref.detectChanges();
          this.greenprocess = false;
          this.tableProcess = false;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  getOnlineChargers() {
    this.httpDataService
      .get(AppConstants.APIUrlGetOnlineChargers + this.selectedTenant.tenantId)
      .subscribe(
        (res) => {
          this.onlineChargers = res;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  getOfflineChargers() {
    this.httpDataService
      .get(AppConstants.APIUrlGetOfflineChargers + this.selectedTenant.tenantId)
      .subscribe(
        (res) => {
          this.offlineChargers = res;
        },
        (error) => {
          console.log(error);
        }
      );
  }
  viewFull(){
    this.displayStyle = 'block';
  }

  viewFullUnit(){
    
    this.UnitdisplayStyle = 'block';
  }

  ViewDateRange(){
    this.viewDateRange = 'block';
  }

  closePopupModal() {
    this.displayStyle = 'none';
    this.UnitdisplayStyle = 'none';
    this.viewDateRange = 'none';
  }
  goToSite() {
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

  selectDuration(event: any) {
    const selectedValue = event.value;
    this.selected = selectedValue;
    const currentDate = new Date();
    let startDate: Date;
    let endDate: Date;
  
    switch (selectedValue) {
      case 'thisweek':
        this.filterType = 'Daily';
        const dayOfWeek = currentDate.getDay();
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - dayOfWeek);
        this.isDatepickerDisabled = true;
        this.hideDaily = false;
        this.hideWeekly = true;
        this.hideMonthly = true;
        this.hideQuarterly = true;
        break;

      case 'last30Days':
        this.filterType = 'Daily';
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 30);
        this.isDatepickerDisabled = true;
        this.hideDaily = false;
        this.hideWeekly = false;
        this.hideMonthly = true;
        this.hideQuarterly = true;
        break;
  
      case 'last2Weeks':
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 14);
        this.isDatepickerDisabled = true;
        break;
  
      case 'lastWeek':
        this.filterType = 'Daily';
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 6);
        this.isDatepickerDisabled = true;
        this.hideDaily = false;
        this.hideWeekly = true;
        this.hideMonthly = true;
        this.hideQuarterly = true;
        break;
  
      case 'monthToDate':
        this.filterType = 'Daily';
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        this.isDatepickerDisabled = true;
        this.hideDaily = false;
        this.hideWeekly = false;
        this.hideMonthly = true;
        this.hideQuarterly = true;
        break;
  
      case 'yearToDate':
        this.filterType = 'Monthly';
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        this.isDatepickerDisabled = true;
        this.hideDaily = true;
        this.hideWeekly = true;        
        this.hideMonthly = false;
        this.hideQuarterly = false;
        break;
  
      case 'thisQuater':
        this.filterType = 'Monthly';
        const currentMonth = currentDate.getMonth();
        const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
        startDate = new Date(currentDate.getFullYear(), quarterStartMonth, 1);
        endDate = new Date(currentDate.getFullYear(), quarterStartMonth + 3, 0);        
        this.isDatepickerDisabled = true;
        this.hideDaily = true;
        this.hideWeekly = true;
        this.hideMonthly = false;        
        this.hideQuarterly = true;
        break; 

      case 'lastQuarter':
        this.filterType = 'Monthly';
        const lastQuarterStartMonth = (Math.floor((currentDate.getMonth() - 3) / 3) * 3);
        startDate = new Date(currentDate.getFullYear(), lastQuarterStartMonth, 1);
        endDate = new Date(currentDate.getFullYear(), lastQuarterStartMonth + 3, 0); 
        this.isDatepickerDisabled = true;
        this.hideDaily = true;
        this.hideWeekly = true;
        this.hideMonthly = false;
        this.hideQuarterly = true;
        break;

      case 'lastYear':
        this.filterType = 'Monthly';
        startDate = new Date(currentDate.getFullYear() - 1, 0, 1); // First day of last year
        endDate = new Date(currentDate.getFullYear() - 1, 11, 31); // Last day of last year
        this.isDatepickerDisabled = true;
        this.hideDaily = true;
        this.hideWeekly = true;
        this.hideMonthly = false;
        this.hideQuarterly = false;
        break;
           
      case 'custom':
        this.filterType = 'Daily';
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 1);
        this.isDatepickerDisabled = false;  
        this.hideDaily = false;
        this.hideWeekly = false;
        this.hideMonthly = false;
        this.hideQuarterly = false;   
        break;
    }
    if (startDate) {
      this.startDate = startDate;  
      this.endDate = endDate ? this.endDate = endDate : this.endDate = new Date(currentDate);        
     
    }
  }  

  selectType(event: any){
    this.filterType = event.value;
}
}
