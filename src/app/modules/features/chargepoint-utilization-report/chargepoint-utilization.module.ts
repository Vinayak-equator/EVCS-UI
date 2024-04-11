import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ChargepointUtilizationReportComponent } from './chargepoint-utilization-report.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgChartsModule as ChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [
    ChargepointUtilizationReportComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    ChartsModule,
  ]
})
export class chargepoinutilizationreport { }
