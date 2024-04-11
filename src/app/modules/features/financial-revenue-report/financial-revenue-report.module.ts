import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FinancialRevenueReportComponent } from './financial-revenue-report.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    FinancialRevenueReportComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
  ]
})
export class FinancialRevenueReportModule { }
