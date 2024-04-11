import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
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
