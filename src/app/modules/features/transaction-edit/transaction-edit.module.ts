import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransactionEditRoutingModule } from './transaction-edit-routing.module';
import { TransactionEditComponent } from './transaction-edit.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    TransactionEditComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    TransactionEditRoutingModule
  ]
})
export class TransactionEditModule { }
