import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Cliente_Factura {

  service: string = 'cliente/factura';


  constructor(private http: HttpClient) { }

  GetFacturas(params: any): Observable<any> {

    let httpParams = new HttpParams();

    if (params.from)
      httpParams = httpParams.set('from', params.from);

    if (params.to)
      httpParams = httpParams.set('to', params.to);

    if (params.status)
      httpParams = httpParams.set('status', params.status);

    if (params.type)
      httpParams = httpParams.set('type', params.type);

    if (params.currency)
      httpParams = httpParams.set('currency', params.currency);

    if (params.search)
      httpParams = httpParams.set('search', params.search);

    if (params.page !== undefined)
      httpParams = httpParams.set('page', params.page.toString());

    if (params.pageSize !== undefined)
      httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.http.get<any>(`${environment.apiUrl}/${this.service}/GetFacturas`, { params: httpParams });
  }


  /*
  downloadPdf(id: string, type: 'issued' | 'received' | 'payroll' = 'issued'): Observable<Blob> {
    const params = new HttpParams().set('type', type);
    return this.http.get(`${environment.apiUrl}/${this.service}/${id}/pdf`, { params, responseType: 'blob' });
  }
  */
  downloadPdf(id: string, type: 'issued' | 'received' | 'payroll' = 'issued'): Observable<HttpResponse<Blob>> {
    const params = new HttpParams().set('type', type);
    return this.http.get(`${environment.apiUrl}/${this.service}/${id}/pdf`, {
      params,
      responseType: 'blob',
      observe: 'response',
    });
  }

  downloadXml(id: string, type: 'issued' | 'received' | 'payroll' = 'issued'): Observable<HttpResponse<Blob>> {
    const params = new HttpParams().set('type', type);
    return this.http.get(`${environment.apiUrl}/${this.service}/${id}/xml`, {
      params,
      responseType: 'blob',
      observe: 'response',
    });
  }

  downloadZip(id: string, type: 'issued' | 'received' | 'payroll' = 'issued'): Observable<Blob> {
    const params = new HttpParams().set('type', type);
    return this.http.get(`${environment.apiUrl}/${this.service}/${id}/zip`, { params, responseType: 'blob' });
  }

   cancelCfdi(cfdiId: string, body: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/${this.service}/${encodeURIComponent(cfdiId)}/cancel`, body);
  }

}