import { environment } from '@env';
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HttpDataService } from './http-data.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  chargePointPushObj: any;
  signalRConnectionId:any;
  constructor(private readonly httpDataService: HttpDataService) { }
  private signalRData: any;

  private getDataConfig() {
      this.signalRData = {
          username: '',
          defaultgroup: 'AzureSignalR',
          checked: false,
          newMessage: '',
          connectionId: '',
          ready: false,
          groupName: "c37b75ae-3c04-4b2f-b0dd-bb1b9eb8478f"
      };
  }
  private getPushConnection() {
      return this.httpDataService.pushPost(environment.pushHostURL + '/api/negotiate?hubname=evchargepointhub', null);
  }

  signalRPushConnection(chargePointId='',tenantId='',connectorId='') {
      /* Register the PUSH Notification - SignalR */
      this.getDataConfig();
      this.getPushConnection().subscribe((res: any) => {

          res.accessToken = res.accessToken || res.accessKey;
          res.url = res.url || res.endpoint;
          this.signalRData.ready = true;

          const options = {
              accessTokenFactory: () => res.accessToken
          };

          // Build the SignalRConnection.
          const connection = this.signalRConnection(res, options);

          // Hooking the chargePoint Updated event
          this.chargePointPushObj = this.signalRPushNotification(connection);

          this.signalRCloseConnection(connection);

          // estabilsh  the SignalR connection
          console.log('connecting...');
          connection.start()
              .then(() => {
                  console.log('connected the SignalR!');
                  console.log(connection.connectionId);
                  this.signalRConnectionId = connection.connectionId;
                  this.pushNotificationGroupName(chargePointId, tenantId, connectorId);
              }
              )
              .catch(console.error);
      });
  }

  private signalRConnection(res: any, options: { accessTokenFactory: () => any; }) {
      return new signalR.HubConnectionBuilder()
          .withUrl(res.url, options)
          .configureLogging(signalR.LogLevel.Information)
          .build();
  }

  private signalRPushNotification(connection: signalR.HubConnection) {
      console.log(connection);
      connection.on('chargePointUpdated', (notification) => {
          this.chargePointPushObj = JSON.parse(notification);
      });
  }

  private signalRCloseConnection(connection: signalR.HubConnection) {
      connection.onclose(() => {
          console.log('disconnected the SignalR!');
      });
  }

// Getting data based on group name
pushNotificationGroupName(chargePointId:any,tenantId:any, connectorId:string):any {
  let postData = {
    connectionId: this.signalRConnectionId,
    connectorId: connectorId,
    chargePointId: chargePointId
  };
  this.postWithConnectionId(postData).subscribe((res:any) => {
    console.log(res);
  },
  (error)=>{
      console.table(error);
  })
}

postWithConnectionId(data:any): Observable<any> {
  return this.httpDataService.pushPost(environment.pushHostURL + '/api/addToGroup', data);
}
}