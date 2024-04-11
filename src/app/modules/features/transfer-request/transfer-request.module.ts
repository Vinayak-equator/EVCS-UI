import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TransferRequestRoutingModule } from './transfer-request-routing.module';
import { TransferRequestComponent } from './transfer-request.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    TransferRequestComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    TransferRequestRoutingModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
  ]
})
export class TransferRequestModule { }
