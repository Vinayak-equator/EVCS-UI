import { throwError as observableThrowError, Observable } from 'rxjs';
import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(private http: HttpClient, private router: Router) { }

  // upload(formData: FormData) {
  //   return this.http.post<{ path: string }>(
  //     'https://localhost:5001/api/upload',
  //     formData
  //   );
  // }

  public upload(name: string, fileToUpload: any) {
		return this.http.post('' + name, fileToUpload).pipe(
			map((res: any) => {
				return res;
			}),
			catchError((res) => {
				if (res.status == 403) {
					this.router.navigate(['/session']);
				}
				return this.handleError(res);
			})
		);
	}

	private handleError(error: any) {
		const applicationError = error.headers.get('Application-Error');
		let modelStateErrors: any = '';
		modelStateErrors = modelStateErrors === '' ? null : modelStateErrors;
		return observableThrowError(applicationError || modelStateErrors || 'Server error');
	}
}
