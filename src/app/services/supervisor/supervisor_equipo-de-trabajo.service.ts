import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Supervisor_EquipoDeTrabajoService{
  service:string = 'supervisor/equipotrabajo';


  constructor(private http:HttpClient) { }

  GetAgentesByResponsable(): Observable<any> {
    //const params = new HttpParams().set('ticketId', ticketId);
    return this.http.get<any>(`${environment.apiUrl}/${this.service}/GetAgentesByResponsable`);
  }

}