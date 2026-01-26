import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Cliente_Catalogos {

  service: string = 'cliente/catalogos';


  constructor(private http: HttpClient) { }


  GetRegimenesFiscales(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/${this.service}/getregimenfiscal`);
  }

  GetMunicipio(codigoPostal: string): Observable<any> {
    const params = new HttpParams()
      .set('codigoPostal', codigoPostal);

    return this.http.get<any>(`${environment.apiUrl}/${this.service}/getMunicipio`,{params});
  }

  GetMetodoPago(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/${this.service}/GetMetodoPago`);
  }

  GetFormaPago(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/${this.service}/GetFormaPago`);
  }

  GetMoneda(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/${this.service}/GetMoneda`);
  }

  GetExportacion(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/${this.service}/GetExportacion`);
  }

  GetUsoCfdi(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/${this.service}/GetUsoCfdi`);
  }

}