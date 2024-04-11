import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { SiteEditRoutingModule } from './site-edit-routing.module';
import { SiteEditComponent } from './site-edit.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    SiteEditComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    SiteEditRoutingModule,
    MatSlideToggleModule
  ]
})
export class SiteEditModule { }
