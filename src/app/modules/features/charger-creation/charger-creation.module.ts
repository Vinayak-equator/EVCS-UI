import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChargerCreationRoutingModule } from './charger-creation-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ChargerCreationComponent } from './charger-creation.component';


@NgModule({
  declarations: [ChargerCreationComponent],
  imports: [
    SharedModule,
    CommonModule,
    ChargerCreationRoutingModule
  ]
})
export class ChargerCreationModule { }
