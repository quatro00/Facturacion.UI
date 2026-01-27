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
import { debounceTime, distinctUntilChanged, forkJoin, switchMap } from 'rxjs';
import { AreaService } from 'app/services/admin/area.service';
import { OrganizacionService } from 'app/services/admin/organizacion.service';
import { SeleccionAreaComponent } from 'app/modals/seleccion-area/seleccion-area.component';
import { TicketService } from 'app/services/admin/ticket.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Cliente_Catalogos } from 'app/services/cliente/cliente_catalogos.service';
import { filter } from 'lodash';
import { Cliente_Perfil } from 'app/services/cliente/cliente_perfil.service';


@Component({
  selector: 'app-perfil',
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
    MatProgressSpinnerModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent implements OnInit {
  isLoading: boolean = false;
  cerBase64: string | null = null;
  keyBase64: string | null = null;
  passwordKey = '';

  archivos = [] as File[];
  regimenesFiscales = [];
  regimenesFiscalesFiltrados = [];


  categorias = [];
  prioridades = [];
  colonias = [];
  logoPreview: string | null = null;
  areaId;

  RFC_REGEX =
    /^([A-ZÑ&]{3,4})(\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])([A-Z\d]{3})$/;
  form: FormGroup;
  constructor(
    private fb: FormBuilder,
    private alertService: AlertService,
    private cliente_catalogos: Cliente_Catalogos,
    private cliente_perfil: Cliente_Perfil,
    private organizacionService: OrganizacionService,
    private ticketService: TicketService,
    private areaService: AreaService,
    private dialog: MatDialog,
  ) {


    this.form = this.fb.group({
      rfc: [
        '',
        [
          Validators.required,
          Validators.minLength(12),
          Validators.maxLength(13),
          Validators.pattern(
            /^([A-ZÑ&]{3,4})(\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])([A-Z\d]{3})$/
          )
        ]
      ],
      razonSocial: ['', Validators.required],
      regimenFiscal: ['', Validators.required],
      folioInicio: ['', Validators.required],
      celularNotificaciones: ['', Validators.required],
      codigoPostal: ['', Validators.required],
      municipio: ['', Validators.required],
      estado: ['', Validators.required],
      colonia: ['', Validators.required],
      calle: ['', Validators.required],
      noExterior: ['', Validators.required],
      noInterior: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.form.get('rfc')?.valueChanges.subscribe(rfc => {
    this.filtrarRegimenesPorRfc(rfc);
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

  filtrarRegimenesPorRfc(rfc: string): void {
  if (!rfc) {
    this.regimenesFiscalesFiltrados = [];
    this.form.get('regimenFiscal')?.reset();
    return;
  }

  const rfcLimpio = rfc.toUpperCase().trim();

  // Persona moral → 12 caracteres
  if (rfcLimpio.length === 12) {
    this.regimenesFiscalesFiltrados = this.regimenesFiscales.filter(
      x => x.moral === true
    );
  }

  // Persona física → 13 caracteres
  else if (rfcLimpio.length === 13) {
    this.regimenesFiscalesFiltrados = this.regimenesFiscales.filter(
      x => x.fisica === true
    );
  }

  // RFC incompleto
  else {
    this.regimenesFiscalesFiltrados = [];
  }

  // Limpia el régimen seleccionado si ya no es válido
  this.form.get('regimenFiscal')?.reset();
}

  onCerSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.cerBase64 = (reader.result as string).split(',')[1];
    };
    reader.readAsDataURL(file);
  }

  onKeySelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.keyBase64 = (reader.result as string).split(',')[1];
    };
    reader.readAsDataURL(file);
  }

  descargarSellos() {
    this.isLoading = true;

    this.cliente_perfil.descargarSellos().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'SellosDigitales.zip';
        a.click();

        window.URL.revokeObjectURL(url);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.alertService.showError('Error', 'No se pudieron descargar los sellos');
      }
    });
  }

  enviarSellos(): void {

    if (!this.cerBase64 || !this.keyBase64 || !this.passwordKey) {
      return;
    }

    this.isLoading = true;

    const payload = {
      certificadoBase64: this.cerBase64,
      llavePrivadaBase64: this.keyBase64,
      passwordLlave: this.passwordKey
    };

    this.cliente_perfil.enviarSellos(payload).pipe(
      switchMap(() => this.cliente_perfil.subirSellosAFacturama(false))
    ).subscribe({
      next: () => {
        this.isLoading = false;
        // toast/snack
      },
      error: (err) => {
        this.isLoading = false;

        // Si ya existía CSD en Facturama, puedes ofrecer force
        const msg = err?.error ?? err?.message ?? 'Error';
        // muestra msg
        this.alertService.showError('Error', msg.message);
      }
    });
    /*
    this.cliente_perfil.enviarSellos(payload)
      .subscribe({
        next: () => {
          this.isLoading = false;
          alert('Sellos enviados correctamente');
        },
        error: err => {
          this.isLoading = false;
          alert(err.error ?? 'Error al enviar sellos');
        }
      });
      */
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

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    const reader = new FileReader();
    reader.onload = () => {
      this.logoPreview = reader.result as string;
    };

    reader.readAsDataURL(file);
  }

  loadData() {
    forkJoin([
      this.cliente_catalogos.GetRegimenesFiscales(),
      this.cliente_perfil.GetRazonSocial()
    ]).subscribe({
      next: ([
        catRegimenFiscalResponse,
        getRazonSocialResponse
      ]) => {
        this.regimenesFiscales = catRegimenFiscalResponse;

        console.log(this.regimenesFiscales);
        console.log(getRazonSocialResponse);
        this.form.patchValue({
          calle: getRazonSocialResponse.calle,
          celularNotificaciones: getRazonSocialResponse.celularNotificaciones,
          codigoPostal: getRazonSocialResponse.codigoPostal,
          colonia: getRazonSocialResponse.colonia,
          estado: getRazonSocialResponse.estado,
          folioInicio: getRazonSocialResponse.folioInicio,
          municipio: getRazonSocialResponse.municipio,
          noExterior: getRazonSocialResponse.noExterior,
          noInterior: getRazonSocialResponse.noInterior,
          razonSocial: getRazonSocialResponse.razonSocial,
          regimenFiscal: getRazonSocialResponse.regimenFiscalId,
          rfc: getRazonSocialResponse.rfc,
        });
      },
      complete: () => { },
      error: (err) => {
        this.alertService.showError('Error', err.error);
      }
    });
  }

  abrirSelectorDeArea() {
    console.log('Abrir modal de selección de área');
    // Aquí abrirías tu modal personalizado

    this.areaService.GetArbolAreas(this.form.value.organizacion).subscribe({
      next: (value) => {
        console.log('Arbol', value);
        const dialogRef = this.dialog.open(SeleccionAreaComponent, {
          width: '900px',
          data: value,
        });

        dialogRef.afterClosed().subscribe((result: any | null) => {
          if (result) {
            this.form.patchValue({
              area: result.nombre
            });
            this.areaId = result.id;
          }
        });
      },
      error: (err) => {
        this.alertService.showError('', err.error);
      }
    });
  }

  onFileSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    this.archivos = files;
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
      regimenFiscalId: this.form.value.regimenFiscal,
      folioInicio: this.form.value.folioInicio,
      celularNotificaciones: this.form.value.celularNotificaciones,
      codigoPostal: this.form.value.codigoPostal,
      municipio: this.form.value.municipio,
      estado: this.form.value.estado,
      colonia: this.form.value.colonia,
      calle: this.form.value.calle,
      noExterior: this.form.value.noExterior,
      noInterior: this.form.value.noInterior
    };

    this.cliente_perfil.crearRazonSocial(payload)
      .subscribe({
        next: () => {
          // éxito
          this.alertService.showSuccess('Portalito', 'Datos guardados con éxito');
          this.isLoading = false;
        },
        error: (err) => {
          this.alertService.showError('Error', err.error.message);
          this.isLoading = false;
        }
      });
  }
  actualizarCertificados() {
    this.form.disable();
    const request = new FormData();
    request.append('CategoriaId', this.form.value.categoria);
    request.append('PrioridadId', this.form.value.prioridad);
    request.append('Descripcion', this.form.value.descripcion);
    request.append('AreaId', this.areaId);
    request.append('AreaEspecifica', this.form.value.areaEspecifica);
    request.append('NombreContacto', this.form.value.nombreContacto);
    request.append('Telefono', this.form.value.telefono);
    request.append('Correo', this.form.value.correo);
    request.append('AfectaOperacion', this.form.value.afectaOperacion);
    request.append('DesdeCuandoOcurre', this.form.value.desdeCuandoOcurre);


    this.archivos.forEach((archivo, index) => {
      request.append('Archivos', archivo); // Usa el mismo nombre si es un arreglo en backend
    });
    this.ticketService.Crear(request)
      .subscribe({
        next: (response) => { this.alertService.showSuccess('Fix360', 'Ticket creado correctamente.'); this.form.enable(); this.form.reset(); this.areaId = null; },
        error: (err) => { this.alertService.showError('Error', err.error); this.form.enable(); },
      })
    // Aquí enviarías al backend o servicio correspondiente
  }

}
