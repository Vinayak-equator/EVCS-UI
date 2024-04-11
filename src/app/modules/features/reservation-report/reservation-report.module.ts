import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgChartsModule as ChartsModule } from 'ng2-charts';
import { MatSortModule } from '@angular/material/sort';
import { ReservationReportComponent } from './reservation-report.component';

@NgModule({
  declarations: [
    ReservationReportComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSortModule,
    ChartsModule,
  ]
})
export class ReservationReportModule { }