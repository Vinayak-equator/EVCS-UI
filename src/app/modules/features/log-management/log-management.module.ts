import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SharedModule } from 'src/app/shared/shared.module';
import { LogManagementComponent } from './log-management.component';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  declarations: [
    LogManagementComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule
  ]
})
export class LogManagementModule { }
