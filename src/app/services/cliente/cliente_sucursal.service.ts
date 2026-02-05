import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

export interface SerieFolioPreviewDto {
  serie: string;
  folio: number;
  expeditionPlace?: string | null; // opcional
}

export interface SucursalDetalle {
    id: string;
    codigo: string;
    nombre: string;
    activo: boolean;
    telefono?: string | null;
    email?: string | null;

    codigoPostal?: string | null;
    municipio?: string | null;
    estado?: string | null;
    colonia?: string | null;
    calle?: string | null;
    noInterior?: string | null;
    noExterior?: string | null;

    rowVersion: string;

    razonesSociales: {
        id: string; // RazonSocialId
        rfc: string;
        razonSocial: string;
        esDefault: boolean;
        activo: boolean;
    }[];
}

@Injectable({
    providedIn: 'root'
})
export class Cliente_Sucursal {

    service: string = 'cliente/sucursal';


    constructor(private http: HttpClient) { }

    CreateSucursal(payload: any) {
        return this.http.post<any>(`${environment.apiUrl}/${this.service}`, payload);
    }

    ToggleSucursal(id: string, activo: boolean): Observable<any> {
        return this.http.patch<any>(
            `${environment.apiUrl}/${this.service}/${id}/activo`,
            { activo }
        );
    }

    GetSucursales(params: any) {

        let httpParams = new HttpParams();

        Object.keys(params).forEach(key => {
            const value = params[key];

            if (
                value !== null &&
                value !== undefined &&
                value !== '' &&
                value !== 'ALL'
            ) {
                httpParams = httpParams.set(key, value);
            }
        });

        return this.http.get<{
            total: number;
            items: any[];
        }>(
            `${environment.apiUrl}/${this.service}`,
            { params: httpParams }
        );
    }

    GetSucursalById(id: string): Observable<SucursalDetalle> {
        return this.http.get<SucursalDetalle>(`${environment.apiUrl}/${this.service}/${id}`);
    }

    UpdateSucursal(id: string, payload: any): Observable<SucursalDetalle> {
        return this.http.put<SucursalDetalle>(`${environment.apiUrl}/${this.service}/${id}`, payload);
    }

    GetSerieFolioSiguiente(sucursalId: string, conceptoSerie: string): Observable<SerieFolioPreviewDto> {
  const params = new HttpParams().set('conceptoSerie', conceptoSerie);

  return this.http.get<SerieFolioPreviewDto>(
    `${environment.apiUrl}/${this.service}/${sucursalId}/serie-folio`,
    { params }
  );
}
    
}