import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslateConfigService {

  localEvent = new Subject<string>();
  teams$ = new BehaviorSubject<string>('en');

  constructor(private translateService: TranslateService, private translate: TranslateService,) { this.translateService.use('en'); }

  changeLocal(local:string){
    this.translateService.use(local);
    this.localEvent.next(local);
  }
  lang = localStorage.getItem('lang');
  
  getTeams(): Observable<string> {
    return this.teams$;
  }

  getTranslate(): Observable<string>{
    this.translate.get('singleBinding.itemPage').subscribe(data=>{this.teams$ = data});
    return this.teams$
  }
}
