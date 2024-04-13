import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AnalyticsRoutingModule } from './analytics-routing.module';
import { AnalyticsComponent } from './analytics.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgChartsModule } from 'ng2-charts';
// import { AgmCoreModule } from '@agm/core';
import { GoogleMapsModule } from '@angular/google-maps'

@NgModule({
  declarations: [AnalyticsComponent],
  imports: [
    // AgmCoreModule.forRoot({
    //   apiKey: 'AIzaSyDi24pBs1U4kD1zu2EqoyYLwT2laJdl8h4',
    // }),
    GoogleMapsModule,
    SharedModule,
    CommonModule,
    AnalyticsRoutingModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    NgChartsModule,
  ],
})
export class AnalyticsModule {}
