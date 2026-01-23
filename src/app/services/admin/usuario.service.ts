import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  service: string = 'administrador/usuario';


  constructor(private http: HttpClient) { }

  Crear(request: FormData): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/${this.service}`, request);
  }

  GetAll(): Observable<any> {
    let params = new HttpParams();
    
    return this.http.get<any>(`${environment.apiUrl}/${this.service}`);
  }

  GetResponsables(): Observable<any> {
    let params = new HttpParams();
    
    return this.http.get<any>(`${environment.apiUrl}/${this.service}/GetResponsables`);
  }

  GetSupervisores(): Observable<any> {
    let params = new HttpParams();
    
    return this.http.get<any>(`${environment.apiUrl}/${this.service}/GetSupervisores`);
  }

  GetById(id: any): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/${this.service}/${id}`);
  }

  Desactivar(id: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/${this.service}/${id}/desactivar`, {});
  }

  Reactivar(id: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/${this.service}/${id}/activar`, {});
  }
  Update(id: string, request: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/${this.service}/${id}`, request);
  }

}