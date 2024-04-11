import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { PromoCodeRoutingModule } from './promo-code-details-routing.module';
import { PromoCodeDetailsComponent } from './promo-code-details.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    PromoCodeDetailsComponent
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
export class PromoCodeDetailsModule { }
