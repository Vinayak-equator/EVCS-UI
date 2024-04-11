import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
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
