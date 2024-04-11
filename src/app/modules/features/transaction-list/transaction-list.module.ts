import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransactionListRoutingModule } from './transaction-list-routing.module';
import { TransactionListComponent } from './transaction-list.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    TransactionListComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    TransactionListRoutingModule
  ]
})
export class TransactionListModule { }
