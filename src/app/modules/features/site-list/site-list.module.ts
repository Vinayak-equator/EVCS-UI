import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SiteListRoutingModule } from './site-list-routing.module';
import { SiteListComponent } from './site-list.component';


@NgModule({
  declarations: [
    SiteListComponent
  ],
  imports: [
    CommonModule,
    SiteListRoutingModule
  ]
})
export class SiteListModule { }
