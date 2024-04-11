import {
  NgModule,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  HttpClient,
  HttpClientModule,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { EVCSRootModule } from './modules/evcs-root.module';
import { SharedModule } from './shared/shared.module';
import { ToastrModule } from 'ngx-toastr';
import { MatConfirmDialogComponent } from './mat-confirm-dialog/mat-confirm-dialog.component';
import { AppConstants } from './constants';
import { MsalBroadcastService, MsalModule } from '@azure/msal-angular';
import { SignUpInvitationComponent } from './components/sign-up-invitation/sign-up-invitation.component';
import { AgmCoreModule } from '@agm/core';
import { AgmJsMarkerClustererModule } from '@agm/js-marker-clusterer';
import { AgmSnazzyInfoWindowModule } from '@agm/snazzy-info-window';
import { RouterExtService } from './shared/services/routerExt.service';
import { SignalRService } from './shared/services/signalr.service';
import { HttpTokenInterceptor } from './shared/utility/http-token.interceptor';
import { MatDeleteDialogComponent } from './mat-delete-dialog/mat-delete-dialog.component';
import { DataService } from './shared/services/data.service';
import { LoginComponent } from './login/login.component';
import { IndexedDBService } from '@app/shared/utility/indexed-db.service';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatTransferDialogComponent } from './mat-transfer-dialog/mat-transfer-dialog.component';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatSortModule } from '@angular/material/sort';
import { MatMerchantDialogComponent } from './mat-merchant-dialog/mat-merchant-dialog.component';
import { MaintainaceComponent } from './maintainace/maintainace.component';
import { MatLogDialogComponent } from './mat-log-dialog/mat-log-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    MatConfirmDialogComponent,
    SignUpInvitationComponent,
    MatDeleteDialogComponent,
    MatTransferDialogComponent,
    MatMerchantDialogComponent,
    LoginComponent,
    MaintainaceComponent,
    MatLogDialogComponent,
  ],
  imports: [
    SharedModule,
    AppRoutingModule,
    EVCSRootModule,
    MatTableModule,
    MatSortModule,
    HttpClientModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    MsalModule,
    ToastrModule.forRoot({
      closeButton: true,
      newestOnTop: false,
      progressBar: false,
      positionClass: 'toast-top-center',
      preventDuplicates: false,
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoader,
        deps: [HttpClient],
      },
    }),
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBwg_LyNB9AsizTdmTEX2gp-TydKCxFv84',
      libraries: ['places'],
    }),
    AgmJsMarkerClustererModule,
    AgmSnazzyInfoWindowModule,
    BrowserAnimationsModule,
    MatProgressBarModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: HttpTokenInterceptor, multi: true },
    MsalBroadcastService,
    RouterExtService,
    SignalRService,
    DataService,
    IndexedDBService,
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class AppModule {}

export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, AppConstants.multiLanguagePath, '.json');
}
