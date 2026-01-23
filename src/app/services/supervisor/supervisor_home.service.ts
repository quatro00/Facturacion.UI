import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Supervisor_HomeService {

  service:string = 'supervisor/home';


  constructor(private http:HttpClient) { }

  IndicadoresPrincipales():Observable<any>{
    return this.http.get<any>(`${environment.apiUrl}/${this.service}/IndicadoresPrincipales`);
  }

  IndicadoresMensuales():Observable<any>{
    return this.http.get<any>(`${environment.apiUrl}/${this.service}/IndicadoresMensuales`);
  }
}