import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { FuseCardComponent } from '@fuse/components/card';
import { Supervisor_CatCategoriaService } from 'app/services/supervisor/supervisor_catcategoria.service';
import { Supervisor_CatPrioridadService } from 'app/services/supervisor/supervisor_catprioridad.service';
import { Supervisor_OrganizacionService } from 'app/services/supervisor/supervisor_organizacion.service';
import { Supervisor_TicketService } from 'app/services/supervisor/supervisor_ticket.service';
import { AlertService } from 'app/services/alert.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-tickets-asignados',
  imports: [
    MatSelectModule,
    MatFormFieldModule,
    MatOptionModule,
    MatFormField,
    MatLabel,
    MatTableModule,
    FuseCardComponent,
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
  templateUrl: './tickets-asignados.component.html',
  styleUrl: './tickets-asignados.component.scss'
})
export class TicketsAsignadosComponent implements OnInit{
  searchInputControl: UntypedFormControl = new UntypedFormControl();
  isLoading: boolean = false;

  filtroTexto: string = '';
  filtroArea: string = '';
  filtroCategoria: string = '';
  filtroPrioridad: string = '';

  organizaciones: any[] = [];
  prioridades: any[] = [];
  caegorias: any[] = [];

  organizacionControl = new FormControl('0');
  prioridadControl = new FormControl('0');
  categoriaControl = new FormControl('0');

  columnas: string[] = [
    'folio',
    'organizacion',
    'solicitante',
    'area',
    'estatus',
    'categoria',
    'prioridad',
    'descripcion',
    'contacto',
    'afectaOperacion',
    'fechaCreacion',
    'asignado',
    'acciones'
  ];

  dataSource = new MatTableDataSource<any>([]);

  tickets = [
    {
      folio: 1,
      solicitante: 'Juan Pérez',
      area: 'Urgencias',
      estatus: 'Abierto',
      categoria: 'Equipo Médico',
      prioridad: 'Alta',
      descripcion: 'El monitor de signos vitales no enciende.',
      contacto: { nombre: 'Juan Pérez', telefono: '555-123-4567' },
      afectaOperacion: true,
      fechaCreacion: new Date('2025-05-20'),
      asignado: '',
      organizacion: 'UMAE Especialidades Nuevo Leon'
    },
    {
      folio: 1,
      solicitante: 'Ana Gómez',
      area: 'Laboratorio',
      estatus: 'Abierto',
      categoria: 'Infraestructura',
      prioridad: 'Media',
      descripcion: 'Fuga de agua debajo del fregadero.',
      contacto: { nombre: 'Ana Gómez', telefono: '555-987-6543' },
      afectaOperacion: false,
      fechaCreacion: new Date('2025-05-18'),
      asignado: '',
      organizacion: 'UMAE Especialidades Nuevo Leon'
    },
    {
      folio: 1,
      solicitante: 'Luis Ramírez',
      area: 'Rayos X',
      estatus: 'Abierto',
      categoria: 'Sistema',
      prioridad: 'Alta',
      descripcion: 'El sistema PACS no conecta.',
      contacto: { nombre: 'Luis Ramírez', telefono: '555-555-5555' },
      afectaOperacion: true,
      fechaCreacion: new Date('2025-05-22'),
      asignado: '',
      organizacion: 'UMAE Especialidades Nuevo Leon'
    }
  ];

  get areasUnicas() {
    return [...new Set(this.tickets.map(t => t.area))];
  }

  get categoriasUnicas() {
    return [...new Set(this.tickets.map(t => t.categoria))];
  }

  get prioridadesUnicas() {
    return [...new Set(this.tickets.map(t => t.prioridad))];
  }

  constructor(
      private dialog: MatDialog,
      private organizacionService: Supervisor_OrganizacionService,
      private prioridadService: Supervisor_CatPrioridadService,
      private categoriaService:Supervisor_CatCategoriaService,
      private ticketService: Supervisor_TicketService,
      private alertService: AlertService,
      private router: Router
    ) { }

    ngOnInit(): void {
      this.dataSource.data = [];
      forkJoin([this.organizacionService.GetAll(), this.prioridadService.GetAll(), this.categoriaService.GetAll(), this.ticketService.GetTicketsAsignados()]).subscribe({
            next: ([organizacionResponse, prioridadResponse, categoriasResponsa, ticketsResponse]) => {

              console.log(ticketsResponse);
              this.organizaciones = organizacionResponse;
              this.prioridades = prioridadResponse;
              this.caegorias = categoriasResponsa;
              this.dataSource.data = ticketsResponse;
            },
            complete: () => { },
            error: () => {
              this.alertService.showError('Error', 'Ocurrió un error inesperado.');
            }
          });
    }

    loadData(){

    }
  getPrioridadClass(prioridad: string) {
    switch (prioridad) {
      case 'Alta':
        return 'bg-red-100 text-red-700 font-semibold px-2 py-1 rounded-full text-sm';
      case 'Media':
        return 'bg-yellow-100 text-yellow-700 font-semibold px-2 py-1 rounded-full text-sm';
      case 'Baja':
        return 'bg-green-100 text-green-700 font-semibold px-2 py-1 rounded-full text-sm';
      default:
        return 'bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm';
    }
  }

  onFilterChange(){

  }

  verDetalle(id){
    this.router.navigate(['/supervisor/ticket-detalle', id]);
  }

  filteredTickets() {
    return this.tickets.filter(ticket => {
      const texto = this.filtroTexto.toLowerCase();
      return (
        (!this.filtroArea || ticket.area === this.filtroArea) &&
        (!this.filtroCategoria || ticket.categoria === this.filtroCategoria) &&
        (!this.filtroPrioridad || ticket.prioridad === this.filtroPrioridad) &&
        (
          ticket.solicitante.toLowerCase().includes(texto) ||
          ticket.area.toLowerCase().includes(texto) ||
          ticket.categoria.toLowerCase().includes(texto) ||
          ticket.descripcion.toLowerCase().includes(texto)
        )
      );
    });
  }
}