import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { ChargerEditRoutingModule } from './charger-edit-routing.module';
import { ChargerEditComponent } from './charger-edit.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    ChargerEditComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    ChargerEditRoutingModule,
    MatSlideToggleModule
  ]
})
export class CharerEditModule { }
