import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Cliente_Dashboard {

  service: string = 'cliente/dashboard';


  constructor(private http: HttpClient) { }

  getDashboard(payload: any): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrl}/${this.service}/GetDashboard`,
      payload
    );
  }
  

}