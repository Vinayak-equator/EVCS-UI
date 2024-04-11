import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ChargePointUptimeReportComponent } from './chargepoint-uptime-report.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    ChargePointUptimeReportComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
  ]
})
export class ChargePointUptimeReportModule { }
