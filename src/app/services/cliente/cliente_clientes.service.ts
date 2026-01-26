import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Cliente_Clientes {

  service: string = 'cliente/cliente';


  constructor(private http: HttpClient) { }


  CrearCliente(payload: any): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrl}/${this.service}`,
      payload
    );
  }

  Get(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/${this.service}`);
  }

}