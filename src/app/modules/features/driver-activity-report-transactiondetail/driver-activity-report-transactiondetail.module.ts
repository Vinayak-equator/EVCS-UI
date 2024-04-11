import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { SharedModule } from 'src/app/shared/shared.module';
import { DriverActivityReportTransactiondetailRoutingModule } from './driver-activity-report-transactiondetail-routing.module';
import { DriverActivityReportTransactiondetailComponent } from './driver-activity-report-transactiondetail.component';


@NgModule({
  declarations: [
    DriverActivityReportTransactiondetailComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    DriverActivityReportTransactiondetailRoutingModule,
    MatSlideToggleModule
  ]
})
export class DriverActivityReportTransactionDetailModule { }
