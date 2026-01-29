import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { Cliente_Factura } from 'app/services/cliente/cliente_factura.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CfdiCreadoDto } from 'app/shared/models/cliente_facturacion/facturacion.models';

@Component({
  selector: 'app-seleccion-nota-credito-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatRadioModule,
    MatIconModule
  ],
  templateUrl: './seleccion-nota-credito-dialog.component.html',
  styleUrl: './seleccion-nota-credito-dialog.component.scss'
})
export class SeleccionNotaCreditoDialogComponent {

  isLoading = false;
  tipo: 'TOTAL' | 'PARCIAL' | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { cfdi: any },
    public dialogRef: MatDialogRef<SeleccionNotaCreditoDialogComponent>,
    private clienteFactura: Cliente_Factura,
    private snackBar: MatSnackBar,
  ) {}

  cerrar(): void {
    this.dialogRef.close(null);
  }
  
  continuar(): void {
    if (!this.tipo) return;

    if (this.tipo === 'TOTAL') {
      this.generarNotaCreditoTotal();
    } else {
      console.log('Ir a pantalla de nota de crédito parcial', this.data.cfdi);
      this.dialogRef.close();
    }
  }

  generarNotaCreditoTotal(): void {
    console.log('Generar nota de crédito TOTAL para CFDI:', this.data.cfdi);
    this.isLoading = true;

    this.clienteFactura.crearNotaCreditoTotal(this.data.cfdi.id).subscribe({
      next: (res: CfdiCreadoDto) => {
        this.isLoading = false;
        this.snackBar.open(
          `NC creada: ${res.serie ?? ''}-${res.folio ?? ''} (${res.uuid ?? ''})`,
          'OK',
          { duration: 4500 }
        );

        // regresas al padre el resultado para refrescar tabla
        this.dialogRef.close(res);
      },
      error: (err) => {
        this.isLoading = false;
        const msg =
          err?.error?.message ||
          err?.error ||
          err?.message ||
          'No se pudo generar la nota de crédito';
        this.snackBar.open(msg, 'OK', { duration: 6000 });
      }
    });
  }
}
