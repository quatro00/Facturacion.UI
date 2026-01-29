import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, forkJoin } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import { AlertService } from 'app/services/alert.service';
import { Cliente_Catalogos } from 'app/services/cliente/cliente_catalogos.service';
import { Cliente_Clientes } from 'app/services/cliente/cliente_clientes.service';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-cliente-registro',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
  ],
  templateUrl: './cliente-registro.component.html',
  styleUrl: './cliente-registro.component.scss'
})
export class ClienteRegistroComponent implements OnInit {

  isLoading = false;

  paises = [{ id: 'MX', descripcion: 'México' }];

  regimenesFiscales: any[] = [];
  metodosPago: any[] = [];
  formasPago: any[] = [];
  monedas: any[] = [];
  exportaciones: any[] = [];
  usosCfdi: any[] = [];

  colonias: string[] = [];

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private alertService: AlertService,
    private cliente_catalogos: Cliente_Catalogos,
    private cliente_clientes: Cliente_Clientes,
    private router: Router
  ) {
    this.form = this.fb.group({
      // Datos cliente
      tipoPersona: ['M', [Validators.required]], // F | M
      rfc: ['', [Validators.required, Validators.maxLength(13)]],
      razonSocial: ['', [Validators.required, Validators.maxLength(250)]],
      nombreComercial: ['', [Validators.maxLength(150)]],
      regimenFiscal: ['', Validators.required],
      email: ['', [Validators.email, Validators.maxLength(50)]],
      correosCc: ['', [Validators.maxLength(500), this.emailsListValidator]],
      telefono: ['', [Validators.maxLength(50), Validators.pattern(/^[0-9+()\-\s]{7,20}$/)]],

      // Dirección
      pais: ['MX', Validators.required],
      codigoPostal: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      estado: ['', Validators.required],
      municipio: ['', Validators.required],
      localidad: ['', [Validators.maxLength(80)]],
      colonia: ['', Validators.required],
      calle: ['', [Validators.required, Validators.maxLength(150)]],
      referencia: ['', [Validators.maxLength(150)]],
      noExterior: ['', [Validators.required, Validators.maxLength(50)]],
      noInterior: ['', [Validators.maxLength(50)]], // opcional

      // Config defaults
      metodoPago: [''],
      formaPago: [''],
      moneda: [''],
      exportacion: [''],
      usoCfdi: [''],

      // Notas
      notas: ['', [Validators.maxLength(500)]],
    });
  }


  emailsListValidator(control: AbstractControl): ValidationErrors | null {
    const value = (control.value || '').toString().trim();
    if (!value) return null;

    const emails = value.split(/[;,]/).map(x => x.trim()).filter(Boolean);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const invalid = emails.some(e => !emailRegex.test(e));
    return invalid ? { emailsList: true } : null;
  }

  ngOnInit(): void {
    this.form.get('rfc')!.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe(v => {
        const clean = (v || '').toUpperCase().replace(/\s+/g, '');
        if (clean !== v) this.form.get('rfc')!.setValue(clean, { emitEvent: false });
      });

    this.form.get('codigoPostal')!.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(cp => this.buscarCodigoPostal(cp));

    this.loadData();
  }

  cancelar(): void {
    // ajusta a tu ruta real
    this.router.navigate(['/cliente/clientes']);
  }

  buscarCodigoPostal(codigoPostal: string): void {
    const cp = (codigoPostal || '').toString().trim();
    if (!cp || cp.length < 5) return;

    this.cliente_catalogos.GetMunicipio(cp).subscribe({
      next: (res) => {
        this.form.patchValue({
          estado: res.estado,
          municipio: res.municipio,
          colonia: '' // resetea colonia si cambió CP
        });
        this.colonias = res.colonia || [];
      },
      error: () => {
        // no revientes la pantalla por CP inválido
        this.colonias = [];
        this.form.patchValue({ estado: '', municipio: '', colonia: '' });
      }
    });
  }

  loadData(): void {
    this.isLoading = true;

    forkJoin([
      this.cliente_catalogos.GetRegimenesFiscales(),
      this.cliente_catalogos.GetMetodoPago(),
      this.cliente_catalogos.GetFormaPago(),
      this.cliente_catalogos.GetMoneda(),
      this.cliente_catalogos.GetExportacion(),
      this.cliente_catalogos.GetUsoCfdi(),
    ]).subscribe({
      next: ([
        catRegimenFiscalResponse,
        catMetodoPagoResponse,
        catFormaPagoResponse,
        catMonedaResponse,
        catExportacionResponse,
        catUsosCfdiResponse
      ]) => {
        this.regimenesFiscales = catRegimenFiscalResponse || [];
        this.metodosPago = catMetodoPagoResponse || [];
        this.formasPago = catFormaPagoResponse || [];
        this.monedas = catMonedaResponse || [];
        this.exportaciones = catExportacionResponse || [];
        this.usosCfdi = catUsosCfdiResponse || [];
      },
      error: (err) => {
        this.alertService.showError('Error', err?.error || 'No se pudieron cargar catálogos');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  actualizarDatos(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const v = this.form.value;
    const payload = {
      tipoPersona: v.tipoPersona,
      rfc: v.rfc,
      razonSocial: v.razonSocial,
      nombreComercial: v.nombreComercial,
      regimenFiscal: v.regimenFiscal,
      email: v.email,
      correosCc: v.correosCc,
      telefono: v.telefono,

      pais: v.pais,
      codigoPostal: v.codigoPostal,
      municipio: v.municipio,
      estado: v.estado,
      localidad: v.localidad,
      colonia: v.colonia,
      calle: v.calle,
      referencia: v.referencia,
      noExterior: v.noExterior,
      noInterior: v.noInterior,

      metodoPago: v.metodoPago,
      formaPago: v.formaPago,
      moneda: v.moneda,
      exportacion: v.exportacion,
      usoCfdi: v.usoCfdi,

      notas: v.notas,
    };

    this.cliente_clientes.CrearCliente(payload).subscribe({
      next: () => {
        this.alertService.showSuccess('Portalito', 'Datos guardados con éxito');
        this.form.reset({ pais: 'MX' });
        this.colonias = [];
        this.router.navigate(['/cliente/clientes']); // opcional: regresar al listado
      },
      error: (err) => {
        this.alertService.showError('Error', err?.error?.message || 'No se pudo guardar el cliente');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}