import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Supervisor_AreaService {

  service: string = 'supervisor/area';


  constructor(private http: HttpClient) { }

  GetAll(): Observable<any> {
    let params = new HttpParams();
    
    return this.http.get<any>(`${environment.apiUrl}/${this.service}`);
  }

  
  GetArbolAreas(organizacionId:string): Observable<any> {
    const params = new HttpParams().set('organizacionId', organizacionId);
    return this.http.get<any>(`${environment.apiUrl}/${this.service}/GetArbolAreas`, {params});
  }

  GetById(id: any): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/${this.service}/${id}`);
  }

  

}