import { throwError as observableThrowError, Observable } from 'rxjs';
import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { AppConstants } from '@app/constants';
import Helper from './Helper';

@Injectable({
    providedIn: 'root'
})
export class GridFilterService {

    constructor(private http: HttpClient, private router: Router) { }

    filter(data: any, columnObj: any) {
        columnObj.filter((o: any) => {
            o.options = this.getFilterObject(data, o.columnProp);
        });
    }

    // Get Uniqu values from columns to build filter
    getFilterObject(fullObj: any, key: any): any[] {
        let obj: any[] = [];
        fullObj.filter((prop: any) => {
            if (!obj.includes(prop[key])) {
                if (key == 'location') {
                    let duplicateLocation = obj.filter(s => s.includes(prop[key].trim()));
                    if (duplicateLocation.length == 0) {
                        obj.push(prop.location);
                    }
                }
                else if (AppConstants.dateFormatColumnStringArray.includes(key)) {
                    if (!Helper.isNullOrEmpty(prop[key])) {
                        prop[key] = Helper.ConvertToLocalTime(prop[key]);
                        let duplicateDate = obj.filter(s => s.includes(prop[key].trim()));
                        if (duplicateDate.length == 0) {
                            obj.push(prop[key]);
                        }
                    }
                    else {
                        if (Helper.isNullOrEmpty(prop[key])) {
                            let duplicateEmpty = obj.filter(s => s.includes('Not Available'));
                            if (duplicateEmpty.length == 0) {
                                obj.push('Not Available');
                            }
                        }
                    }
                }
                else {
                    if (prop[key] == undefined || prop[key] == null) {
                        let stringArray = this.convertNumToStringArray(obj);
                        let duplicateEmpty = stringArray.filter((s: any) => s.includes('Not Available'));
                        if (duplicateEmpty.length == 0) {
                            obj.push('Not Available');
                        }
                    }
                    else {
                        obj.push(prop[key]);
                    }
                }
            }
            return prop;
        });
        // obj = obj.filter((el, i, a) => i === a.indexOf(el));
        return obj.sort();
    }

    convertNumToStringArray(dataNumbers: any): any {
        let new_data = []

        for (let i of dataNumbers) {
            new_data.push(i.toString());
        }
        return new_data;
    }

    // Custom filter method not Angular Material Datatable
    createFilter() {
        let filterFunction = function (data: any, filter: string): boolean {
            let searchTerms = JSON.parse(filter);
            let isFilterSet = false;
            for (const col in searchTerms) {
                if (searchTerms[col].toString() !== '') {
                    isFilterSet = true;
                } else {
                    delete searchTerms[col];
                }
            }

            let nameSearch = () => {
                let found = false;
                if (isFilterSet) {
                    for (const col in searchTerms) {
                        if (col.toString().toLowerCase() == 'location') {
                            let street = data.location;
                            if (searchTerms[col].toString().indexOf(street.trim().toString().toLowerCase()) != -1 && isFilterSet) {
                                found = true;
                            }
                        }
                        else {
                            // searchTerms[col].trim().toLowerCase().split(' ').forEach((word: any) => {
                            if (!Helper.isNullOrEmpty(data[col]) && data[col].toString().toLowerCase().indexOf(searchTerms[col].trim().toLowerCase()) != -1 && isFilterSet) {
                                found = true
                            }
                            else if (data[col] == null && searchTerms[col].trim().toLowerCase() == 'not available' && isFilterSet) {
                                found = true;
                            }
                            // });
                        }
                    }
                    return found
                } else {
                    return true;
                }
            }
            return nameSearch()
        }
        return filterFunction
    }

}