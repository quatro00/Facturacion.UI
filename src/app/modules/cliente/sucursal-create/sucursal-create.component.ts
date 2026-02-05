import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';

import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';

import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { Cliente_Perfil } from 'app/services/cliente/cliente_perfil.service';
import { Cliente_Catalogos } from 'app/services/cliente/cliente_catalogos.service';
import { Cliente_Sucursal } from 'app/services/cliente/cliente_sucursal.service';

export interface RazonSocialOption {
  id: string;
  rfc: string;
  razonSocial: string;
}

type TipoCfdi = 'I' | 'E' | 'P';

type SerieConcepto =
  | 'I_MERCANCIAS'
  | 'I_SERVICIOS'
  | 'I_ANTICIPO'
  | 'E_DESCUENTOS'
  | 'E_DEVOLUCIONES'
  | 'E_APLICACION_ANTICIPO'
  | 'P_RECIBOS_PAGO';

@Component({
  selector: 'app-sucursal-create',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,

    MatSelectModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatSnackBarModule,
  ],
  templateUrl: './sucursal-create.component.html',
  styleUrl: './sucursal-create.component.scss'
})
export class SucursalCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  private clientePerfil = inject(Cliente_Perfil);
  private clienteCatalogos = inject(Cliente_Catalogos);
  private sucursalApi = inject(Cliente_Sucursal); // ✅ TU servicio

  isLoading = true;
  isSaving = false;

  colonias: string[] = [];
  razonesSociales: RazonSocialOption[] = [];

  selectedRsIds = new Set<string>();
  defaultRsMap: Record<string, boolean> = {};

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

    { key: 'E_DESCUENTOS',          tipo: 'E', label: 'Tipo E: Descuentos',          hint: 'Egreso (E) - Nota por descuento', required: false },
    { key: 'E_DEVOLUCIONES',        tipo: 'E', label: 'Tipo E: Devoluciones',        hint: 'Egreso (E) - Nota por devolución', required: false },
    { key: 'E_APLICACION_ANTICIPO', tipo: 'E', label: 'Tipo E: Aplicación Anticipo', hint: 'Egreso (E) - Aplicación/regularización', required: false },

    { key: 'P_RECIBOS_PAGO',        tipo: 'P', label: 'Tipo P: Recibos de pago',     hint: 'Pago (P) - Complemento de pago', required: false },
  ];

  form = this.fb.group({
    codigo: ['', [Validators.required, Validators.maxLength(10), Validators.pattern(/^[A-Za-z0-9_-]+$/)]],
    nombre: ['', [Validators.required, Validators.maxLength(150)]],
    activo: [true],

    telefono: ['', [Validators.maxLength(20)]],
    email: ['', [Validators.email, Validators.maxLength(254)]],

    codigoPostal: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
    municipio: ['', [Validators.required, Validators.maxLength(100)]],
    estado: ['', [Validators.required, Validators.maxLength(100)]],
    colonia: ['', [Validators.required, Validators.maxLength(120)]],
    calle: ['', [Validators.required, Validators.maxLength(120)]],
    noInterior: ['', [Validators.maxLength(20)]],
    noExterior: ['', [Validators.required, Validators.maxLength(20)]],

    series: this.fb.array([] as any[])
  }, { validators: [this.seriesIngresoValidator()] });

  get seriesFA(): FormArray {
    return this.form.get('series') as FormArray;
  }

  ngOnInit(): void {
    this.form.get('codigoPostal')!.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(cp => this.buscarCodigoPostal(cp));

    this.initSeriesDefaults();
    this.cargarRazonesSociales();
  }

  private seriesIngresoValidator() {
    return (ctrl: AbstractControl): ValidationErrors | null => {
      const fa = ctrl.get('series') as FormArray | null;
      if (!fa || fa.length === 0) return null;

      const required = ['I_MERCANCIAS', 'I_SERVICIOS', 'I_ANTICIPO'];

      const missing = required.some(key => {
        const idx = this.tiposSeries.findIndex(x => x.key === key);
        if (idx < 0 || idx >= fa.length) return false;
        const val = (fa.at(idx).get('serie')?.value ?? '').toString().trim();
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
            Validators.pattern(/^[A-Za-z0-9_-]*$/)
          ]],

          folioInicial: [null, [Validators.min(1), Validators.max(2147483647)]],
          activo: [true]
        })
      );
    }

    this.form.updateValueAndValidity({ emitEvent: false });
  }

  buscarCodigoPostal(codigoPostal: string): void {
    const cp = (codigoPostal || '').toString().trim();
    if (!cp || cp.length < 5) return;

    this.clienteCatalogos.GetMunicipio(cp).subscribe({
      next: (res) => {
        this.form.patchValue({
          estado: res.estado,
          municipio: res.municipio,
          colonia: ''
        });
        this.colonias = res.colonia || [];
      },
      error: () => {
        this.colonias = [];
        this.form.patchValue({ estado: '', municipio: '', colonia: '' });
      }
    });
  }

  cargarRazonesSociales(): void {
    this.isLoading = true;

    this.clientePerfil.GetRazonesSociales()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res) => (this.razonesSociales = res ?? []),
        error: (err) => {
          console.error('Error cargando razones sociales', err);
          this.razonesSociales = [];
        }
      });
  }

  cancelar(): void {
    this.router.navigate(['/cliente/sucursales']);
  }

  seleccionarTodasRazones(): void {
    this.razonesSociales.forEach(rs => this.selectedRsIds.add(rs.id));
  }

  isRsSelected(rsId: string): boolean {
    return this.selectedRsIds.has(rsId);
  }

  toggleRs(rsId: string, checked: boolean): void {
    if (checked) this.selectedRsIds.add(rsId);
    else {
      this.selectedRsIds.delete(rsId);
      this.defaultRsMap[rsId] = false;
    }
  }

  setDefaultForRs(rsId: string, isDefault: boolean): void {
    if (!this.isRsSelected(rsId)) return;
    this.defaultRsMap[rsId] = isDefault;
  }

  trackById(_: number, x: RazonSocialOption): string {
    return x.id;
  }

  seriesLabel(i: number): string {
    return this.tiposSeries[i]?.label ?? 'Serie';
  }

  guardar(): void {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();

    if (this.form.errors?.['seriesIngresoMissing']) {
      this.snack.open('Las series de Tipo I (Mercancías/Servicios/Anticipo) son obligatorias.', 'OK', { duration: 4500 });
      return;
    }

    if (this.form.invalid) return;

    if (this.selectedRsIds.size === 0) {
      this.snack.open('Selecciona al menos una razón social para la sucursal.', 'OK', { duration: 4500 });
      return;
    }

    const payload = this.buildPayload();

    this.isSaving = true;

    this.sucursalApi.CreateSucursal(payload)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: (res) => {
          this.snack.open('Sucursal creada correctamente', 'OK', { duration: 3000 });

          // si el back regresa el id:
          const id = res?.id ?? res; // por si devuelves Guid directo
          if (id) {
            this.router.navigate(['/cliente/sucursales', id]);
          } else {
            this.router.navigate(['/cliente/sucursales']);
          }
        },
        error: (err) => {
          console.error(err);
          const msg = (err?.error?.message || '').toString();
          this.snack.open(msg || 'No se pudo crear la sucursal.', 'OK', { duration: 4500 });
        }
      });
  }

  private buildPayload(): any {
    const v = this.form.getRawValue();

    const series = this.seriesFA.controls
      .map((c, i) => {
        const concepto = this.tiposSeries[i].key;
        const tipoCfdi = this.tiposSeries[i].tipo;

        const serie = (c.get('serie')?.value ?? '').toString().trim().toUpperCase();
        const folioInicial = c.get('folioInicial')?.value ?? null;
        const activo = !!c.get('activo')?.value;

        return { concepto, tipoCfdi, serie, folioInicial, activo };
      })
      .filter(x => !!x.serie); // no mandar vacías

    return {
      codigo: (v.codigo ?? '').trim().toUpperCase(),
      nombre: (v.nombre ?? '').trim(),
      activo: !!v.activo,

      telefono: v.telefono?.trim() || null,
      email: v.email?.trim() || null,

      direccion: {
        codigoPostal: v.codigoPostal?.trim() || null,
        municipio: v.municipio?.trim() || null,
        estado: v.estado?.trim() || null,
        colonia: v.colonia?.trim() || null,
        calle: v.calle?.trim() || null,
        noInterior: v.noInterior?.trim() || null,
        noExterior: v.noExterior?.trim() || null,
      },

      razonesSociales: Array.from(this.selectedRsIds).map(rsId => ({
        razonSocialId: rsId,
        esDefault: !!this.defaultRsMap[rsId],
        activo: true
      })),

      series
    };
  }
}