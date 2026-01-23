import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Supervisor_CatCategoriaService {

  service: string = 'supervisor/catcategoria';


  constructor(private http: HttpClient) { }


  GetAll(): Observable<any> {
    let params = new HttpParams();
    
    return this.http.get<any>(`${environment.apiUrl}/${this.service}`);
  }

  GetById(id: any): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/${this.service}/${id}`);
  }


}