import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
// import { AnalyticsRoutingModule } from './analytics-routing.module';
import { AnalyticsorgComponent } from './analyticsorg.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ChartsModule } from 'ng2-charts';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  declarations: [AnalyticsorgComponent],
  imports: [
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDi24pBs1U4kD1zu2EqoyYLwT2laJdl8h4',
    }),

    SharedModule,
    CommonModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    ChartsModule,
  ],
})
export class AnalyticsorgModule {}
