import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Supervisor_TicketService {

  service:string = 'supervisor/ticket';


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

  GetTicketsAsignados():Observable<any>{
    return this.http.get<any>(`${environment.apiUrl}/${this.service}/GetTicketsAsignados`);
  }

  VerDetalle(id:string): Observable<any> {
    //const params = new HttpParams().set('id', id);
    return this.http.get<any>(`${environment.apiUrl}/${this.service}/GetDetalle/${id}`);
  }

  AsignarTicket(request:any):Observable<any>{
    return this.http.post<any>(`${environment.apiUrl}/${this.service}/AsignarTicket`,request);
  }

  CancelarTicket(request:any):Observable<any>{
    return this.http.post<any>(`${environment.apiUrl}/${this.service}/CancelarTicket`,request);
  }

  EnEsperaTicket(request:any):Observable<any>{
    return this.http.post<any>(`${environment.apiUrl}/${this.service}/EnEsperaTicket`,request);
  }

  ResolverTicket(request:any):Observable<any>{
    return this.http.post<any>(`${environment.apiUrl}/${this.service}/ResolverTicket`,request);
  }
}