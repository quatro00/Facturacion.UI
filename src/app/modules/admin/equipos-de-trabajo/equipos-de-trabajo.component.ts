import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AreaFormComponent } from 'app/modals/area-form/area-form.component';
import { AsignarResponsablesComponent } from 'app/modals/asignar-responsables/asignar-responsables.component';
import { AreaService } from 'app/services/admin/area.service';
import { OrganizacionService } from 'app/services/admin/organizacion.service';
import { AlertService } from 'app/services/alert.service';
import { MatTableDataSource } from '@angular/material/table';
import { EquipoDeTrabajoFormComponent } from 'app/modals/equipo-de-trabajo-form/equipo-de-trabajo-form.component';
import { forkJoin } from 'rxjs';
import { UsuarioService } from 'app/services/admin/usuario.service';
import { EquipoDeTrabajoService } from 'app/services/admin/equipo-de-trabajo.service';
import { AsignarAgenteModalComponent } from 'app/modals/asignar-agente-modal/asignar-agente-modal.component';
import { AsignarCategoriasComponent } from 'app/modals/asignar-categorias/asignar-categorias.component';

@Component({
  selector: 'app-equipos-de-trabajo',
  imports: [
    MatTooltipModule,
    CommonModule,
    MatTableModule,
    MatSelectModule,
    MatSortModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatIcon,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule],
  templateUrl: './equipos-de-trabajo.component.html',
  styleUrl: './equipos-de-trabajo.component.scss'
})
export class EquiposDeTrabajoComponent implements OnInit {

  searchInputControl: UntypedFormControl = new UntypedFormControl();
  isLoading: boolean = false;

  displayedColumns: string[] = ['organizacion', 'nombre', 'supervisor', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);
  organizaciones: any[] = [];
  organizacionControl = new FormControl('0');

  constructor(
    private dialog: MatDialog,
    private areaService: AreaService,
    private organizacionService: OrganizacionService,
    private usuarioService: UsuarioService,
    private equipoDeTrabajoService: EquipoDeTrabajoService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.loadOrganizaciones();
    this.loadData();
  }

  loadData() {
    this.equipoDeTrabajoService.GetAll().subscribe((data) => {
      this.dataSource.data = data;
    });
  }

  editarEquipoDeTrabajo(element: any) {

    //buscamos el area correspondiente
    forkJoin([this.usuarioService.GetSupervisores(), this.organizacionService.GetAll()]).subscribe({
      next: ([usuariosResponse, organizacionesResponse]) => {
        const dialogRef = this.dialog.open(EquipoDeTrabajoFormComponent, {
          width: '500px',
          data: {
            organizaciones: organizacionesResponse,
            supervisores: usuariosResponse,
            ...element
          },
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            if (result) {
              //this.loadAreas();
              this.equipoDeTrabajoService.Crear(result)
                .subscribe({
                  next: (response) => {
                    //this
                  },
                  error: (err) => {
                    //this.btnLoading = false;
                    this.alertService.showError("Error", err.error);
                  }
                })
            }
          }
        });
      },
      complete: () => { },
      error: () => {
        this.alertService.showError('Error', 'Ocurrió un error inesperado.');
      }
    });


  }

  loadOrganizaciones() {

    this.organizacionService.GetAll().subscribe((data) => {
      this.organizaciones = data;
    });

  }

  onOrganizacionChange(idOrganizacion: string | null) {
    console.log('Organización seleccionada:', idOrganizacion);
    //this.cargarTabla(idOrganizacion);
  }

  nueva(): void {
    //buscamos los datos a pasar, tanto las organizaciones como los supervisores
    forkJoin([this.usuarioService.GetSupervisores(), this.organizacionService.GetAll()]).subscribe({
      next: ([usuariosResponse, organizacionesResponse]) => {
        const dialogRef = this.dialog.open(EquipoDeTrabajoFormComponent, {
          width: '500px',
          data: {
            organizaciones: organizacionesResponse,
            supervisores: usuariosResponse
          },
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            if (result) {
              //this.loadAreas();
              this.equipoDeTrabajoService.Crear(result)
                .subscribe({
                  next: (response) => {
                    //this
                  },
                  error: (err) => {
                    //this.btnLoading = false;
                    this.alertService.showError("Error", err.error);
                  }
                })
            }
          }
        });
      },
      complete: () => { },
      error: () => {
        this.alertService.showError('Error', 'Ocurrió un error inesperado.');
      }
    });
  }

  asignarCategorias(equipoTrabajo: any) {
    console.log(equipoTrabajo);
    const dialogRef = this.dialog.open(AsignarCategoriasComponent, {
      width: '750px',
      data: { equipoTrabajo }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(result);
        //this.loadData();
        // Aquí puedes llamar a tu servicio para guardar la nueva organización
      }
    });
  }

  asignarResponsables(equipoTrabajo: any) {
    console.log(equipoTrabajo);
    const dialogRef = this.dialog.open(AsignarAgenteModalComponent, {
      width: '750px',
      data: { equipoTrabajo }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(result);
        //this.loadData();
        // Aquí puedes llamar a tu servicio para guardar la nueva organización
      }
    });
  }
}
