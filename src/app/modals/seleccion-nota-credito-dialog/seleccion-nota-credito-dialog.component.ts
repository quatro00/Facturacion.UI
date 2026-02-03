import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { Cliente_Factura } from 'app/services/cliente/cliente_factura.service';
import { CfdiCreadoDto } from 'app/shared/models/cliente_facturacion/facturacion.models';
import { EmisorService } from 'app/core/emisor/emisor.service';

type OpcionNC = 'DEVOLUCION' | 'DESCUENTO';
type TipoDevolucion = 'TOTAL' | 'PARCIAL';

@Component({
  selector: 'app-seleccion-nota-credito-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    MatDialogModule,
    MatButtonModule,
    MatRadioModule,
    MatIconModule,

    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule
  ],
  templateUrl: './seleccion-nota-credito-dialog.component.html',
  styleUrl: './seleccion-nota-credito-dialog.component.scss'
})
export class SeleccionNotaCreditoDialogComponent {

  isLoading = false;
  maxDescuento = 0;

  // NUEVO: opción principal
  opcion: OpcionNC | null = null;

  // DEVOLUCIÓN
  tipoDevolucion: TipoDevolucion | null = null;

  // DESCUENTO
  montoDescuento: number | null = null;
  prorratear = true;

  private toNumber(v: any): number | null {
    if (v == null) return null;
    const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { cfdi: any },
    public dialogRef: MatDialogRef<SeleccionNotaCreditoDialogComponent>,
    private clienteFactura: Cliente_Factura,
    private snackBar: MatSnackBar,
    private emisorService: EmisorService,
    private router: Router,
  ) {
    this.maxDescuento = this.toNumber(this.data?.cfdi?.total) ?? 0;
  }

  cerrar(): void {
    this.dialogRef.close(null);
  }

  onMontoChange(): void {
    if (this.montoDescuento == null) return;

    const v = this.toNumber(this.montoDescuento);
    if (v == null) {
      this.montoDescuento = null;
      return;
    }

    // Normaliza
    let n = v;
    if (n < 0) n = 0;

    // Límite superior = total del CFDI
    if (this.maxDescuento > 0 && n > this.maxDescuento) {
      n = this.maxDescuento;
    }

    // Redondeo a 2 decimales para evitar 0.30000000004
    this.montoDescuento = Math.round(n * 100) / 100;
  }

  onOpcionChange(): void {
    if (this.opcion === 'DESCUENTO') {
      // por default el total
      this.montoDescuento = this.maxDescuento || null;
    }
  }

  canSubmit(): boolean {
    if (!this.opcion) return false;

    if (this.opcion === 'DEVOLUCION') {
      return !!this.tipoDevolucion;
    }

    // DESCUENTO
    if (this.montoDescuento == null) return false;
    if (this.montoDescuento <= 0) return false;
    if (this.maxDescuento > 0 && this.montoDescuento > this.maxDescuento) return false;

    return true;
  }

  getPrimaryActionLabel(): string {
    if (this.opcion === 'DEVOLUCION') return 'Continuar';
    if (this.opcion === 'DESCUENTO') return 'Timbrar nota';
    return 'Continuar';
  }

  continuar(): void {
    if (!this.canSubmit()) return;

    const cfdiId = this.data.cfdi.id;

    // DEVOLUCIÓN -> siempre navega a la misma ruta, pero con indicador
    if (this.opcion === 'DEVOLUCION') {
      const devolucion = this.tipoDevolucion; // 'TOTAL' | 'PARCIAL'

      this.dialogRef.close(null);
      this.router.navigate(['/cliente/cfdis', cfdiId, 'nota-credito-parcial'], {
        queryParams: { devolucion } // TOTAL | PARCIAL
      });
      return;
    }

    // DESCUENTO -> timbra directo por monto (reutiliza tu endpoint actual)
    this.generarNotaCreditoDescuento();
  }

  private generarNotaCreditoDescuento(): void {
    const emisorId = this.emisorService.emisorId;
    const cfdiId = this.data.cfdi.id;

    const monto = this.montoDescuento ?? 0;

    if (monto <= 0) {
      this.snackBar.open('Captura un importe válido.', 'OK', { duration: 4000 });
      return;
    }

    if (this.maxDescuento > 0 && monto > this.maxDescuento) {
      this.snackBar.open('El importe no puede ser mayor al total de la factura.', 'OK', { duration: 4500 });
      return;
    }

    this.isLoading = true;

    // Ajusta tu servicio para ya no pedir prorratear (o pásalo fijo si aún existe)
    this.clienteFactura.crearNotaCreditoParcialMonto(cfdiId, emisorId, monto /*, true */).subscribe({
      next: (res: CfdiCreadoDto) => {
        this.isLoading = false;
        this.snackBar.open(
          `NC creada: ${res.serie ?? ''}-${res.folio ?? ''} (${res.uuid ?? ''})`,
          'OK',
          { duration: 4500 }
        );
        this.dialogRef.close(res);
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open(this.getErrMsg(err), 'OK', { duration: 6000 });
      }
    });
  }

  private getErrMsg(err: any): string {
    return err?.error?.message || err?.error || err?.message || 'No se pudo generar la nota de crédito';
  }
}