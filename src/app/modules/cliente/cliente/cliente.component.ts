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
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-cliente',
  imports: [
    MatSelectModule,
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
  templateUrl: './cliente.component.html',
  styleUrl: './cliente.component.scss'
})
export class ClienteComponent implements OnInit {
  isLoading: boolean = false;

  paises = [{id:'MXN', descripcion:'México'}]
  regimenesFiscales = [];
  
  metodosPago = [];
  formasPago = [];
  monedas = [];
  exportaciones = [];
  usosCfdi = [];
  coloniaSelected= '';
  colonias = [];

  clienteId!: string;
    cliente: any;

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
    private router: Router,
    private _route: ActivatedRoute,
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
    this.clienteId = this._route.snapshot.paramMap.get('id');
    this.cliente_clientes.GetById(this.clienteId)
    .subscribe(res => {
        console.log(res);
        this.form.patchValue({
          rfc: res.rfc,
          razonSocial: res.razonSocial,
          regimenFiscal: res.regimenFiscalId,
          email: res.email,
          telefono: res.telefono,
          pais: res.pais,
          codigoPostal: res.codigoPostal,
          estado: res.estado,
          municipio: res.municipio,
          colonia: res.colonia,
          calle: res.calle,
          noExterior: res.noExterior,
          noInterior: res.noInterior,
          metodoPago: res.metodoPago,
          formaPago: res.formaPago,
          moneda: res.moneda,
          exportacion: res.exportacion,
          usoCfdi: res.usoCfdi,
        });
        
      });

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
      Rfc: this.form.value.rfc,
      RazonSocial: this.form.value.razonSocial,
      RegimenFiscal: this.form.value.regimenFiscal,
      Email: this.form.value.email,
      Telefono: this.form.value.telefono,
      Pais: this.form.value.pais,
      CodigoPostal: this.form.value.codigoPostal,
      Municipio: this.form.value.municipio,
      Estado: this.form.value.estado,
      Colonia: this.form.value.colonia,
      Calle: this.form.value.calle,
      NoExterior: this.form.value.noExterior,
      NoInterior: this.form.value.noInterior,

      MetodoPago: this.form.value.metodoPago,
      FormaPago: this.form.value.formaPago,
      Moneda: this.form.value.moneda,
      Exportacion: this.form.value.exportacion,
      UsoCfdi: this.form.value.usoCfdi,
    };

    console.log(payload);
    this.cliente_clientes.updateCliente(this.clienteId, payload)
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

