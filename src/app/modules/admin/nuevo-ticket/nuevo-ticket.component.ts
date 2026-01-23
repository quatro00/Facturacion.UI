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
import { forkJoin } from 'rxjs';
import { AreaService } from 'app/services/admin/area.service';
import { OrganizacionService } from 'app/services/admin/organizacion.service';
import { SeleccionAreaComponent } from 'app/modals/seleccion-area/seleccion-area.component';
import { TicketService } from 'app/services/admin/ticket.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-nuevo-ticket',
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
  templateUrl: './nuevo-ticket.component.html',
  styleUrl: './nuevo-ticket.component.scss'
})
export class NuevoTicketComponent implements OnInit {
  isLoading: boolean = false;
  archivos = [] as File[];



  categorias = [];
  prioridades = [];
  organizacion = [];
  areaId;

  form: FormGroup;
  constructor(
    private fb: FormBuilder,
    private alertService: AlertService,
    private catCategoriaService: CatCategoriaService,
    private catPrioridadService: CatPrioridadService,
    private organizacionService: OrganizacionService,
    private ticketService: TicketService,
    private areaService: AreaService,
    private dialog: MatDialog,
  ) {


    this.form = this.fb.group({
      organizacion: ['', Validators.required],
      categoria: ['', Validators.required],
      prioridad: ['', Validators.required],
      descripcion: ['', Validators.required],
      area: ['', Validators.required], areaEspecifica: ['', Validators.required],
      nombreContacto: ['', Validators.required],
      telefono: ['', Validators.required],
      correo: ['', Validators.required],
      afectaOperacion: ['', Validators.required],
      desdeCuandoOcurre: ['', Validators.required],
      //area: [Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadData();
  }
  loadData() {
    forkJoin([this.catCategoriaService.GetAll(), this.catPrioridadService.GetAll(), this.organizacionService.GetAll()]).subscribe({
      next: ([catCategoriaResponse, catPrioridadResponse, organizacionResponse]) => {
        this.categorias = catCategoriaResponse;
        this.prioridades = catPrioridadResponse;
        this.organizacion = organizacionResponse;
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

  onOrganizacionChange(value) {
    this.form.patchValue({
      area: ''
    });
    this.areaId = null;
  }
  guardarTicket() {
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
        next: (response) => { this.alertService.showSuccess('Fix360', 'Ticket creado correctamente.'); this.form.enable(); this.form.reset(); this.areaId = null;},
        error: (err) => { this.alertService.showError('Error', err.error); this.form.enable();},
      })
    // Aquí enviarías al backend o servicio correspondiente
  }

}
