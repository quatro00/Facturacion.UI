import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Responsable_TicketService {

  service:string = 'responsable/ticket';


  constructor(private http:HttpClient) { }

  AgregarMensaje(request:any):Observable<any>{
    return this.http.post<any>(`${environment.apiUrl}/${this.service}/AgregarMensaje`,request);
  }

  AgregarArchivos(request:any):Observable<any>{
    return this.http.post<any>(`${environment.apiUrl}/${this.service}/AgregarArchivos`,request);
  }

  Crear(request:any):Observable<any>{
    return this.http.post<any>(`${environment.apiUrl}/${this.service}`,request);
  }

  GetTicketsAbiertos():Observable<any>{
    return this.http.get<any>(`${environment.apiUrl}/${this.service}/GetTicketsAbiertos`);
  }

  VerDetalle(id:string): Observable<any> {
    //const params = new HttpParams().set('id', id);
    return this.http.get<any>(`${environment.apiUrl}/${this.service}/GetDetalle/${id}`);
  }

}