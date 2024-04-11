import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateConfigService } from '@app/shared/services/translate-config.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { IndexedDBService } from '@app/shared/utility/indexed-db.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class NavbarComponent implements OnInit {
  hearderForm: FormGroup;

  languages = [
    { value: 'en', text: 'English' },
    { value: 'fr', text: 'French' },
    { value: 'es', text: 'Spanish' },
  ];

  loginDisplay = false; // Whether app has valid login.
  currentUsername?: string = ""; // current login user name
  lang: string = "en" // Default language is en.

  // This component is used for Navbar - Notifications, Name display, Initials
  constructor(private readonly formBuilder: FormBuilder,
    public translate: TranslateService, public router: Router,
    public translateConfigService: TranslateConfigService,
    private indexedDBService: IndexedDBService) {

    //Get the language value from the local session variable, if already set.
    if (localStorage.getItem('lang') != null && localStorage.getItem('lang') != "") {
      this.lang = localStorage.getItem('lang') + "";
    }
    translate.setDefaultLang(this.lang);
    this.translate.use(this.lang);
  }

  useLanguage(language: string): void {
    localStorage.setItem('lang', language);
    this.translate.use(language);
    this.translateConfigService.changeLocal(language);
  }
  showHideMenu() {
    var sidenav = document.getElementById("sidenav-main")
    var sidenavmain = document.getElementById("sidenav-main2")
    if(sidenav.classList.contains("hideNave")){
      sidenav.classList.remove("hideNave")
      sidenavmain.classList.remove("hideSidebar")
      document.getElementById("fullMenu").style.display = "block"
      document.getElementById("mobileMenu").style.display = "none"

      document.getElementById("iconlogo").style.display = "block"
      document.getElementById("iconlogomobile").style.display = "none"

      

      //fullMenu
      
    }else{
      sidenav.classList.add("hideNave")
      sidenavmain.classList.add("hideSidebar")
      document.getElementById("fullMenu").style.display = "none"
      document.getElementById("mobileMenu").style.display = "block"
      document.getElementById("iconlogo").style.display = "none"
      document.getElementById("iconlogomobile").style.display = "block"
    }

    
  }

  

  buildHeaderForm() {
    this.hearderForm = this.formBuilder.group({
      language: [''],
    });
  }

  ngOnInit() {
    this.buildHeaderForm();
    let sessionUser: any = JSON.parse(localStorage.getItem('user') || '');
    if (sessionUser) {
      this.currentUsername = sessionUser.name;
    }
  }

  selectOrg(){
    this.router.navigate(['/select-tenant']);
  }

  profile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    this.indexedDBService.deleteDatabase('PermissionDB');
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/']);
  }
}
