import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../material/material.module';
import { CoreModule } from '../modules/core/core.module';
// import { LoaderInterceptor } from './utility/loader-interceptor.service';
import { ThreeDigitDecimalNumberDirective } from './directives/three-digit-decimal-number.directive';

@NgModule({
  declarations: [ThreeDigitDecimalNumberDirective],
  imports: [
    MaterialModule,
    RouterModule,
    CommonModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  exports: [
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ThreeDigitDecimalNumberDirective,
  ],

  providers: [
    ThreeDigitDecimalNumberDirective,
    // { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
  ],
})
export class SharedModule {}
