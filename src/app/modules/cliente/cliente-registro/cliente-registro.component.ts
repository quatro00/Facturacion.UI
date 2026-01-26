import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog, MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { AlertService } from 'app/services/alert.service';
import { CatCategoriaService } from 'app/services/admin/catcategoria.service';
import { CatPrioridadService } from 'app/services/admin/catprioridad.service';
import { debounceTime, distinctUntilChanged, forkJoin } from 'rxjs';
import { AreaService } from 'app/services/admin/area.service';
import { OrganizacionService } from 'app/services/admin/organizacion.service';
import { SeleccionAreaComponent } from 'app/modals/seleccion-area/seleccion-area.component';
import { TicketService } from 'app/services/admin/ticket.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Cliente_Catalogos } from 'app/services/cliente/cliente_catalogos.service';
import { filter } from 'lodash';
import { Cliente_Perfil } from 'app/services/cliente/cliente_perfil.service';
import { Cliente_Clientes } from 'app/services/cliente/cliente_clientes.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cliente-registro',
  imports: [MatSelectModule,
      MatFormFieldModule,
      MatOptionModule,
      MatFormField,
      MatLabel,
      MatDialogActions,
      MatDialogContent,
      FormsModule,
      ReactiveFormsModule,
      MatFormFieldModule,
      MatDatepickerModule,
      MatRadioModule,
      MatIcon,
      MatTooltipModule,
      MatButton,
      MatInputModule,
      CommonModule,
      MatProgressSpinnerModule
    ],
  templateUrl: './cliente-registro.component.html',
  styleUrl: './cliente-registro.component.scss'
})
export class ClienteRegistroComponent implements OnInit {
  isLoading: boolean = false;

  paises = [{id:'MXN', descripcion:'México'}]
  regimenesFiscales = [];
  
  metodosPago = [];
  formasPago = [];
  monedas = [];
  exportaciones = [];
  usosCfdi = [];

  colonias = [];

  form: FormGroup;
  constructor(
    private fb: FormBuilder,
    private alertService: AlertService,
    private cliente_catalogos: Cliente_Catalogos,
    private cliente_clientes: Cliente_Clientes,
    private organizacionService: OrganizacionService,
    private ticketService: TicketService,
    private areaService: AreaService,
    private dialog: MatDialog,
    private router: Router
  ) {


    this.form = this.fb.group({
      rfc: ['', Validators.required],
      razonSocial: ['', Validators.required],
      regimenFiscal: ['', Validators.required],
      email: ['', Validators.required],
      telefono: ['', Validators.required],
      pais: ['', Validators.required],
      codigoPostal: ['', Validators.required],
      estado: ['', Validators.required],
      municipio: ['', Validators.required],
      colonia: ['', Validators.required],
      calle: ['', Validators.required],
      noExterior: ['', Validators.required],
      noInterior: ['', Validators.required],

      metodoPago: [''],
      formaPago: [''],
      moneda: [''],
      exportacion: [''],
      usoCfdi: [''],
    });
  }

  ngOnInit(): void {
    this.form.get('codigoPostal')!
      .valueChanges
      .pipe(
        debounceTime(500),              // espera a que deje de escribir
        distinctUntilChanged(),         // evita valores repetidos
      )
      .subscribe(cp => {
        this.buscarCodigoPostal(cp);
      });

    this.loadData();
  }


  buscarCodigoPostal(codigoPostal: string): void {
    this.cliente_catalogos.GetMunicipio(codigoPostal)
      .subscribe(res => {
        this.form.patchValue({
          estado: res.estado,
          municipio: res.municipio
        });
        this.colonias = res.colonia;
      });
  }

  loadData() {
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
        this.regimenesFiscales = catRegimenFiscalResponse;
        this.metodosPago = catMetodoPagoResponse;
        this.formasPago = catFormaPagoResponse;
        this.monedas = catMonedaResponse;
        this.exportaciones = catExportacionResponse;
        this.usosCfdi = catUsosCfdiResponse
      },
      complete: () => { },
      error: (err) => {
        this.alertService.showError('Error', err.error);
      }
    });
  }


  actualizarDatos() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const payload = {
      rfc: this.form.value.rfc,
      razonSocial: this.form.value.razonSocial,
      regimenFiscal: this.form.value.regimenFiscal,
      email: this.form.value.email,
      telefono: this.form.value.telefono,
      pais: this.form.value.pais,
      codigoPostal: this.form.value.codigoPostal,
      municipio: this.form.value.municipio,
      estado: this.form.value.estado,
      colonia: this.form.value.colonia,
      calle: this.form.value.calle,
      noExterior: this.form.value.noExterior,
      noInterior: this.form.value.noInterior,

      metodoPago: this.form.value.metodoPago,
      formaPago: this.form.value.formaPago,
      moneda: this.form.value.moneda,
      exportacion: this.form.value.exportacion,
      usoCfdi: this.form.value.usoCfdi,
    };

    this.cliente_clientes.CrearCliente(payload)
      .subscribe({
        next: () => {
          // éxito
          this.alertService.showSuccess('Portalito', 'Datos guardados con éxito');
          this.isLoading = false;
          this.form.reset();
        },
        error: (err) => {
          this.alertService.showError('Error', err.error.message);
          this.isLoading = false;
        }
      });
  }
  

}
