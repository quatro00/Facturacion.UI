import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { debounceTime, distinctUntilChanged, forkJoin, switchMap } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';

import { Cliente_Catalogos } from 'app/services/cliente/cliente_catalogos.service';
import { Cliente_Perfil } from 'app/services/cliente/cliente_perfil.service';
import { NotificationService } from 'app/services/notification.service';

type SellosState = { cerBase64: string | null; keyBase64: string | null; password: string };

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatExpansionModule,
  ],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent implements OnInit {

  isLoading = false;

  regimenesFiscales: any[] = [];
  selectedIndex = 0;

  private sellosByIndex: Record<number, SellosState> = {};

  // Patterns
  RFC_REGEX = /^([A-ZÑ&]{3,4})(\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])([A-Z\d]{3})$/;
  SERIE_REGEX = /^[A-Z0-9]{1,10}$/;        // 1-10, sin espacios
  PHONE_REGEX = /^[0-9]{7,15}$/;           // simple, para UI
  CP_REGEX = /^\d{5}$/;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private notify: NotificationService,
    private cliente_catalogos: Cliente_Catalogos,
    private cliente_perfil: Cliente_Perfil,
  ) {
    this.form = this.fb.group({
      razonesSociales: this.fb.array([])
    });
  }

  private toastError(err: any, fallback = 'Ocurrió un error'): void {
    const msg =
      err?.error?.message ||
      err?.error?.error ||
      err?.message ||
      fallback;

    this.notify.error(msg);
  }

  get razonesSociales(): FormArray {
    return this.form.get('razonesSociales') as FormArray;
  }

  ngOnInit(): void {
    this.reload(false);
  }

  reload(showToast = true): void {
    this.isLoading = true;

    forkJoin([
      this.cliente_catalogos.GetRegimenesFiscales(),
      this.cliente_perfil.GetRazonesSociales()
    ]).subscribe({
      next: ([regimenes, razones]) => {
        this.regimenesFiscales = regimenes || [];

        this.razonesSociales.clear();
        this.sellosByIndex = {};

        const lista = Array.isArray(razones) ? razones : (razones ? [razones] : []);
        lista.forEach((rs: any, idx: number) => {
          this.razonesSociales.push(this.createRazonSocialGroup(rs));
          this.sellosByIndex[idx] = { cerBase64: null, keyBase64: null, password: '' };
        });

        if (this.razonesSociales.length === 0) {
          this.agregarRazonSocial();
        } else {
          this.selectedIndex = 0;
        }

        if (showToast) this.notify.info('Perfil actualizado');
      },
      error: (err) => this.toastError(err, 'No se pudo cargar el perfil'),
      complete: () => this.isLoading = false
    });
  }

  createRazonSocialGroup(rs?: any): FormGroup {
    const g = this.fb.group({
      id: [rs?.id ?? null],

      // estados
      activa: [rs?.activa ?? true],
      esDefault: [rs?.esDefault ?? false],

      // datos fiscales
      rfc: [
        (rs?.rfc ?? ''),
        [Validators.required, Validators.minLength(12), Validators.maxLength(13), Validators.pattern(this.RFC_REGEX)]
      ],
      razonSocial: [rs?.razonSocial ?? '', Validators.required],
      nombreComercial: [rs?.nombreComercial ?? ''],

      regimenFiscalId: [rs?.regimenFiscalId ?? '', Validators.required],

      // contacto/config
      emailEmisor: [rs?.emailEmisor ?? '', [Validators.required, Validators.email]],
      telefonoEmisor: [rs?.telefonoEmisor ?? '', [Validators.pattern(this.PHONE_REGEX)]],

      // emisión
      serieIngresoDefault: [
        (rs?.serieIngresoDefault ?? ''),
        [Validators.required, Validators.pattern(this.SERIE_REGEX)]
      ],
      serieEgresoDefault: [
        (rs?.serieEgresoDefault ?? ''),
        [Validators.pattern(this.SERIE_REGEX)]
      ],
      cpLugarExpedicionDefault: [
        (rs?.cpLugarExpedicionDefault ?? ''),
        [Validators.pattern(this.CP_REGEX)]
      ],

      folioInicio: [rs?.folioInicio ?? 1, [Validators.required, Validators.min(1)]],

      // dirección fiscal
      codigoPostal: [rs?.codigoPostal ?? '', [Validators.required, Validators.pattern(this.CP_REGEX)]],
      municipio: [rs?.municipio ?? '', Validators.required],
      estado: [rs?.estado ?? '', Validators.required],
      colonia: [rs?.colonia ?? '', Validators.required],
      calle: [rs?.calle ?? '', Validators.required],
      noExterior: [rs?.noExterior ?? '', Validators.required],
      noInterior: [rs?.noInterior ?? ''],

      colonias: [rs?.colonias ?? []],
    });

    // Normaliza RFC + reinicia régimen
    g.get('rfc')!.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged())
      .subscribe((v) => {
        const clean = (v || '').toString().toUpperCase().replace(/\s+/g, '');
        if (clean !== v) g.get('rfc')!.setValue(clean, { emitEvent: false });
        g.get('regimenFiscalId')!.setValue('', { emitEvent: false });
      });

    // Normaliza series
    g.get('serieIngresoDefault')!.valueChanges
      .pipe(debounceTime(150), distinctUntilChanged())
      .subscribe(v => {
        const clean = (v || '').toString().toUpperCase().replace(/\s+/g, '');
        if (clean !== v) g.get('serieIngresoDefault')!.setValue(clean, { emitEvent: false });
      });

    g.get('serieEgresoDefault')!.valueChanges
      .pipe(debounceTime(150), distinctUntilChanged())
      .subscribe(v => {
        const clean = (v || '').toString().toUpperCase().replace(/\s+/g, '');
        if (clean !== v) g.get('serieEgresoDefault')!.setValue(clean, { emitEvent: false });
      });

    // CP lookup
    g.get('codigoPostal')!.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(cp => this.buscarCodigoPostalPorItem(g, cp));

    // UI: si es default, forzar activa
    if (g.value.esDefault) {
      g.patchValue({ activa: true }, { emitEvent: false });
    }

    return g;
  }

  regimenesFiscalesFiltrados(index: number): any[] {
    const rs = this.razonesSociales.at(index) as FormGroup;
    const rfc = (rs.get('rfc')?.value || '').toString().trim().toUpperCase();
    if (rfc.length === 12) return this.regimenesFiscales.filter(x => x.moral === true);
    if (rfc.length === 13) return this.regimenesFiscales.filter(x => x.fisica === true);
    return [];
  }

  agregarRazonSocial(): void {
    const idx = this.razonesSociales.length;

    // defaults recomendados para nuevo emisor
    const g = this.createRazonSocialGroup({
      activa: true,
      esDefault: false,
      serieIngresoDefault: 'A',
      serieEgresoDefault: 'NC',
      folioInicio: 1
    });

    this.razonesSociales.push(g);
    this.sellosByIndex[idx] = { cerBase64: null, keyBase64: null, password: '' };
    this.selectedIndex = idx;

    this.notify.info('Nuevo emisor agregado');
  }

  guardarRazonSocial(index: number): void {
    const rs = this.razonesSociales.at(index) as FormGroup;

    // UI rule: default no se puede desactivar
    if (rs.value.esDefault && rs.value.activa === false) {
      rs.patchValue({ activa: true }, { emitEvent: false });
      this.notify.error('El emisor predeterminado no se puede desactivar');
      return;
    }

    if (rs.invalid) {
      rs.markAllAsTouched();
      this.notify.error('Revisa los campos obligatorios');
      return;
    }

    // regla: si cpLugarExpedicionDefault viene vacío, backend puede usar codigoPostal fiscal
    const payload = {
      id: rs.value.id,
      activa: rs.value.activa,

      rfc: rs.value.rfc,
      razonSocial: rs.value.razonSocial,
      nombreComercial: rs.value.nombreComercial,

      regimenFiscalId: rs.value.regimenFiscalId,

      emailEmisor: rs.value.emailEmisor,
      telefonoEmisor: rs.value.telefonoEmisor,

      serieIngresoDefault: rs.value.serieIngresoDefault,
      serieEgresoDefault: rs.value.serieEgresoDefault || null,
      cpLugarExpedicionDefault: rs.value.cpLugarExpedicionDefault || null,

      folioInicio: rs.value.folioInicio,

      codigoPostal: rs.value.codigoPostal,
      municipio: rs.value.municipio,
      estado: rs.value.estado,
      colonia: rs.value.colonia,
      calle: rs.value.calle,
      noExterior: rs.value.noExterior,
      noInterior: rs.value.noInterior || null,
    };

    this.isLoading = true;
    this.cliente_perfil.UpsertRazonSocial(payload).subscribe({
      next: (res: any) => {
        if (res?.id) rs.patchValue({ id: res.id }, { emitEvent: false });
        this.notify.success('Emisor guardado con éxito');
        this.isLoading = false
      },
      error: (err) => {this.toastError(err, 'No se pudo guardar el emisor'); this.isLoading = false},
      complete: () => this.isLoading = false
    });
  }

  eliminarRazonSocial(index: number): void {
    const rs = this.razonesSociales.at(index) as FormGroup;
    const id = rs.get('id')?.value;

    if (rs.value.esDefault) {
      this.notify.error('No puedes eliminar el emisor predeterminado');
      return;
    }

    if (!id) {
      this.razonesSociales.removeAt(index);
      delete this.sellosByIndex[index];
      this.selectedIndex = Math.max(0, this.selectedIndex - 1);
      this.notify.success('Emisor eliminado');
      return;
    }

    this.isLoading = true;
    this.cliente_perfil.DeleteRazonSocial(id).subscribe({
      next: () => {
        this.razonesSociales.removeAt(index);
        delete this.sellosByIndex[index];
        this.selectedIndex = Math.max(0, this.selectedIndex - 1);
        this.notify.success('Emisor eliminado correctamente');
      },
      error: (err) => this.toastError(err, 'No se pudo eliminar el emisor'),
      complete: () => this.isLoading = false
    });
  }

  hacerPredeterminado(index: number): void {
    const rs = this.razonesSociales.at(index) as FormGroup;
    const id = rs.get('id')?.value;

    if (!id) {
      this.notify.error('Guarda primero el emisor antes de marcarlo como predeterminado');
      return;
    }

    this.isLoading = true;
    this.cliente_perfil.SetDefaultRazonSocial(id).subscribe({
      next: () => {
        // UI: marca solo uno como default
        this.razonesSociales.controls.forEach((c: any) => {
          c.patchValue({ esDefault: false }, { emitEvent: false });
        });
        rs.patchValue({ esDefault: true, activa: true }, { emitEvent: false });
        this.notify.success('Emisor predeterminado actualizado');
      },
      error: (err) => this.toastError(err, 'No se pudo cambiar el predeterminado'),
      complete: () => this.isLoading = false
    });
  }

  buscarCodigoPostalPorItem(group: FormGroup, codigoPostal: string): void {
    const cp = (codigoPostal || '').toString().trim();
    if (!cp || cp.length !== 5) return;

    this.cliente_catalogos.GetMunicipio(cp).subscribe({
      next: (res) => {
        group.patchValue(
          { estado: res.estado, municipio: res.municipio, colonia: '' },
          { emitEvent: false }
        );
        group.get('colonias')!.setValue(res.colonia || [], { emitEvent: false });
      },
      error: () => {
        group.patchValue({ estado: '', municipio: '', colonia: '' }, { emitEvent: false });
        group.get('colonias')!.setValue([], { emitEvent: false });
      }
    });
  }

  uppercaseNoEmit(group: FormGroup, controlName: string, event: any): void {
    const v = (event?.target?.value || '').toString().toUpperCase().replace(/\s+/g, '');
    group.get(controlName)?.setValue(v, { emitEvent: false });
  }

  // =============================
  // Sellos por emisor
  // =============================
  getSellos(index: number): SellosState {
    return this.sellosByIndex[index] ?? (this.sellosByIndex[index] = { cerBase64: null, keyBase64: null, password: '' });
  }

  setPassword(index: number, value: string): void {
    this.getSellos(index).password = value ?? '';
  }

  onCerSelected(index: number, event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.getSellos(index).cerBase64 = (reader.result as string).split(',')[1];
      this.notify.info('CER seleccionado');
    };
    reader.readAsDataURL(file);
  }

  onKeySelected(index: number, event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.getSellos(index).keyBase64 = (reader.result as string).split(',')[1];
      this.notify.info('KEY seleccionado');
    };
    reader.readAsDataURL(file);
  }

  canEnviarSellos(index: number): boolean {
    const s = this.getSellos(index);
    return !!(s.cerBase64 && s.keyBase64 && s.password);
  }

  descargarSellos(index: number): void {
    const rs = this.razonesSociales.at(index) as FormGroup;
    const id = rs.get('id')?.value;

    if (!id) {
      this.notify.error('Guarda primero el emisor antes de descargar sellos');
      return;
    }

    this.isLoading = true;
    this.cliente_perfil.DescargarSellos(id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'SellosDigitales.zip';
        a.click();
        window.URL.revokeObjectURL(url);
        this.notify.success('Sellos descargados');
        this.isLoading = false;
      },
      error: (err) => {this.toastError(err, 'No se pudieron descargar los sellos');this.isLoading = false},
      complete: () => this.isLoading = false
    });
  }

  enviarSellos(index: number): void {
    const rs = this.razonesSociales.at(index) as FormGroup;
    const razonSocialId = rs.get('id')?.value;

    if (!razonSocialId) {
      this.notify.error('Guarda primero el emisor antes de enviar sellos');
      return;
    }

    const s = this.getSellos(index);
    if (!s.cerBase64 || !s.keyBase64 || !s.password) {
      this.notify.error('Selecciona CER, KEY y contraseña');
      return;
    }

    this.isLoading = true;
    const payload = {
      certificadoBase64: s.cerBase64,
      llavePrivadaBase64: s.keyBase64,
      passwordLlave: s.password
    };

    this.cliente_perfil.EnviarSellos(razonSocialId, payload).pipe(
      switchMap(() => this.cliente_perfil.SubirSellosAFacturama(razonSocialId, false))
    ).subscribe({
      next: () => {this.notify.success('Sellos enviados correctamente');this.isLoading = false},
      error: (err) => {this.toastError(err, 'Error al enviar sellos');this.isLoading = false},
      complete: () => this.isLoading = false
    });
  }
}