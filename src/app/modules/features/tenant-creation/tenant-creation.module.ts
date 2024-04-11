import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TenantCreationRoutingModule } from './tenant-creation-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { TenantCreationComponent } from './tenant-creation.component';


@NgModule({
  declarations: [TenantCreationComponent],
  imports: [
    SharedModule,
    CommonModule,
    TenantCreationRoutingModule
  ]
})
export class TenantCreationModule { }
