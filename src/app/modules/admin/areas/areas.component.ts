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

@Component({
  selector: 'app-areas',
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
  templateUrl: './areas.component.html'
})
export class AreasComponent implements OnInit {
  searchInputControl: UntypedFormControl = new UntypedFormControl();
  isLoading: boolean = false;

  displayedColumns: string[] = ['organizacion', 'clave', 'nombre', 'responsable', 'telefono', 'activo', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);
  organizaciones: any[] = [];
  organizacionControl = new FormControl('0');

  constructor(
    private dialog: MatDialog,
    private areaService: AreaService,
    private organizacionService: OrganizacionService,
    private alertService:AlertService
  ) { }

  ngOnInit(): void {
    this.loadOrganizaciones();
    this.loadAreas();
  
    // Filtro por input
    this.searchInputControl.valueChanges.subscribe(value => {
      console.log(1);
      this.dataSource.filter = value.trim().toLowerCase();
    });

    this.dataSource.filterPredicate = (data, filter) => {
      return Object.values(data).some(value =>
        (value + '').toLowerCase().includes(filter)
      );
    };
    /*
    this.organizacionControl.valueChanges.subscribe(() => {
      this.loadAreas();
    });
    */
  }

  loadOrganizaciones() {

    this.organizacionService.GetAll().subscribe((data) => {
      this.organizaciones = data;
    });

  }

  onOrganizacionChange(idOrganizacion: string | null) {
    console.log('Organización seleccionada:', idOrganizacion);
    this.cargarTabla(idOrganizacion);
  }

  cargarTabla(idOrganizacion: string | null): void {
    // Aquí llamas a tu servicio para obtener las áreas filtradas
    /*
    this.areaService.getAreas(idOrganizacion).subscribe((data) => {
      this.dataSource.data = data;
    });
    */
  }

  nueva(): void {
    const dialogRef = this.dialog.open(AreaFormComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if(result){
          this.loadAreas();
        }
      }
    });
  }

  activar(item){
    this.areaService.Reactivar(item.id)
    .subscribe({
      next: (response) => {
        this.loadAreas();
      },
      complete: () => {
        //this.btnLoading = false;
      },
      error: (err) => {
        //this.btnLoading = false;
        this.alertService.showError("Error", err.error);
      }
    })
  }

  desactivar(item){
    this.areaService.Desactivar(item.id)
    .subscribe({
      next: (response) => {
        this.loadAreas();
      },
      complete: () => {
        //this.btnLoading = false;
      },
      error: (err) => {
        //this.btnLoading = false;
        this.alertService.showError("Error", err.error);
      }
    })
  }

  asignarResponsables(area:any): void {
    console.log(area);
    const dialogRef = this.dialog.open(AsignarResponsablesComponent, {
      width: '750px',
      data: { area }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if(result){
          this.loadAreas();
        }
        //this.loadData();
        // Aquí puedes llamar a tu servicio para guardar la nueva organización
      }
    });
  }

  loadAreas() {
    //this.isLoading = true;
    const orgId = this.organizacionControl.value;
    this.dataSource.data = [];

    this.areaService.GetAll().subscribe((data) => {
      this.dataSource.data = data;
      this.isLoading = false;
      console.log(data);
    });
  }
}
