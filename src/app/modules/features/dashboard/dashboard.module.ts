import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { HttpDataService } from 'src/app/shared/services/http-data.service';


@NgModule({
  declarations: [DashboardComponent],
  imports: [
    SharedModule,
    CommonModule,
    DashboardRoutingModule,
    MatSlideToggleModule
  ],
  providers: [HttpDataService],
})
export class DashboardModule { }
