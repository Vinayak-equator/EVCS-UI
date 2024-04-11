import { environment } from '@env';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class HttpDataService {

  private readonly baseUrl: string = '';
  tenantUser: string;

  constructor(private readonly http: HttpClient) {
    this.baseUrl = environment.apiBaseUrl;
  }

  private pushPostHeader = new HttpHeaders({ 'x-ms-signalr-userid': '' });

  private getHeaders = new HttpHeaders({
    Accept: 'application/json',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    'accept-language': 'en-US,en;q=0.8',
    Expires: 'Sat, 01 Jan 2000 00:00:00 GMT',
  });

  private postHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    'accept-language': 'en-US,en;q=0.8',
    Expires: 'Sat, 01 Jan 2000 00:00:00 GMT',
  });

  private putHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    'accept-language': 'en-US,en;q=0.8',
    Expires: 'Sat, 01 Jan 2000 00:00:00 GMT',
  });

  private deleteHeaders = new HttpHeaders({
    Accept: 'application/json',
    'accept-language': 'en-US,en;q=0.8',
  });

  private handleError<T>(
    operation = 'operation',
    result?: T
  ): (error: any) => Observable<T> {
    return (error: any): Observable<T> => {
      console.error(error);

      return of(result as T);
    };
  }

  get(apiUrl: string): Observable<any> {
    return this.getRequest(this.baseUrl + apiUrl);
  }

  getById(apiUrl: string, id: any): Observable<any> {
    return this.getRequest(this.baseUrl + apiUrl + id);
  }

  getRequest(url: string): Observable<any> {
    return this.http
      .get<any>(url, { headers: this.getHeaders, observe: 'response' })
      .pipe(map((result: any) => this.requestSuccessful(result)));
  }

  upload(apiUrl: string, model: any): Observable<any> {
    return this.http.post(this.baseUrl + apiUrl, model);
  }

  siteUpdate(apiUrl: string, model: any): Observable<any> {
    return this.http.put(this.baseUrl + apiUrl, model);
  }

  pushPost(apiUrl: string, model: any): Observable<any> {
    return this.http.post(apiUrl, model, { headers: this.pushPostHeader });
  }

  post(apiUrl: string, model: any): Observable<any> {
    return this.postRequest(this.baseUrl, apiUrl, model);
  }

  postRequest(url: string, apiUrl: string, model: any): Observable<any> {
    return this.http
      .post(url + apiUrl, JSON.stringify(model), {
        headers: this.postHeaders,
        observe: 'response',
      })
      .pipe(map((result) => this.requestSuccessful(result)));
  }

  put(apiUrl: string, model: any): Observable<any> {
    return this.putRequest(this.baseUrl, apiUrl, model);
  }

  putRequest(url: string, apiUrl: string, model: any): Observable<any> {
    return this.http.put(url + apiUrl, JSON.stringify(model), {
      headers: this.putHeaders,
      observe: 'response',
    });
  }

  delete(name: string): Observable<any> {
    return this.deleteRequest(this.baseUrl, name).pipe(
      tap((data) => console.log('Deleted ')),
      catchError(this.handleError<any>('Deleted'))
    );
  }

  deleteRequest(url: string, name: string): Observable<any> {
    return this.http
      .delete(url + name, { observe: 'response' })
      .pipe(map((result) => this.requestSuccessful(result)));
  }

  requestSuccessful(result: any): any {
    if (
      result.headers.get('ExpiresUTC') != null ||
      result.headers.get('ExpiresUTC') !== ''
    ) {
    }
    return result.body;
  }

  country(apiUrl: string): Observable<any> {
    return this.http.get<any>(apiUrl);
  }
}
