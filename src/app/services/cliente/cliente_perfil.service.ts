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
  GetRazonesSociales() {
    return this.http.get<any[]>(`${environment.apiUrl}/cliente/perfil/razones-sociales`);
  }

  UpsertRazonSocial(payload: any) {
    return this.http.post<any>(`${environment.apiUrl}/cliente/perfil/razones-sociales`, payload);
  }

  DeleteRazonSocial(id: string) {
    return this.http.delete<void>(`${environment.apiUrl}/cliente/perfil/razones-sociales/${id}`);
  }

  EnviarSellos(razonSocialId: string, req: any) {
    return this.http.post<any>(
      `${environment.apiUrl}/cliente/perfil/razones-sociales/${razonSocialId}/sellos`,
      req
    );
  }

  SubirSellosAFacturama(razonSocialId: string, force = false) {
    return this.http.post<any>(
      `${environment.apiUrl}/cliente/perfil/razones-sociales/${razonSocialId}/sellos/subir-facturama?force=${force}`,
      {}
    );
  }

  GuardarSellos(razonSocialId: string, payload: any) {
  return this.http.post<any>(
    `${environment.apiUrl}/cliente/perfil/razones-sociales/${razonSocialId}/sellos`,
    payload
  );
}


  DescargarSellos(razonSocialId: string) {
    return this.http.get(
      `${environment.apiUrl}/cliente/perfil/razones-sociales/${razonSocialId}/sellos/descargar`,
      { responseType: 'blob' }
    );
  }

  SetDefaultRazonSocial(razonSocialId: string) {
  return this.http.post<any>(
    `${environment.apiUrl}/cliente/perfil/razones-sociales/${razonSocialId}/default`,
    {}
  );
}
}