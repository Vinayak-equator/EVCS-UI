import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AppConstants } from '@app/constants';
import { ChargePoint } from '@app/models/chargepoint.model';
import { Connectors } from '@app/models/connectors.model';
import { HttpDataService } from '@app/shared/services/http-data.service';
import { RouterExtService } from '@app/shared/services/routerExt.service';
import { TranslateConfigService } from '@app/shared/services/translate-config.service';
import { GridFilterService } from '@app/shared/utility/grid-filter.service';
import Helper from '@app/shared/utility/Helper';
import { PopUpService } from '@app/shared/utility/popup.service';
import { Guid } from 'guid-typescript';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import {
  configurationKey,
  ConfigurationModel,
} from '@app/models/configuration.model';
import { environment } from '@env';
import { Transaction } from '@app/models/transaction.model';
import { IndexedDBService } from '@app/shared/utility/indexed-db.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDeleteDialogComponent } from '@app/mat-delete-dialog/mat-delete-dialog.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-charger-edit',
  templateUrl: './charger-edit.component.html',
  styleUrls: ['./charger-edit.component.css'],
})
export class ChargerEditComponent implements OnInit {
  tenantName: any;
  siteName: any;
  tenantId: Guid;
  chargerPoint: ChargePoint;
  siteId: Guid;
  chargePointId: any;
  chargerForm: FormGroup;
  triggerForm: FormGroup;
  firmwareForm: FormGroup;
  chargerMessageForm: FormGroup;
  chargerImageForm: FormGroup;
  // smartChargingForm: FormGroup;
  canUpdateChargepoint = false;
  canViewConnector = false;
  displayStyle = 'none';
  canViewConfiguration = false;
  canUpdateConfiguration = false;
  canViewOperation = false;
  canViewMessages = false;
  isTransferred = false;
  popUpData: string;

  process = false;
  selectedFiles: File[] = [];

  siteById: string;
  chargePointById: string;

  triggerConnector: number = 0;
  configurations: configurationKey[];

  @Input() max: any;
  maxDate = new Date();
  dialogRef: MatDialogRef<any>;

  connectors = [
    { value: 1, text: '1' },
    { value: 2, text: '2' },
  ];

  connectorStatus = [
    { value: AppConstants.Available, text: AppConstants.Available },
    { value: AppConstants.Occupied, text: AppConstants.Occupied },
    { value: AppConstants.Faulted, text: AppConstants.Faulted },
    { value: AppConstants.Offline, text: AppConstants.Offline },
  ];
  signalRConnectionId: string | null;
  IsDisabled: any;

  get name(): boolean {
    return (
      !Helper.isNullOrWhitespace(this.chargerForm.get('name')?.value) &&
      (this.chargerForm.get('name')?.value.length <= 3 ||
        this.chargerForm.get('name')?.value.length > 150)
    );
  }

  get status(): boolean {
    return (
      Helper.isNullOrEmpty(this.chargerPoint.status) ||
      this.chargerPoint.status == 'Offline'
    );
  }

  JSONData: any;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly httpDataService: HttpDataService,
    public translateConfigService: TranslateConfigService,
    public filterService: GridFilterService,
    private router: Router,
    private indexedDBService: IndexedDBService,
    private popUpService: PopUpService,
    public dialog: MatDialog,
    private routerExtService: RouterExtService,
    private location: Location,
    private cdref: ChangeDetectorRef,
  ) {
    this.chargerPoint = new ChargePoint();
  }

  dataSource = new MatTableDataSource();
  dataSource1 = new MatTableDataSource();
  displayedColumns: string[] = [
    'logTime',
    'id',
    'connector',
    'messageType',
    'result',
    'rawMessage',
  ];
  // displayedSmartColumns: string[] = [
  //   'chargePointId',
  //   'connector',
  //   'kwh',
  //   'startTime',
  //   'stopTime',
  // ];
  // @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatPaginator, { static: true })
  set paginator(value: MatPaginator) {
    if (this.dataSource) {
      this.dataSource.paginator = value;
    }
    if (this.dataSource1) {
      this.dataSource1.paginator = value;
    }
  }
  @ViewChild(MatSort) sort: MatSort;

  buildChargerForm() {
    this.chargerForm = this.formBuilder.group({
      name: [
        null,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(150),
        ],
      ],
      chargePointId: [null, [Validators.required]],
      numberOfConnectors: [null, [Validators.required]],
      chargerType: [null, [Validators.required]],
      availabilityStatus: [null, [Validators.required]],
      connector1Status: [null],
      connector1Meter: [null],
      connector2Status: [null],
      connector2Meter: [null],
      connectorType1: [null, []],
      connectorType2: [null, []],
      lastHeartBeatTime: [null, []],
      lastTransactionTimeC1: [null, []],
      lastTransactionTimeC2: [null, []],
    });

    (this.firmwareForm = this.formBuilder.group({
      location: [null],
    })),
      (this.triggerForm = this.formBuilder.group({
        messageType: [null, [Validators.required]],
        connectorId: [null, [Validators.required]],
      })),
      (this.chargerMessageForm = this.formBuilder.group({
        date: [null, [Validators.required]],
        messageConnectorId: [null, [Validators.required]],
      }));
      (this.chargerImageForm = this.formBuilder.group({
        chargerConnectorId: [null, [Validators.required]],
      }));
      // (this.smartChargingForm = this.formBuilder.group({
      //   chargerConnectorId: [null, [Validators.required]],
      //   startTime: [null, [Validators.required]],
      //   stopTime: [null, [Validators.required]],
      //   KWH: ['', [Validators.min(0), Validators.max(11)]],
      // }));
  }
  navigateBack() {
    // this.router.navigate([AppConstants.SiteEditUrl]);
    this.location.back();
  }
  ngOnInit(): void {
    this.indexedDBService
      .getRecordData('PermissionDB', 'permission', 'Charger Management')
      .then((data: any) => {
        data.previlleges.forEach((pp: any) => {
          if (pp.key === 'Update Chargepoint') {
            this.canUpdateChargepoint = pp.value;
          }
          if (pp.key === 'View Connector Details') {
            this.canViewConnector = pp.value;
          }
          if (pp.key === 'View Configuration Details') {
            this.canViewConfiguration = pp.value;
          }
          if (pp.key === 'Update Configuration Details') {
            this.canUpdateConfiguration = pp.value;
          }
          if (pp.key === 'View Operation Details') {
            this.canViewOperation = pp.value;
          }
          if (pp.key === 'View Messages') {
            this.canViewMessages = pp.value;
          }
        });
      })
      .catch((error) => {
        console.error(error);
      });
    this.isTransferred =
      localStorage.getItem('sitetransferred') === 'true' ? true : false;
    this.dataSource.data = [];
    this.dataSource1.data = [];
    this.buildChargerForm();
    this.tenantName = localStorage.getItem('tenantName');
    this.siteName = localStorage.getItem('siteName');
    this.chargePointId = localStorage.getItem('chargePointId');
    
    this.tenantId = this.routerExtService.getRouteValue(AppConstants.TenantID);
    if (!this.tenantId)
    {
      this.tenantId = JSON.parse(localStorage.getItem('selectedTenant') || '{}');
    }
    this.siteId = this.routerExtService.getRouteValue(AppConstants.SiteID);
    this.chargePointId = this.routerExtService.getRouteValue(
      AppConstants.ChargePointID
    );

    // this.activatedRoute.params.subscribe(params => {
    //   this.tenantId = params['tenantId'];
    //   this.siteId = params['siteId'];
    //   this.chargePointId = params['chargePointId'];
    // });
    this.siteById = this.tenantId.toString() + '/'+this.siteId
    // this.siteById = `${this.tenantId}/${this.siteId}`;
    this.chargePointById = this.siteById + '/' + this.chargePointId
    // this.chargePointById = `${this.tenantId}/${this.siteId}/${this.chargePointId}`;

    this.getChargePointById(this.chargePointById);

    const currentYear = moment().year();
    this.maxDate.setDate(this.maxDate.getDate());

    this.pushConnection();

    this.chargerMessageForm
      .get('messageConnectorId')
      ?.valueChanges.subscribe((x) => {
        console.log(x);
        this.dataSource.data = [];
      });

    this.chargerImageForm.get('chargerConnectorId')?.valueChanges.subscribe((x) => {
      this.dataSource1.data = [];
    });
    // this.smartChargingForm.get('chargerConnectorId')?.valueChanges.subscribe((x) => {
    //   this.dataSource1.data = [];
    // });
    // this.smartChargingForm.get('startTime')?.valueChanges.subscribe((x) => {
    //   this.dataSource1.data = [];
    // });
    // this.smartChargingForm.get('stopTime')?.valueChanges.subscribe((x) => {
    //   this.dataSource1.data = [];
    // });
    // this.smartChargingForm.get('KWH')?.valueChanges.subscribe((x) => {
    //   this.dataSource1.data = [];
    // });
      
  }

  getPushConnection() {
    return this.httpDataService.pushPost(
      environment.pushHostURL + AppConstants.pushHostEndpoint,
      null
    );
  }

  pushConnection() {
    /* Register the PUSH Notification - SignalR */
    const data = {
      username: '',
      defaultgroup: 'AzureSignalR',
      checked: false,
      newMessage: '',
      // messages: [],
      connectionId: '',
      ready: false,
      groupName: 'c37b75ae-3c04-4b2f-b0dd-bb1b9eb8478f',
    };

    const config = {
      headers: {
        'x-ms-signalr-userid': data.username,
      },
    };
    this.getPushConnection().subscribe((res: any) => {
      res.accessToken = res.accessToken || res.accessKey;
      res.url = res.url || res.endpoint;
      data.ready = true;

      const options = {
        accessTokenFactory: () => res.accessToken,
      };

      // Build the SignalRConnection.
      const connection = new signalR.HubConnectionBuilder()
        .withUrl(res.url, options)
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Hooking the chargePoint Updated event
      this.signalrPushNotification(connection);

      connection.onclose(() => {
        console.log('disconnected the SignalR!');
        this.popUpService.showMsg(
          AppConstants.SignalRDisconnected,
          AppConstants.EmptyUrl,
          AppConstants.Warning,
          AppConstants.Warning
        );
      });

      // estabilsh  the SignalR connection
      console.log('connecting...');
      connection
        .start()
        .then(() => {
          console.log('connected the SignalR!');
          this.signalRConnectionId = connection.connectionId;
          console.log(connection.connectionId);
          this.pushNotificationGroupName(connection);
        })
        .catch(console.error);
    });
  }

  signalrPushNotification(connection: signalR.HubConnection) {
    connection.on('chargePointUpdated', (notification) => {
      let chargePointPushObj: any = JSON.parse(notification);
      let newData = this.notificationObjToLocalObj(chargePointPushObj);
      console.log(chargePointPushObj);
    });
  }

  openPopup() {
    // this.displayStyle = "block";
    document.getElementById('ShowDetails').style.display = 'none';
    document.getElementById('ShowForm').style.display = 'block';
  }
  closePopup() {
    this.displayStyle = 'none';
  }
  // Getting data based on group name
  pushNotificationGroupName(connection: signalR.HubConnection) {
    let postData = {
      connectionId: connection.connectionId,
      tennantId: this.tenantId,
    };
    this.postWithConnectionId(postData).subscribe(
      (res: any) => {
        console.log(res);
      },
      (error) => {
        this.popUpService.showMsg(
          AppConstants.Error,
          AppConstants.EmptyUrl,
          AppConstants.Error,
          AppConstants.Error
        );
      }
    );
  }

  postWithConnectionId(data: any): Observable<any> {
    return this.httpDataService.pushPost(
      environment.pushHostURL + '/api/addToGroup',
      data
    );
  }

  notificationObjToLocalObj(chargePointPushObj: any) {
    let newData = new ChargePoint();
    if (
      this.tenantId.toString() == chargePointPushObj.tenantId &&
      this.siteId.toString() == chargePointPushObj.siteId &&
      this.chargePointId.toString() == chargePointPushObj.chargePointId
    ) {
      this.chargerPoint.siteId = chargePointPushObj.siteId;
      this.chargerPoint.tenantId = chargePointPushObj.tenantId;
      this.chargerPoint.name = chargePointPushObj.name;
      this.chargerPoint.numberOfConnectors =
        chargePointPushObj.numberOfConnectors ? chargePointPushObj.numberOfConnectors : chargePointPushObj.NumberOfConnectors;
      this.chargerPoint.status = chargePointPushObj.status;
      this.chargerPoint.availabilityStatus =
        chargePointPushObj.availabilityStatus;
      this.chargerPoint.chargerType = chargePointPushObj.chargerType;
      this.chargerPoint.chargePointId = chargePointPushObj.chargePointId;

      chargePointPushObj?.connectors.forEach(
        (currentConnector: Connectors, currentConnectorIndex: number) => {
          if (currentConnectorIndex == 1) {
            this.chargerPoint.connector1Id = currentConnector.id;
            this.chargerPoint.connector1Name = currentConnector.name;
            this.chargerPoint.connector1AuthorizationCode =
              currentConnector.authorizationCode;
            this.chargerPoint.connector1LastMeterTime = new Date(
              currentConnector.lastMeterTime
            ).toLocaleString('en-US', { timeZone: 'CST' });
            this.chargerPoint.connector1LastStatusTime = new Date(
              currentConnector.lastStatusTime
            ).toLocaleString('en-US', { timeZone: 'CST' });
            this.chargerPoint.connector1Status = currentConnector.status;
            this.chargerPoint.connector1LastMeter = currentConnector.meter;
          }
          if (
            currentConnectorIndex == 2 &&
            chargePointPushObj.numberOfConnectors >= 2
          ) {
            this.chargerPoint.connector2Id = currentConnector.id;
            this.chargerPoint.connector2Name = currentConnector.name;
            this.chargerPoint.connector2AuthorizationCode =
              currentConnector.authorizationCode;
            this.chargerPoint.connector2LastMeterTime = new Date(
              currentConnector.lastMeterTime
            ).toLocaleString('en-US', { timeZone: 'CST' });
            this.chargerPoint.connector2LastStatusTime = new Date(
              currentConnector.lastStatusTime
            ).toLocaleString('en-US', { timeZone: 'CST' });
            this.chargerPoint.connector2Status = currentConnector.status;
            this.chargerPoint.connector2LastMeter = currentConnector.meter;
          }
        }
      );
    }
    this.chargerForm
      .get('connector1Status')
      ?.setValue(this.chargerPoint.connector1Status);
    this.chargerForm
      .get('connector2Status')
      ?.setValue(this.chargerPoint.connector2Status);
    return newData;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource1.paginator = this.paginator;
    this.dataSource1.sort = this.sort;
  }

  getChargePointById(ids: any) {
    this.httpDataService
      .getById(AppConstants.APIUrlGetChargePointById, ids)
      .subscribe(
        (chargePoint: ChargePoint) => {
          this.chargerPoint.name = chargePoint.name;
          this.chargerPoint.numberOfConnectors = chargePoint.numberOfConnectors;
          this.IsDisabled = chargePoint.numberOfConnectors > 1 ? true : false;
          this.chargerPoint.availabilityStatus = chargePoint.availabilityStatus;
          this.chargerPoint.status = chargePoint.status;
          this.chargerPoint.chargePointId = chargePoint.chargePointId;
          this.chargerPoint.chargerType = chargePoint.chargerType;
          this.chargerPoint.info = chargePoint.info;
          this.chargerPoint.connectorType1 = chargePoint.connectorType1;
          this.chargerPoint.lastHeartBeatTime = chargePoint.lastHeartBeatTime;
          this.chargerPoint.lastTransactionTimeC1 = chargePoint.lastTransactionTimeC1;
          this.chargerPoint.lastTransactionTimeC2 = chargePoint.lastTransactionTimeC2;
          this.chargerPoint.connectorType2 = chargePoint.connectorType2;
          chargePoint?.connectors.forEach(
            (currentConnector: Connectors, currentConnectorIndex: number) => {
              if (currentConnectorIndex == 1) {
                this.chargerPoint.connector1Id = currentConnector.id;
                this.chargerPoint.connector1Name = currentConnector.name;
                this.chargerPoint.connector1AuthorizationCode =
                  currentConnector.authorizationCode;
                this.chargerPoint.connector1LastMeterTime =
                  currentConnector?.lastMeterTime
                    ? new Date(currentConnector.lastMeterTime).toLocaleString(
                        'en-US',
                        { timeZone: 'CST' }
                      )
                    : '';
                this.chargerPoint.connector1LastStatusTime =
                  currentConnector?.lastStatusTime
                    ? new Date(currentConnector.lastStatusTime).toLocaleString(
                        'en-US',
                        { timeZone: 'CST' }
                      )
                    : '';
                this.chargerPoint.connector1Status = currentConnector.status;
                this.chargerPoint.connector1LastMeter = currentConnector.meter;
              }
              if (
                currentConnectorIndex == 2 &&
                chargePoint.numberOfConnectors >= 2
              ) {
                this.chargerPoint.connector2Id = currentConnector.id;
                this.chargerPoint.connector2Name = currentConnector.name;
                this.chargerPoint.connector2AuthorizationCode =
                  currentConnector.authorizationCode;
                this.chargerPoint.connector2LastMeterTime =
                  currentConnector?.lastMeterTime
                    ? new Date(currentConnector.lastMeterTime).toLocaleString(
                        'en-US',
                        { timeZone: 'CST' }
                      )
                    : '';
                this.chargerPoint.connector2LastStatusTime =
                  currentConnector?.lastStatusTime
                    ? new Date(currentConnector.lastStatusTime).toLocaleString(
                        'en-US',
                        { timeZone: 'CST' }
                      )
                    : '';
                this.chargerPoint.connector2Status = currentConnector.status;
                this.chargerPoint.connector2LastMeter = currentConnector.meter;
              }
            }
          );
          // console.table(this.chargerPoint);
          this.setChargePoints(this.chargerPoint);
        },
        (error) => {
          if (!Helper.isNullOrWhitespace(error)) {
            if (!Helper.isNullOrWhitespace(error?.error?.errors)) {
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
          }
        }
      );
  }

  setChargePoints(chargePoint: ChargePoint) {
    this.chargerForm.setValue({
      name: chargePoint.name,
      numberOfConnectors: chargePoint.numberOfConnectors,
      availabilityStatus: chargePoint.availabilityStatus,
      chargePointId: chargePoint.chargePointId,
      chargerType: chargePoint.chargerType,
      connector1Status: chargePoint.connector1Status,
      connector1Meter: chargePoint.connector1LastMeter,
      connector2Status:
        chargePoint.connector2Status != null
          ? chargePoint.connector2Status
          : null,
      connector2Meter:
        chargePoint.connector2LastMeter != null
          ? chargePoint.connector2LastMeter
          : null,
      connectorType1:
        chargePoint.connectorType1 != null ? chargePoint.connectorType1 : null,
      lastHeartBeatTime:
        chargePoint.lastHeartBeatTime != null ? chargePoint.lastHeartBeatTime : null,        
      lastTransactionTimeC1:
        chargePoint.lastTransactionTimeC1 != null ? chargePoint.lastTransactionTimeC1 : null,
      lastTransactionTimeC2:
        chargePoint.lastTransactionTimeC2 != null ? chargePoint.lastTransactionTimeC2 : null,
      connectorType2:
        chargePoint.connectorType2 != null ? chargePoint.connectorType2 : null,
    });
  }

  cancel(IsCancel: any = '') {
    // localStorage.removeItem('chargePointId');
    document.getElementById('ShowDetails').style.display = 'block';
    document.getElementById('ShowForm').style.display = 'none';
    IsCancel == '' ? this.router.navigate([AppConstants.SiteEditUrl]) : '';
  }

  updateCharge() {
    this.mapChargePoint();
    if (
      this.chargerForm.dirty &&
      this.chargerForm.valid &&
      this.chargerForm.touched
    ) {
      this.putCharge(this.chargePointById, this.chargerPoint).subscribe(
        (result: any) => {
          this.chargerForm.markAsUntouched();
          this.popUpService.showMsg(
            AppConstants.ChargePointUpdatedMsg,
            AppConstants.SiteEditUrl,
            AppConstants.Success,
            AppConstants.Success
          );
          // this.getChargePointById(this.chargePointById);
          document.getElementById('ShowDetails').style.display = 'block';
          document.getElementById('ShowForm').style.display = 'none';
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
    } else {
      if (this.chargerForm.valid)
        this.popUpService.showMsg(
          AppConstants.NoChargerChanges,
          AppConstants.EmptyUrl,
          AppConstants.Warning,
          AppConstants.Warning
        );
    }
  }

  serverErrorMsgResponse(error: any): string {
    if (!Helper.isNullOrEmpty(error?.Message))
      return (this.popUpData = error.Message);
    else if (!Helper.isNullOrEmpty(error?.message))
      return (this.popUpData = error.message);
    else if (!Helper.isNullOrEmpty(error?.title))
      return (this.popUpData = error.title);
    else return (this.popUpData = error);
  }

  mapChargePoint() {
    if (this.chargerForm.valid) {
      this.chargerPoint.siteId = this.siteId.toString();
      this.chargerPoint.tenantId = this.tenantId.toString();
      this.chargerPoint.name = this.chargerForm.get('name')?.value.trim();
      this.chargerPoint.numberOfConnectors =
        this.chargerForm.get('numberOfConnectors')?.value;
      this.chargerPoint.availabilityStatus =
        this.chargerForm.get('availabilityStatus')?.value;
      this.chargerPoint.chargerType =
        this.chargerForm.get('chargerType')?.value;
      this.chargerPoint.chargePointId = this.chargePointId;
      this.chargerPoint.connectorType1 =
        this.chargerForm.get('connectorType1')?.value;
      this.chargerPoint.connectorType2 =
        this.chargerForm.get('connectorType2')?.value;
    }
  }

  connectorServerResponse(serverError: any) {
    if (!Helper.isNullOrWhitespace(serverError)) {
      if (!Helper.isNullOrWhitespace(serverError?.error?.errors)) {
        const validationErrors = serverError.error.errors;
        this.popUpData = '';
        Object.keys(validationErrors).forEach((prop: any, index: any) => {
          this.popUpData += validationErrors[prop].join(',');
        });
        this.popUpService.showMsg(
          this.popUpData,
          AppConstants.EmptyUrl,
          AppConstants.Error,
          AppConstants.Error
        );
      } else {
        if (serverError.error != null) {
          this.popUpData = this.serverErrorMsgResponse(serverError?.error);
          this.popUpService.showMsg(
            this.popUpData,
            AppConstants.EmptyUrl,
            AppConstants.Error,
            AppConstants.Error
          );
        } else {
          this.popUpData = serverError.statusText;
          this.popUpService.showMsg(
            this.popUpData,
            AppConstants.EmptyUrl,
            AppConstants.Error,
            AppConstants.Error
          );
        }
      }
    } else {
      this.popUpData = this.serverErrorMsgResponse(serverError?.error);
      this.popUpService.showMsg(
        this.popUpData,
        AppConstants.EmptyUrl,
        AppConstants.Error,
        AppConstants.Error
      );
    }
  }

  putCharge(ids: any, chargePoint: ChargePoint): Observable<ChargePoint> {
    return this.httpDataService.put(
      AppConstants.APIUrlChargeUpdate + ids,
      chargePoint
    );
  }

  updateConfigure(config: configurationKey) {
    const updateConfigData = {
      chargePointId: this.chargePointId,
      tenantId: this.tenantId,
      siteId: this.siteId,
      key: config.key,
      value: config.value,
    };
    this.putUpdateConfiguration(
      this.chargePointById,
      updateConfigData
    ).subscribe(
      (result: any) => {
        if (!Helper.isNullOrEmpty(result?.body)) {
          this.popUpService.showMsg(
            result?.body,
            AppConstants.EmptyUrl,
            AppConstants.Success,
            AppConstants.Success
          );
        } else
          this.popUpService.showMsg(
            AppConstants.UpdateConfigure,
            AppConstants.EmptyUrl,
            AppConstants.Success,
            AppConstants.Success
          );
      },
      (error) => {
        this.connectorServerResponse(error);
      }
    );
  }

  Trigger() {
    const triggerData = {
      chargePointId: this.chargePointId,
      tenantId: this.tenantId,
      siteId: this.siteId,
      connectorId: this.triggerForm.get('connectorId')?.value,
      message: this.triggerForm.get('messageType')?.value,
    };
    if (
      this.triggerForm.dirty &&
      this.triggerForm.valid &&
      this.triggerForm.touched
    ) {
      this.putTrigger(this.chargePointById, triggerData).subscribe(
        (result: any) => {
          if (!Helper.isNullOrEmpty(result?.body)) {
            this.popUpService.showMsg(
              result?.body,
              AppConstants.EmptyUrl,
              AppConstants.Success,
              AppConstants.Success
            );
          } else
            this.popUpService.showMsg(
              AppConstants.Trigger,
              AppConstants.EmptyUrl,
              AppConstants.Success,
              AppConstants.Success
            );
        },
        (error) => {
          this.connectorServerResponse(error);
        }
      );
    } else
      this.popUpService.showMsg(
        AppConstants.FillMandatoryFields,
        AppConstants.EmptyUrl,
        AppConstants.Warning,
        AppConstants.Warning
      );
  }

  connector1InOperative() {
    const ids: any = `${this.tenantId}/${this.siteId}/${this.chargePointId}/${this.chargerPoint.connector1Id}`;

    this.getConnectorInOperative(ids).subscribe(
      (result: any) => {
        if (!Helper.isNullOrEmpty(result)) {
          this.popUpService.showMsg(
            result,
            AppConstants.EmptyUrl,
            AppConstants.Success,
            AppConstants.Success
          );
        } else
          this.popUpService.showMsg(
            AppConstants.InOperative,
            AppConstants.EmptyUrl,
            AppConstants.Success,
            AppConstants.Success
          );
      },
      (error) => {
        this.connectorServerResponse(error);
      }
    );
  }

  connector1Operative() {
    const ids: any = `${this.tenantId}/${this.siteId}/${this.chargePointId}/${this.chargerPoint.connector1Id}`;

    this.getConnectorOperative(ids).subscribe(
      (result: any) => {
        if (!Helper.isNullOrEmpty(result)) {
          this.popUpService.showMsg(
            result,
            AppConstants.EmptyUrl,
            AppConstants.Success,
            AppConstants.Success
          );
        } else
          this.popUpService.showMsg(
            AppConstants.Operative,
            AppConstants.EmptyUrl,
            AppConstants.Success,
            AppConstants.Success
          );
      },
      (error) => {
        this.connectorServerResponse(error);
      }
    );
  }

  connector1Unlock() {
    if (!Helper.isNullOrEmpty(this.chargerPoint.connector1Id)) {
      const ids: any = `${this.tenantId}/${this.chargePointId}/${this.chargerPoint.connector1Id}`;
      this.getConnectorUnlock(ids).subscribe(
        (result: any) => {
          if (!Helper.isNullOrEmpty(result)) {
            this.popUpService.showMsg(
              result,
              AppConstants.EmptyUrl,
              AppConstants.Success,
              AppConstants.Success
            );
          } else
            this.popUpService.showMsg(
              AppConstants.Unlock,
              AppConstants.EmptyUrl,
              AppConstants.Success,
              AppConstants.Success
            );
        },
        (error) => {
          this.connectorServerResponse(error);
        }
      );
    } else {
      this.popUpData = 'No data for connector 1.';
      this.popUpService.showMsg(
        this.popUpData,
        AppConstants.EmptyUrl,
        AppConstants.Warning,
        AppConstants.Warning
      );
    }
  }

  connector1Start() {
    const connector1Data = {
      chargePointId: this.chargerPoint.chargePointId,
      connectorId: this.chargerPoint.connector1Id,
    };
    if (!Helper.hasElements(connector1Data)) {
      this.postConnectorStart(this.chargePointById, connector1Data).subscribe(
        (result: Transaction) => {
          if (!Helper.isNullOrEmpty(result)) {
            this.popUpService.showMsg(
              result?.startResult,
              AppConstants.EmptyUrl,
              AppConstants.Success,
              AppConstants.Success
            );
          } else
            this.popUpService.showMsg(
              AppConstants.Start,
              AppConstants.EmptyUrl,
              AppConstants.Success,
              AppConstants.Success
            );
        },
        (error) => {
          this.connectorServerResponse(error);
        }
      );
    } else {
      this.popUpData = 'No data for connector 1.';
      this.popUpService.showMsg(
        this.popUpData,
        AppConstants.EmptyUrl,
        AppConstants.Warning,
        AppConstants.Warning
      );
    }
  }

  connector1Stop() {
    const stopData = {
      chargePointId: this.chargerPoint.chargePointId,
      connectorId: this.chargerPoint.connector1Id,
    };
    this.postConnectorStop(this.chargePointById, stopData).subscribe(
      (result: any) => {
        if (!Helper.isNullOrEmpty(result)) {
          this.popUpService.showMsg(
            result,
            AppConstants.EmptyUrl,
            AppConstants.Success,
            AppConstants.Success
          );
        } else
          this.popUpService.showMsg(
            AppConstants.Stop,
            AppConstants.EmptyUrl,
            AppConstants.Success,
            AppConstants.Success
          );
      },
      (error) => {
        this.connectorServerResponse(error);
      }
    );
  }

  connector2InOperative() {
    const ids: any = `${this.tenantId}/${this.siteId}/${this.chargePointId}/${this.chargerPoint.connector2Id}`;

    this.getConnectorInOperative(ids).subscribe(
      (result: any) => {
        if (!Helper.isNullOrEmpty(result)) {
          this.popUpService.showMsg(
            result,
            AppConstants.EmptyUrl,
            AppConstants.Success,
            AppConstants.Success
          );
        } else
          this.popUpService.showMsg(
            AppConstants.InOperative,
            AppConstants.EmptyUrl,
            AppConstants.Success,
            AppConstants.Success
          );
      },
      (error) => {
        this.connectorServerResponse(error);
      }
    );
  }

  connector2Operative() {
    const ids: any = `${this.tenantId}/${this.siteId}/${this.chargePointId}/${this.chargerPoint.connector2Id}`;

    this.getConnectorOperative(ids).subscribe(
      (result: any) => {
        if (!Helper.isNullOrEmpty(result)) {
          this.popUpService.showMsg(
            result,
            AppConstants.EmptyUrl,
            AppConstants.Success,
            AppConstants.Success
          );
        } else
          this.popUpService.showMsg(
            AppConstants.Operative,
            AppConstants.EmptyUrl,
            AppConstants.Success,
            AppConstants.Success
          );
      },
      (error) => {
        this.connectorServerResponse(error);
      }
    );
  }

  connector2Start() {
    const connector2Data = {
      chargePointId: this.chargerPoint.chargePointId,
      connectorId: this.chargerPoint.connector2Id,
    };
    if (!Helper.hasElements(connector2Data)) {
      this.postConnectorStart(this.chargePointById, connector2Data).subscribe(
        (result: any) => {
          if (!Helper.isNullOrEmpty(result)) {
            this.popUpService.showMsg(
              result,
              AppConstants.EmptyUrl,
              AppConstants.Success,
              AppConstants.Success
            );
          } else
            this.popUpService.showMsg(
              AppConstants.Start,
              AppConstants.EmptyUrl,
              AppConstants.Success,
              AppConstants.Success
            );
        },
        (error) => {
          this.connectorServerResponse(error);
        }
      );
    } else {
      this.popUpData = 'No data for connector 2.';
      this.popUpService.showMsg(
        this.popUpData,
        AppConstants.EmptyUrl,
        AppConstants.Warning,
        AppConstants.Warning
      );
    }
  }

  connector2Stop() {
    const stopData = {
      chargePointId: this.chargerPoint.chargePointId,
      connectorId: this.chargerPoint.connector2Id,
    };
    this.postConnectorStop(this.chargePointById, stopData).subscribe(
      (result: any) => {
        if (!Helper.isNullOrEmpty(result)) {
          this.popUpService.showMsg(
            result,
            AppConstants.EmptyUrl,
            AppConstants.Success,
            AppConstants.Success
          );
        } else
          this.popUpService.showMsg(
            AppConstants.Stop,
            AppConstants.EmptyUrl,
            AppConstants.Success,
            AppConstants.Success
          );
      },
      (error) => {
        this.connectorServerResponse(error);
      }
    );
  }

  connector2Unlock() {
    if (!Helper.isNullOrEmpty(this.chargerPoint.connector2Id)) {
      const ids: any = `${this.tenantId}/${this.chargePointId}/${this.chargerPoint.connector2Id}`;
      this.getConnectorUnlock(ids).subscribe(
        (result: any) => {
          if (!Helper.isNullOrEmpty(result)) {
            this.popUpService.showMsg(
              result,
              AppConstants.EmptyUrl,
              AppConstants.Success,
              AppConstants.Success
            );
          } else
            this.popUpService.showMsg(
              AppConstants.Unlock,
              AppConstants.EmptyUrl,
              AppConstants.Success,
              AppConstants.Success
            );
        },
        (error) => {
          this.connectorServerResponse(error);
        }
      );
    } else {
      this.popUpData = 'No data for connector 2.';
      this.popUpService.showMsg(
        this.popUpData,
        AppConstants.EmptyUrl,
        AppConstants.Warning,
        AppConstants.Warning
      );
    }
  }

  UpdateFirmware() {
    const fireware = {
      chargePointId: this.chargerPoint.chargePointId,
      firmwareLocation: this.firmwareForm.get('location')?.value,
    };
    this.getUpdateFirmware(this.chargePointById, fireware).subscribe(
      (result: any) => {
        if (!Helper.isNullOrEmpty(result)) {
          this.popUpService.showMsg(
            result,
            AppConstants.EmptyUrl,
            AppConstants.Success,
            AppConstants.Success
          );
        } else
          this.popUpService.showMsg(
            AppConstants.UpdateFirmware,
            AppConstants.EmptyUrl,
            AppConstants.Success,
            AppConstants.Success
          );
      },
      (error) => {
        this.connectorServerResponse(error);
      }
    );
  }

  Diagnostics() {
    this.getDiagnostics(this.chargePointById).subscribe(
      (result: any) => {
        if (!Helper.isNullOrEmpty(result)) {
          this.popUpService.showMsg(
            result,
            AppConstants.EmptyUrl,
            AppConstants.Success,
            AppConstants.Success
          );
        } else
          this.popUpService.showMsg(
            AppConstants.Diagnostics,
            AppConstants.EmptyUrl,
            AppConstants.Success,
            AppConstants.Success
          );
      },
      (error) => {
        this.connectorServerResponse(error);
      }
    );
  }

  Messages() {
    let date = this.chargerMessageForm.get('date')?.value
      ? Helper.getFormattedDate(this.chargerMessageForm.get('date')?.value)
      : null;
    const connectorId =
      this.chargerMessageForm.get('messageConnectorId')?.value;
    const messagesById: any = `${this.chargePointId}/${connectorId}/${date}`;
    if (this.chargerMessageForm.valid) {
      this.getConnectorMessage(messagesById).subscribe(
        (result: any) => {
          if (!Helper.isNullOrEmpty(result?.messages)) {
            result?.messages.forEach(
              (currentObj: any, currentObjIndex: any) => {
                currentObj.id = result?.id;
                currentObj.chargePointId = result?.chargePointId;
                currentObj.connectorId = result?.connectorId;
              }
            );
            this.dataSource.data = result?.messages;
            // this.dataSource.data = [];
            // this.popUpService.showMsg('No response for messages', AppConstants.EmptyUrl);
          } else {
            // this.popUpService.showMsg(result?.message, AppConstants.EmptyUrl);
            this.dataSource.data = [];
          }
        },
        (error) => {
          this.connectorServerResponse(error);
        }
      );
    } else
      this.popUpService.showMsg(
        AppConstants.FillMandatoryFields,
        AppConstants.EmptyUrl,
        AppConstants.Warning,
        AppConstants.Warning
      );
  }

  reset() {
    const chargePointById: any = `${this.tenantId}/${this.siteId}/${this.chargePointId}`;
    this.getReset(chargePointById).subscribe(
      (result: any) => {
        if (!Helper.isNullOrEmpty(result)) {
          this.popUpService.showMsg(
            result,
            AppConstants.EmptyUrl,
            AppConstants.Success,
            AppConstants.Success
          );
        } else
          this.popUpService.showMsg(
            AppConstants.Reset,
            AppConstants.EmptyUrl,
            AppConstants.Success,
            AppConstants.Success
          );
      },
      (error) => {
        this.connectorServerResponse(error);
      }
    );
  }

  jsonPopUp(jsonData: any) {
    let all = JSON.parse(jsonData);
    let payLoad = JSON.parse(all.JsonPayload);
    Object.keys(all).forEach((prop) => {
      if (prop == 'JsonPayload') {
        all['JsonPayload'] = '';
        all['JsonPayload'] = payLoad;
      }
    });
    this.popUpService.showMsg(
      all,
      AppConstants.EmptyUrl,
      'JSON Message',
      AppConstants.Success,
      'Json'
    );
  }

  clearCache() {
    const chargePointById: any = `${this.tenantId}/${this.siteId}/${this.chargePointId}`;
    this.getClearCache(chargePointById).subscribe(
      (result: any) => {
        if (result.length == 0) {
          this.popUpService.showMsg(
            'No response for clear',
            AppConstants.EmptyUrl,
            AppConstants.Success,
            AppConstants.Success
          );
        } else if (!Helper.isNullOrEmpty(result?.message)) {
          this.popUpService.showMsg(
            result?.message,
            AppConstants.EmptyUrl,
            AppConstants.Success,
            AppConstants.Success
          );
        } else
          this.popUpService.showMsg(
            result,
            AppConstants.EmptyUrl,
            AppConstants.Success,
            AppConstants.Success
          );
      },
      (error) => {
        this.connectorServerResponse(error);
      }
    );
  }

  getChargeConfigure(chargePointById: any): Observable<any> {
    return this.httpDataService.get(
      AppConstants.APIUrlChargeConfigure + chargePointById
    );
  }

  getDiagnostics(ids: any): Observable<any> {
    return this.httpDataService.get(
      AppConstants.APIUrlConnectorDiagnostics + ids
    );
  }

  getUpdateFirmware(ids: any, firmware: any): Observable<any> {
    return this.httpDataService.put(
      AppConstants.APIUrlUpdatefirmware + ids,
      firmware
    );
  }

  getClearCache(chargePointById: any): Observable<any> {
    return this.httpDataService.get(AppConstants.APIUrlClear + chargePointById);
  }

  putUpdateConfiguration(ids: any, updateConfigureData: any): Observable<any> {
    return this.httpDataService.put(
      AppConstants.APIUrlUpdateConfig + ids,
      updateConfigureData
    );
  }

  putTrigger(ids: any, triggerData: any): Observable<any> {
    return this.httpDataService.put(
      AppConstants.APIUrlTrigger + ids,
      triggerData
    );
  }

  postConnectorStart(ids: any, startData: any): Observable<any> {
    return this.httpDataService.post(
      AppConstants.APIUrlConnectorStart + ids,
      startData
    );
  }

  postConnectorStop(ids: any, stopData: any): Observable<ChargePoint> {
    return this.httpDataService.post(
      AppConstants.APIUrlConnectorStop + ids,
      stopData
    );
  }

  getConnectorUnlock(ids: any): Observable<ChargePoint> {
    return this.httpDataService.get(AppConstants.APIUrlConnectorUnlock + ids);
  }

  getConnectorInOperative(ids: any): Observable<ChargePoint> {
    return this.httpDataService.get(
      AppConstants.APIUrlConnectorInOperative + ids
    );
  }

  getConnectorOperative(ids: any): Observable<ChargePoint> {
    return this.httpDataService.get(
      AppConstants.APIUrlConnectorOperative + ids
    );
  }

  getConnectorMessage(messagesById: any): Observable<any> {
    return this.httpDataService.get(AppConstants.APIUrlMessages + messagesById);
  }

  getReset(chargePointById: any): Observable<any> {
    return this.httpDataService.get(
      AppConstants.APIUrlConnectorReset + chargePointById
    );
  }

  selectedTabValue(events: any) {
    if (events == 'Configuration' && this.chargerPoint.status == AppConstants.Online) {
      this.getChargeConfigure(this.chargePointById).subscribe(
        (result: ConfigurationModel) => {
          if (
            !Helper.isNullOrEmpty(result?.configurationKey) &&
            result?.configurationKey.length > 0
          ) {
            this.configurations = result.configurationKey;
          } else if (!Helper.isNullOrEmpty(result)) {
            this.popUpService.showMsg(
              result,
              AppConstants.EmptyUrl,
              AppConstants.Success,
              AppConstants.Success
            );
          } else
            this.popUpService.showMsg(
              'No response for configure',
              AppConstants.EmptyUrl,
              AppConstants.Success,
              AppConstants.Success
            );
        },
        (error) => {
          this.connectorServerResponse(error);
        }
      );
    } else if (events == 'Message') {
    // } else if (events == 'smartCharging') {
    //   this.process = true
    //   this.httpDataService.get(AppConstants.APIUrlGetAllSmartCharging + '/' + this.chargePointId).subscribe((res) => {
    //     let data: any = [];
    //     data = res 
    //     this.dataSource1.data = data   
    //     this.process = false;
    //     this.dataSource1.paginator = this.paginator;
    //     this.dataSource1.sort = this.sort;
    //     this.cdref.detectChanges();       
    //   });
    }
  }

  find() {
    this.Messages();
  }

  serverError(validationErrors: any) {
    Object.keys(validationErrors).forEach((prop) => {
      const formControl = this.chargerForm.get(prop);
      if (formControl) {
        formControl.setErrors({
          serverError: validationErrors[prop].join(','),
        });
      }
    });
  }

  deactivate() {
    this.dialogRef = this.dialog.open(MatDeleteDialogComponent, {
      width: '450px',
      panelClass: 'confirm-dialog-container',
      data: {
        title: 'Are you sure, you want to deactivate the chargepoint ?',
      },
    });
    this.dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.httpDataService
          .get(AppConstants.APIUrlDeactivateChargePoint + this.chargePointId)
          .subscribe(
            (res) => {
              this.popUpService.showMsg(
                this.chargePointId + ' Deactivated.',
                AppConstants.EmptyUrl,
                AppConstants.Success,
                AppConstants.Success
              );
              this.cancel();
            },
            (err) => {
              this.popUpService.showMsg(
                'Deactivation Failed.',
                AppConstants.EmptyUrl,
                AppConstants.Error,
                AppConstants.Error
              );
            }
          );
      }
    });
  }

  onFileSelected(event: any) {
    this.selectedFiles = event.target.files;
  }

  onUpload() {
    this.process = true;
    const formData = new FormData();
    for (let file of this.selectedFiles) {
      formData.append('images', file);     
    }
    formData.append('chargePointId', this.chargePointId);
    formData.append('connectorId', this.chargerImageForm.get('chargerConnectorId')?.value);
    this.httpDataService.upload(AppConstants.APIUrlChargerImgUpload, formData).subscribe(
      (response) => {
        this.process = false;
        this.popUpService.showMsg(AppConstants.imgUpload, '/charger-edit', AppConstants.Success, AppConstants.Success);
        console.log('Images uploaded successfully');
      },
      (error) => {
        this.process = false;
        this.popUpService.showMsg(error, AppConstants.EmptyUrl, AppConstants.Warning, AppConstants.Warning);
        console.error('Error uploading images:', error);
      }
    );
  }

  // onSubmit() {
  //   if (this.smartChargingForm.valid) {
  //     this.process = true;
  //     this.httpDataService.post(AppConstants.APIUrlSmartCharging ,{
  //       'chargePointId': this.chargePointId,
  //       'connectorId': this.smartChargingForm.get('chargerConnectorId')?.value,
  //       'startTime': this.smartChargingForm.get('startTime')?.value,
  //       'stopTime': this.smartChargingForm.get('stopTime')?.value,
  //       'KWH': this.smartChargingForm.get('KWH')?.value
  //     }).subscribe(
  //       (response) => {
  //         this.process = false;
  //         this.popUpService.showMsg(AppConstants.smartCharging, '/charger-edit', AppConstants.Success, AppConstants.Success);
  //       },
  //       (error) => {
  //         this.process = false;
  //         this.popUpService.showMsg(error, AppConstants.EmptyUrl, AppConstants.Warning, AppConstants.Warning);
  //         console.error('Error Submitting Smart charging:', error);
  //       }
  //     ); 
  //   }
  //   else {
  //     this.process = false;
  //       this.popUpService.showMsg(AppConstants.FillMandatoryFields, '/charger-edit', AppConstants.Warning, AppConstants.Warning);
  //   }
  // }
}
