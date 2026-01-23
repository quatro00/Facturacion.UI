import { TextFieldModule } from '@angular/cdk/text-field';
import { NgClass, TitleCasePipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  Renderer2,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatButtonToggleChange,
  MatButtonToggleModule,
} from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FuseCardComponent } from '@fuse/components/card';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { Supervisor_TicketService } from 'app/services/supervisor/supervisor_ticket.service';
import { AlertService } from 'app/services/alert.service';
import { MatDialog } from '@angular/material/dialog';
import { AgregarMensajeComponent } from 'app/modals/agregar-mensaje/agregar-mensaje.component';
import { AgregarArchivoComponent } from 'app/modals/agregar-archivo/agregar-archivo.component';
import { EditarTicketComponent } from 'app/modals/editar-ticket/editar-ticket.component';
import { AsignarTicketComponent } from 'app/modals/asignar-ticket/asignar-ticket.component';
import { CerrarTicketComponent } from 'app/modals/cerrar-ticket/cerrar-ticket.component';
import { CambiarEstatusTicketComponent } from 'app/modals/cambiar-estatus-ticket/cambiar-estatus-ticket.component';
import { Supervisor_EquipoDeTrabajoService } from 'app/services/supervisor/supervisor_equipo-de-trabajo.service';
import { CancelarTicketComponent } from 'app/modals/cancelar-ticket/cancelar-ticket.component';
import { EnEsperaTicketComponent } from 'app/modals/en-espera-ticket/en-espera-ticket.component';
import { ResolverTicketComponent } from 'app/modals/resolver-ticket/resolver-ticket.component';
@Component({
  selector: 'app-ticket-detalle',
  imports: [
    CommonModule,
    MatButtonToggleModule,
    FormsModule,
    FuseCardComponent,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    NgClass,
    MatMenuModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    TextFieldModule,
    MatDividerModule,
    MatTooltipModule,
    MatCardModule,
    MatChipsModule,
    TitleCasePipe
  ],
  templateUrl: './ticket-detalle.component.html',
  styleUrl: './ticket-detalle.component.scss'
})
export class TicketDetalleComponent implements OnInit {

  @ViewChildren(FuseCardComponent, { read: ElementRef })
  private _fuseCards: QueryList<ElementRef>;
  id;
  filters: string[] = [
    'all',
    'article',
    'listing',
    'list',
    'info',
    'shopping',
    'pricing',
    'testimonial',
    'post',
    'interactive',
  ];
  numberOfCards: any = {};
  selectedFilter: string = 'all';

  isLoading = false;

  ticket = {
    folio: '',
    categoria: '',
    prioridad: '',
    area: '',
    descripcion: '',
    afectaOperacion: '',
    desdeCuandoSePresenta: '',
    estatus: '',
    contactoNombre: '',
    contactoCorreo: '',
    contactoTelefono: '',
    asignadoNombre: '',
    asignadoCorreo: '',
    asignadoTelefono: '',

    reportante: {
      nombre: 'Juan Pérez',
      telefono: '8112340000',
      correo: 'juan.perez@hospital.com'
    },

    archivos: [],
    mensajes: []
  };

  constructor(
    private route: ActivatedRoute,
    private ticketService: Supervisor_TicketService,
    private equipoTrabajoService: Supervisor_EquipoDeTrabajoService,
    private alertService: AlertService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadData();
    }
  }

  loadData() {
    this.ticketService.VerDetalle(this.id)
      .subscribe({
        next: (response) => {
          console.log(response);
          this.ticket = response;
        },
        complete: () => {
          //this.btnLoading = false;
        },
        error: () => {
          //this.btnLoading = false;
          this.alertService.showError('Error', 'Ocurrió un error inesperado.');
        }
      })
  }

  agregarMensaje() {
    const dialogRef = this.dialog.open(AgregarMensajeComponent, {
      width: '500px',
      data: this.id,
    });

    dialogRef.afterClosed().subscribe((result: any | null) => {
      if (result) {
        this.ticketService.AgregarMensaje(result)
          .subscribe({
            next: (result) => { this.alertService.showSuccess('Fix360', 'Mensaje creado correctamente.'); this.loadData(); },
            error: (err) => { this.alertService.showError('Error', err.error); },
          })
      }
    });
  }

 

  cerrarTicket() {
    const dialogRef = this.dialog.open(CerrarTicketComponent, {
      width: '500px',
      data: this.id,
    });

    dialogRef.afterClosed().subscribe((result: any | null) => {
      if (result) {
        console.log(result);
      }
    });
  }

  cancelarTicket(ticket) {
    const dialogRef = this.dialog.open(CancelarTicketComponent, {
      width: '500px',
      data: { ticketId: ticket.id },
    });

    dialogRef.afterClosed().subscribe((result: any | null) => {
      if (result) {
       this.ticketService.CancelarTicket(result)
                .subscribe({
                  next: (response) => { this.loadData(); },
                  error: (err) => { this.alertService.showError('Error', err.error); },
                })
      }
    });
  }

  enEsperaTicket(ticket) {
    const dialogRef = this.dialog.open(EnEsperaTicketComponent, {
      width: '500px',
      data: { ticketId: ticket.id },
    });

    dialogRef.afterClosed().subscribe((result: any | null) => {
      if (result) {
       this.ticketService.EnEsperaTicket(result)
                .subscribe({
                  next: (response) => { this.loadData(); },
                  error: (err) => { this.alertService.showError('Error', err.error); },
                })
      }
    });
  }

  resolverTicket(ticket) {
    const dialogRef = this.dialog.open(ResolverTicketComponent, {
      width: '500px',
      data: { ticketId: ticket.id },
    });

    dialogRef.afterClosed().subscribe((result: any | null) => {
      if (result) {
       this.ticketService.ResolverTicket(result)
                .subscribe({
                  next: (response) => { this.loadData(); },
                  error: (err) => { this.alertService.showError('Error', err.error); },
                })
      }
    });
  }

  asignarTicket(ticket) {
    console.log(ticket);
    this.equipoTrabajoService.GetAgentesByResponsable()
      .subscribe({
        next: (response) => {
          const dialogRef = this.dialog.open(AsignarTicketComponent, {
            width: '500px',
            data: { ticketId: ticket.id, agentes: response },
          });

          dialogRef.afterClosed().subscribe((result: any | null) => {
            if (result) {
              this.ticketService.AsignarTicket(result)
                .subscribe({
                  next: (response) => { this.loadData(); },
                  error: (err) => { this.alertService.showError('Error', err.error); },
                })
            }
          });

        },
        error: (err) => { this.alertService.showError('Error', err.error); },
      })


  }

  editarTicket() {
    const dialogRef = this.dialog.open(EditarTicketComponent, {
      width: '500px',
      data: this.id,
    });

    dialogRef.afterClosed().subscribe((result: any | null) => {
      if (result) {
        console.log(result);
      }
    });
  }
  agregarArchivo() {
    const dialogRef = this.dialog.open(AgregarArchivoComponent, {
      width: '500px',
      data: this.id,
    });

    dialogRef.afterClosed().subscribe((result: any | null) => {
      if (result) {
        this.ticketService.AgregarArchivos(result)
          .subscribe({
            next: (response) => { this.alertService.showSuccess('Fix360', 'Archivo agregado correctamente.'); this.loadData(); },
            error: (err) => { this.alertService.showError('Error', err.error); },
          })
      }
    });
  }
}
