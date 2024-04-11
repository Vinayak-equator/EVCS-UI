import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { SiteCreationRoutingModule } from './site-creation-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SiteCreationComponent } from './site-creation.component';


@NgModule({
  declarations: [SiteCreationComponent],
  imports: [
    SharedModule,
    CommonModule,
    SiteCreationRoutingModule,
    MatSlideToggleModule
  ]
})
export class SiteCreationModule { }
