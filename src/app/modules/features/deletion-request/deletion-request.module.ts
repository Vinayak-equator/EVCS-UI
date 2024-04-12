import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PromoCodeRoutingModule } from './deletion-request-routing.module';
import { DeletionRequestComponent } from './deletion-request.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    DeletionRequestComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    PromoCodeRoutingModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
  ]
})
export class DeletionRequestModule { }
