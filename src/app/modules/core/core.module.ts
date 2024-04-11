import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { MaterialModule } from 'src/app/material/material.module';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ContentWrapperComponent } from './components/content-wrapper/content-wrapper.component';
import { FooterComponent } from './components/footer/footer.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { LoaderComponent } from './components/loader/loader.component';

@NgModule({
  declarations: [
    ContentWrapperComponent,
    SidenavComponent,
    FooterComponent,
    NavbarComponent,
    LoaderComponent

  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: sideBarTranslateLoader,
        deps: [HttpClient]
      }
    }),
  ],
  exports: [
    ContentWrapperComponent,
    SidenavComponent,
    FooterComponent,
    NavbarComponent,
    LoaderComponent
  ],
  
})
export class CoreModule { }

export function sideBarTranslateLoader(http: HttpClient) {
  //return new TranslateHttpLoader(http, AppConstants.multiLanguagePath, '.json');
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}  
