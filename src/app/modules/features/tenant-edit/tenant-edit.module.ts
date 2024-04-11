import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { TenantEditRoutingModule } from './tenant-edit-routing.module';
import { TenantEditComponent } from './tenant-edit.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';

@NgModule({
  declarations: [
    TenantEditComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    TenantEditRoutingModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    MatSelectModule
  ]
})
export class TenantEditModule { }
