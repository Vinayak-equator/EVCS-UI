import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PromoCodeRoutingModule } from './promo-code-routing.module';
import { PromoCodeComponent } from './promo-code.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    PromoCodeComponent
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
export class PromoCodeModule { }
