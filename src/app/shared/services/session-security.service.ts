import { Injectable } from '@angular/core';
import Helper from '../utility/Helper';

@Injectable({
  providedIn: 'root'
})
export class SessionSecurityService {

  constructor() { }

  public setObject<T>(value: T, key: string) {
		if (value) {
			let setData = JSON.stringify(value);
			localStorage.setItem(key, setData);
		} else {
			localStorage.removeItem(key);
		}
	}

  public getObject<T>(key: string): T | null {
		let setData = localStorage.getItem(key);
		if (setData && Helper.hasAny(setData)) {
			return JSON.parse(setData) as T;
		}
		return null;
	}

}
