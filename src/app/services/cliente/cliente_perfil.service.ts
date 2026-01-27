import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Cliente_Perfil {

  service: string = 'cliente/perfil';


  constructor(private http: HttpClient) { }


  crearRazonSocial(payload: any): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrl}/${this.service}/crearRazonSocial`,
      payload
    );
  }

  GetRazonSocial(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/${this.service}/GetRazonSocial`);
  }

  enviarSellos(request: any) {
    return this.http.post(
      `${environment.apiUrl}/${this.service}/EnviarSellosDigitales`,
      request
    );
  }

  subirSellosAFacturama(force = false) {
  return this.http.post<any>(
   `${environment.apiUrl}/${this.service}/SubirSellosAFacturama`,
    {}
  );
}

  descargarSellos(): Observable<Blob> {
    return this.http.get(
     `${environment.apiUrl}/${this.service}/DescargarSellos`,
      {
        responseType: 'blob'
      }
    );
  }

}