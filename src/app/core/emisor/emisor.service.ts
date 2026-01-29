import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface EmisorLite {
  id: string;
  rfc: string;
  razonSocial: string;
  esDefault?: boolean;
  activo?: boolean;
}

const LS_KEY = 'kbill.emisorId';

@Injectable({ providedIn: 'root' })
export class EmisorService {
  private _emisorId$ = new BehaviorSubject<string | null>(localStorage.getItem(LS_KEY));
  emisorId$ = this._emisorId$.asObservable();

  get emisorId(): string | null {
    return this._emisorId$.value;
  }

  setEmisorId(id: string | null): void {
    if (id) localStorage.setItem(LS_KEY, id);
    else localStorage.removeItem(LS_KEY);
    this._emisorId$.next(id);
  }
}
