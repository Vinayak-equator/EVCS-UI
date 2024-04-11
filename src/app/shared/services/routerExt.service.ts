import { Injectable } from '@angular/core';
import { Router, RouterEvent, NavigationEnd, RoutesRecognized } from '@angular/router';
import { KeyValue } from '@app/models/keyvalue';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, pairwise } from 'rxjs/operators';

/** A router wrapper, adding extra functions. */
@Injectable()
export class RouterExtService {

    private previousUrl: BehaviorSubject<string> = new BehaviorSubject<string>('');
    public previousUrl$: Observable<string> = this.previousUrl.asObservable();

    private routeValues: KeyValue[] = [];

    setRouteValue(Key: string, Value: string): void {
        this.routeValues.forEach((item) => {
            if (item.Key === Key) {
                item.Value = Value;

                localStorage.setItem('routeValues', btoa(JSON.stringify(this.routeValues)));

                return;
            }
        });
        // const item: KeyValue = { Key, Value }; //new KeyValue(){};
        this.routeValues.push({ Key, Value });
        localStorage.setItem('routeValues', btoa(JSON.stringify(this.routeValues)));
        return;
    }

    getRouteValue(Key: string): any {
        const routeValuesRaw: any = localStorage.getItem('routeValues')?.valueOf();
        let routeValues: KeyValue[] = [];
        if (routeValuesRaw != null && routeValuesRaw != undefined && routeValuesRaw.length > 0) {
            routeValues = (JSON.parse(atob(routeValuesRaw))) as KeyValue[];
        }
        let returnValue = '';
        routeValues.forEach((item) => {
            if (item.Key === Key) {
                returnValue = item.Value;
                return returnValue;
            }
        });
        return returnValue;
    }

    clearRouteValue(): void {
        this.routeValues = [];
        localStorage.removeItem('routeValues');
    }

    constructor(private router: Router) {
    }
}