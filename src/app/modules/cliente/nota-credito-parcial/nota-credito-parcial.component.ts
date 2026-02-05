import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize, switchMap } from 'rxjs';

import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { combineLatest } from 'rxjs';
import { Cliente_Factura } from 'app/services/cliente/cliente_factura.service';
import { EmisorService } from 'app/core/emisor/emisor.service';

import { CfdiDetalleDto } from 'app/shared/models/cliente_facturacion/CfdiDetalleDto';
import { CfdiConceptoDto } from 'app/shared/models/cliente_facturacion/CfdiConceptoDto';
import { CfdiCreadoDto } from 'app/shared/models/cliente_facturacion/facturacion.models';

type MotivoNc = '01' | '02' | '03' | '04';
type TipoDevolucion = 'TOTAL' | 'PARCIAL';


@Component({
  selector: 'app-nota-credito-parcial',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,

    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './nota-credito-parcial.component.html',
  styleUrl: './nota-credito-parcial.component.scss'
})
export class NotaCreditoParcialComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private facturasService = inject(Cliente_Factura);
  private emisorService = inject(EmisorService);
  private snack = inject(MatSnackBar);

  isLoading = true;
  isSaving = false;

  cfdi: CfdiDetalleDto | null = null;


  displayedColumns: string[] = [
    'cantidad',
    'descripcion',
    'valorUnitario',
    'descuento',
    'importe',
    'cantidadNc'
  ];
  tipoDevolucion: TipoDevolucion = 'PARCIAL'; // default seguro
  // Motivo por default (ajústalo a tu regla)
  motivoCtrl = new FormControl<MotivoNc>('01', { nonNullable: true, validators: [Validators.required] });

  // FormArray por línea para capturar cantidad a acreditar
  form = this.fb.group({
    conceptos: this.fb.array<FormGroup<{
      conceptoId: FormControl<string>;
      maxCantidad: FormControl<number>;
      cantidadNc: FormControl<number>;
    }>>([])
  });

  get conceptosFA(): FormArray<any> {
    return this.form.controls.conceptos;
  }


  ngOnInit(): void {
    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(
        switchMap(([p, q]) => {
          const devolucion = (q.get('devolucion') ?? 'PARCIAL').toUpperCase();
          this.tipoDevolucion = (devolucion === 'TOTAL' ? 'TOTAL' : 'PARCIAL');

          const cfdiId = p.get('id')!;
          return this.facturasService.getCfdiDetalle(cfdiId);
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (data) => {
          this.cfdi = data;
          this.isLoading = false;
          this.buildConceptosControls(data.conceptos ?? []);

          // ✅ aquí aplicas comportamiento según tipo
          this.aplicarModoDevolucion();
        },
        error: (err) => {
          console.error(err);
          this.cfdi = null;
          this.snack.open('No se pudo cargar el CFDI origen', 'OK', { duration: 4500 });
        },
      });
  }

  private aplicarModoDevolucion(): void {
    if (!this.cfdi) return;

    if (this.tipoDevolucion === 'TOTAL') {
      // Ejemplo de comportamiento típico:
      // - Seleccionar todo por default
      // - Bloquear inputs para que no editen
      // - O simplemente setear cantidades al máximo
      this.conceptosFA.controls.forEach((fg) => {
        const max = fg.get('maxCantidad')!.value as number;
        fg.get('cantidadNc')!.setValue(max);
        // opcional: bloquear edición
        fg.get('cantidadNc')!.disable({ emitEvent: false });
      });
    } else {
      // PARCIAL: inputs habilitados
      this.conceptosFA.controls.forEach((fg) => {
        fg.get('cantidadNc')!.enable({ emitEvent: false });
      });
    }
  }

  private buildConceptosControls(conceptos: CfdiConceptoDto[]): void {
    this.conceptosFA.clear();

    for (const c of conceptos) {
      const max = Number(c.cantidad ?? 0);

      this.conceptosFA.push(
        this.fb.group({
          conceptoId: this.fb.control(c.id, { nonNullable: true }),
          maxCantidad: this.fb.control(max, { nonNullable: true }),
          cantidadNc: this.fb.control(0, {
            nonNullable: true,
            validators: [Validators.min(0), Validators.max(max)]
          })
        })
      );
    }
  }

  // Total NC estimado (por cantidad) — si tu Importe ya es Total del renglón, prorrateo
  get totalNcEstimado(): number {
    if (!this.cfdi?.conceptos?.length) return 0;

    return this.cfdi.conceptos.reduce((acc, c, i) => {
      const max = Number(c.cantidad ?? 0);
      const cantNc = Number(this.conceptosFA.at(i)?.get('cantidadNc')?.value ?? 0);
      if (max <= 0 || cantNc <= 0) return acc;

      // Prorrateo con base en el importe original del concepto:
      const importeOrig = Number(c.importe ?? 0);
      const factor = Math.min(1, cantNc / max);
      const importeNc = importeOrig * factor;

      return acc + this.round2(importeNc);
    }, 0);
  }

  generarNcParcial(): void {
    if (!this.cfdi) return;

    // Validaciones UI
    this.form.markAllAsTouched();
    if (this.form.invalid || this.motivoCtrl.invalid) return;

    const emisorId = this.emisorService.emisorId;
    if (!emisorId) {
      this.snack.open('No hay emisor seleccionado', 'OK', { duration: 4500 });
      return;
    }

    // Solo líneas con cantidadNc > 0
    const conceptos = this.conceptosFA.controls
  .map((fg) => {
    const max = Number(fg.get('maxCantidad')!.value ?? 0);

    const cantidad = this.tipoDevolucion === 'TOTAL'
      ? max
      : Number(fg.get('cantidadNc')!.value ?? 0);

    return {
      cfdiConceptoId: fg.get('conceptoId')!.value as string,
      cantidad
    };
  })
  .filter(x => x.cantidad > 0);

    if (conceptos.length === 0) {
      this.snack.open('Selecciona al menos un concepto con cantidad a acreditar', 'OK', { duration: 4500 });
      return;
    }

    this.isSaving = true;

    // ✅ Método nuevo en Cliente_Factura (te lo dejo abajo)
    this.facturasService.crearNotaCreditoParcial(this.cfdi.id, conceptos)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: (res: CfdiCreadoDto) => {
          this.snack.open(
            `NC parcial creada: ${res.serie ?? ''}-${res.folio ?? ''} (${res.uuid ?? ''})`,
            'OK',
            { duration: 4500 }
          );

          // Opcional: regresar al detalle del CFDI origen o a listado
          this.router.navigate(['/cliente/facturas']);
        },
        error: (err) => {
          console.error(err);
          const msg =
            err?.error?.message ||
            err?.error ||
            err?.message ||
            'No se pudo generar la nota de crédito parcial';
          this.snack.open(msg, 'OK', { duration: 6000 });
        }
      });
  }

  cancelar(): void {
    if (!this.cfdi) return;
    //this.router.navigate(['/cliente/facturas', this.cfdi.id]);
    this.router.navigate(['/cliente/facturas']);
  }

  trackById(_: number, x: CfdiConceptoDto): string {
    return x.id;
  }

  private round2(n: number): number {
    return Math.round(n * 100) / 100;
  }
}