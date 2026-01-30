import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import { Cliente_Perfil } from 'app/services/cliente/cliente_perfil.service';
import { EmisorService } from 'app/core/emisor/emisor.service';

@Component({
  selector: 'app-emisor-switcher',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, MatIconModule],
  templateUrl: './emisor-switcher.component.html',
  styleUrls: ['./emisor-switcher.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmisorSwitcherComponent implements OnInit {
  emisores: any[] = [];
  selectedEmisorId: string | null = null;
  loading = false;

  constructor(
    private _perfil: Cliente_Perfil,
    private _emisorService: EmisorService,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.selectedEmisorId = this._emisorService.emisorId;

    this.loading = true;

    // OJO: asegúrate que este endpoint exista y regrese lista
    this._perfil.GetRazonesSociales().subscribe({
      next: (list) => {
        this.emisores = (list || []).filter((x: any) => x.activo !== false);

        // Si NO hay emisor seleccionado, toma default o el primero
        if (!this.selectedEmisorId) {
          const def = this.emisores.find((x: any) => x.esDefault) || this.emisores[0];
          if (def?.id) {
            this.selectedEmisorId = def.id;
            this._emisorService.setEmisorId(def.id);
          }
        }

        this._cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this._cdr.markForCheck();
      },
      complete: () => {
        this.loading = false;
        this._cdr.markForCheck();
      }
    });
  }

  changeEmisor(id: string): void {
    this.selectedEmisorId = id;
    this._emisorService.setEmisorId(id);
    this._cdr.markForCheck();
  }
}