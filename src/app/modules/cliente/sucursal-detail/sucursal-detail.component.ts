import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Cliente_Sucursal } from 'app/services/cliente/cliente_sucursal.service';

type TipoCfdi = 'I' | 'E' | 'P';

type SerieConcepto =
  | 'I_MERCANCIAS'
  | 'I_SERVICIOS'
  | 'I_ANTICIPO'
  | 'E_DESCUENTOS'
  | 'E_DEVOLUCIONES'
  | 'E_APLICACION_ANTICIPO'
  | 'P_RECIBOS_PAGO';

export interface SucursalDetalleDto {
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

  // ✅ series por sucursal (debe venir en el GET)
  series: {
    concepto: SerieConcepto; // ✅ NUEVO
    tipoCfdi: TipoCfdi;
    serie: string;
    folioActual?: number | null;
    activo: boolean;
  }[];
}

@Component({
  selector: 'app-sucursal-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,

    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatSnackBarModule,
  ],
  templateUrl: './sucursal-detail.component.html',
})
export class SucursalDetailComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  private api = inject(Cliente_Sucursal);

  isLoading = true;
  isSaving = false;
  isEditMode = false;

  sucursalId!: string;
  rowVersion = '';

  // RS UI
  razonesSociales: SucursalDetalleDto['razonesSociales'] = [];
  selectedRsIds = new Set<string>();
  defaultRsMap: Record<string, boolean> = {};

  // ✅ 7 conceptos (orden fijo)
  readonly tiposSeries: {
    key: SerieConcepto;
    tipo: TipoCfdi;
    label: string;
    hint: string;
    required: boolean;
  }[] = [
    { key: 'I_MERCANCIAS',           tipo: 'I', label: 'Tipo I: Mercancías',          hint: 'Ingreso (I) - Ventas de mercancía', required: true },
    { key: 'I_SERVICIOS',           tipo: 'I', label: 'Tipo I: Servicios',           hint: 'Ingreso (I) - Prestación de servicios', required: true },
    { key: 'I_ANTICIPO',            tipo: 'I', label: 'Tipo I: Anticipo',            hint: 'Ingreso (I) - Anticipos', required: true },

    { key: 'E_DESCUENTOS',          tipo: 'E', label: 'Tipo E: Descuentos',          hint: 'Egreso (E) - Nota de crédito por descuento', required: false },
    { key: 'E_DEVOLUCIONES',        tipo: 'E', label: 'Tipo E: Devoluciones',        hint: 'Egreso (E) - Nota de crédito por devolución', required: false },
    { key: 'E_APLICACION_ANTICIPO', tipo: 'E', label: 'Tipo E: Aplicación Anticipo', hint: 'Egreso (E) - Aplicación/regularización de anticipo', required: false },

    { key: 'P_RECIBOS_PAGO',        tipo: 'P', label: 'Tipo P: Recibos de pago',     hint: 'Pago (P) - Complementos de pago', required: false },
  ];

  form = this.fb.group({
    codigo: [{ value: '', disabled: true }], // no editable
    nombre: ['', [Validators.required, Validators.maxLength(150)]],
    activo: [true],

    telefono: ['', [Validators.maxLength(20)]],
    email: ['', [Validators.email, Validators.maxLength(254)]],

    codigoPostal: ['', [Validators.pattern(/^\d{5}$/)]],
    municipio: ['', [Validators.maxLength(100)]],
    estado: ['', [Validators.maxLength(100)]],
    colonia: ['', [Validators.maxLength(120)]],
    calle: ['', [Validators.maxLength(120)]],
    noInterior: ['', [Validators.maxLength(20)]],
    noExterior: ['', [Validators.maxLength(20)]],

    // ✅ series
    series: this.fb.array([]),
  }, { validators: [this.seriesIngresoValidator()] }); // ✅ aquí

  get seriesFA(): FormArray {
    return this.form.get('series') as FormArray;
  }

  ngOnInit(): void {
    this.sucursalId = this.route.snapshot.paramMap.get('id')!;
    this.isEditMode = this.route.snapshot.url.some(x => x.path.toLowerCase() === 'editar');

    this.initSeriesDefaults(); // ✅ 7 filas
    this.cargar();

    if (!this.isEditMode) {
      this.form.disable();
    } else {
      this.form.get('codigo')?.disable();
    }
  }

  // ✅ validator para prender el banner rojo en HTML
  private seriesIngresoValidator() {
  return (ctrl: AbstractControl): ValidationErrors | null => {
    const fa = ctrl.get('series') as FormArray | null;
    if (!fa || fa.length === 0) return null; // 👈 todavía no se construye

    const requiredIngresoIdx = this.tiposSeries
      .map((t, idx) => ({ t, idx }))
      .filter(x => x.t.tipo === 'I' && x.t.required)
      .map(x => x.idx);

    // 👇 solo revisa índices que ya existan en el FA
    const missing = requiredIngresoIdx
      .filter(i => i < fa.length)
      .some(i => {
        const g = fa.at(i);
        if (!g) return false;
        const val = (g.get('serie')?.value ?? '').toString().trim();
        return !val;
      });

    return missing ? { seriesIngresoMissing: true } : null;
  };
}

  private initSeriesDefaults(): void {
    this.seriesFA.clear();

    for (const t of this.tiposSeries) {
      this.seriesFA.push(
        this.fb.group({
          concepto: [{ value: t.key, disabled: true }],
          tipoCfdi: [{ value: t.tipo, disabled: true }],

          serie: ['', [
            ...(t.required ? [Validators.required] : []),
            Validators.maxLength(25),
            Validators.pattern(/^[A-Za-z0-9_-]*$/) // permite vacío si no es required
          ]],

          folioActual: [{ value: null, disabled: true }], // solo lectura
          activo: [true],
        })
      );
    }
  }

  private cargar(): void {
    this.isLoading = true;

    this.api.GetSucursalById(this.sucursalId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (dto: SucursalDetalleDto) => this.hidratar(dto),
        error: (err) => {
          console.error(err);
          this.snack.open('No se pudo cargar la sucursal.', 'OK', { duration: 3500 });
          this.router.navigate(['/cliente/sucursales']);
        }
      });
  }

  private hidratar(dto: SucursalDetalleDto): void {
    this.rowVersion = dto.rowVersion;

    this.form.patchValue({
      codigo: dto.codigo,
      nombre: dto.nombre,
      activo: dto.activo,
      telefono: dto.telefono ?? '',
      email: dto.email ?? '',
      codigoPostal: dto.codigoPostal ?? '',
      municipio: dto.municipio ?? '',
      estado: dto.estado ?? '',
      colonia: dto.colonia ?? '',
      calle: dto.calle ?? '',
      noInterior: dto.noInterior ?? '',
      noExterior: dto.noExterior ?? '',
    });

    // RS
    this.razonesSociales = dto.razonesSociales ?? [];
    this.selectedRsIds = new Set(this.razonesSociales.filter(x => x.activo).map(x => x.id));
    this.defaultRsMap = {};
    for (const r of this.razonesSociales) {
      this.defaultRsMap[r.id] = !!r.esDefault;
    }

    // ✅ Series: mapear por concepto
    const map = new Map<SerieConcepto, any>((dto.series ?? []).map(s => [s.concepto, s]));

    for (let i = 0; i < this.seriesFA.length; i++) {
      const key = this.tiposSeries[i].key;
      const row = map.get(key);

      this.seriesFA.at(i).patchValue({
        serie: row?.serie ?? '',
        folioActual: row?.folioActual ?? null,
        activo: row?.activo ?? true,
      });
    }

    // En modo view: mantener todo disabled
    if (!this.isEditMode) {
      this.form.disable();
    }
    this.form.get('codigo')?.disable();

    // folioActual siempre read-only
    this.seriesFA.controls.forEach(c => c.get('folioActual')?.disable());
    this.seriesFA.controls.forEach(c => c.get('tipoCfdi')?.disable());
    this.seriesFA.controls.forEach(c => c.get('concepto')?.disable());

    // ✅ recalcular errores del form (prende/apaga el banner)
    this.form.updateValueAndValidity({ emitEvent: false });
  }

  // =========================
  // Navegación
  // =========================
  cancelar(): void {
    this.router.navigate(['/cliente/sucursales']);
  }

  irEditar(): void {
    this.router.navigate(['/cliente/sucursales', this.sucursalId, 'editar']);
  }

  // =========================
  // UI RS
  // =========================
  isRsSelected(rsId: string): boolean {
    return this.selectedRsIds.has(rsId);
  }

  toggleRs(rsId: string, checked: boolean): void {
    if (!this.isEditMode) return;

    if (checked) this.selectedRsIds.add(rsId);
    else {
      this.selectedRsIds.delete(rsId);
      this.defaultRsMap[rsId] = false;
    }
  }

  setDefaultForRs(rsId: string, isDefault: boolean): void {
    if (!this.isEditMode) return;
    if (!this.isRsSelected(rsId)) return;
    this.defaultRsMap[rsId] = isDefault;
  }

  seriesLabel(i: number): string {
    const t = this.tiposSeries[i];
    return t?.label ?? 'Serie';
  }

  // =========================
  // Save
  // =========================
  guardar(): void {
    if (!this.isEditMode) return;

    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();

    // (ya lo valida el validator; aquí solo damos mensaje friendly)
    if (this.form.errors?.['seriesIngresoMissing']) {
      this.snack.open('Las series de Tipo I (Mercancías/Servicios/Anticipo) son obligatorias.', 'OK', { duration: 4500 });
      return;
    }

    if (this.form.invalid) return;

    if (this.selectedRsIds.size === 0) {
      this.snack.open('Selecciona al menos una razón social.', 'OK', { duration: 3500 });
      return;
    }

    const v = this.form.getRawValue();

    const series = this.seriesFA.controls
      .map((c, i) => {
        const concepto = this.tiposSeries[i].key;
        const tipo = this.tiposSeries[i].tipo;

        const serie = (c.get('serie')?.value ?? '').toString().trim().toUpperCase();
        const activo = !!c.get('activo')?.value;

        return { concepto, tipoCfdi: tipo, serie, activo };
      })
      .filter(x => !!x.serie);

    const payload = {
      nombre: (v.nombre ?? '').trim(),
      activo: !!v.activo,
      telefono: v.telefono?.trim() || null,
      email: v.email?.trim() || null,

      codigoPostal: v.codigoPostal?.trim() || null,
      municipio: v.municipio?.trim() || null,
      estado: v.estado?.trim() || null,
      colonia: v.colonia?.trim() || null,
      calle: v.calle?.trim() || null,
      noInterior: v.noInterior?.trim() || null,
      noExterior: v.noExterior?.trim() || null,

      rowVersion: this.rowVersion,

      razonesSociales: Array.from(this.selectedRsIds).map(rsId => ({
        razonSocialId: rsId,
        activo: true,
        esDefault: !!this.defaultRsMap[rsId],
      })),

      series
    };

    this.isSaving = true;

    this.api.UpdateSucursal(this.sucursalId, payload)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: (updated: SucursalDetalleDto) => {
          this.snack.open('Sucursal actualizada.', 'OK', { duration: 3000 });
          this.hidratar(updated);
          this.router.navigate(['/cliente/sucursales', this.sucursalId]);
        },
        error: (err) => {
          console.error(err);
          const msg = (err?.error?.message || '').toString();
          this.snack.open(msg || 'No se pudo guardar la sucursal.', 'OK', { duration: 4500 });
        }
      });
  }
}