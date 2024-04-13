import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SiteDashboardRoutingModule } from './site-dashboard-routing.module';
import { SiteDashboardComponent } from './site-dashboard.component';
import { SharedModule } from 'src/app/shared/shared.module';
// import { AgmCoreModule } from '@agm/core';
// import { AgmJsMarkerClustererModule } from '@agm/js-marker-clusterer';
// import { AgmSnazzyInfoWindowModule } from '@agm/snazzy-info-window';
import { GoogleMapsModule } from '@angular/google-maps'

@NgModule({
  declarations: [
    SiteDashboardComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    SiteDashboardRoutingModule,
    // AgmCoreModule.forRoot({
    // }),
    // AgmJsMarkerClustererModule,
    // AgmSnazzyInfoWindowModule,
    MatSlideToggleModule,
    GoogleMapsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA,NO_ERRORS_SCHEMA],
})
export class SiteDashboardModule { }
