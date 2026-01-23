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
import { AreaService } from 'app/services/admin/area.service';
import { OrganizacionService } from 'app/services/admin/organizacion.service';
import { AlertService } from 'app/services/alert.service';

import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule } from '@angular/material/tree';
import { v4 as uuidv4 } from 'uuid';
import { SubareaFormComponent } from 'app/modals/subarea-form/subarea-form.component';

  interface AreaNode {
    id: string;
    nombre: string;
    children?: AreaNode[];
  }

  interface AreaFlatNode {
    expandable: boolean;
    nombre: string;
    level: number;
    id: string;
  }



@Component({
  selector: 'app-subareas',
  imports: [
    MatTreeModule,
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
  templateUrl: './subareas.component.html',
  styleUrl: './subareas.component.scss'
})
export class SubareasComponent implements OnInit {
  searchInputControl: UntypedFormControl = new UntypedFormControl();
  isLoading: boolean = false;

  displayedColumns: string[] = ['organizacion', 'clave', 'nombre', 'responsable', 'telefono', 'activo', 'acciones'];
  dataSource2: any[] = [];
  organizaciones: any[] = [];
  organizacionControl = new FormControl('0');


  //------------------
  private transformer = (node: AreaNode, level: number): AreaFlatNode => ({
    expandable: !!node.children && node.children.length > 0,
    nombre: node.nombre,
    level,
    id: node.id
  });

  treeControl = new FlatTreeControl<AreaFlatNode>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this.transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  nestedData: AreaNode[] = [];
  //------------------
  constructor(
    private dialog: MatDialog,
    private areaService: AreaService,
    private organizacionService: OrganizacionService,
    private alertService: AlertService,
  ) {
    this.dataSource.data = this.nestedData;

  }

  hasChild = (_: number, node: AreaFlatNode) => node.expandable;

  agregarAreaPadre() {
    const nuevaArea: AreaNode = {
      id: uuidv4(),
      nombre: 'Nueva Área',
      children: []
    };
    this.nestedData.push(nuevaArea);
    this.dataSource.data = this.nestedData;
  }

  agregarSubArea(node: AreaFlatNode) {

    //buscamos el area correspondiente
    console.log('agregar',node.id);
    this.areaService.GetById(node.id).subscribe({
      next: (value) => {
        console.log(value.id);
        value.areaPadreId = value.id;
        const dialogRef = this.dialog.open(SubareaFormComponent, {
          width: '500px',
          data: value.areaPadreId,
        });

        dialogRef.afterClosed().subscribe((result: any | null) => {
          if (result) {
            this.areaService.CrearSubArea(result).subscribe({
                next: (value) => {
                  this.loadAreas();
                }
                , error: (err) => {
                  this.alertService.showError('Error', err.error);
                }
              })
          }
        });
      },
      error: (err) => {
        this.alertService.showError('', err.error);
      }
    });

  }

  editarSubArea(node: AreaFlatNode) {

    //buscamos el area correspondiente
    console.log(node.id);
    this.areaService.GetById(node.id).subscribe({
      next: (value) => {
        console.log(value);
        const dialogRef = this.dialog.open(SubareaFormComponent, {
          width: '500px',
          data: {
            ...value
          },
        });

        dialogRef.afterClosed().subscribe((result: any | null) => {
          if (result) {
            this.areaService.Update(result.id, result).subscribe({
                next: (value) => {
                  this.loadAreas();
                }
                , error: (err) => {
                  this.alertService.showError('Error', err.error);
                }
              })
          }
        });
      },
      error: (err) => {
        this.alertService.showError('', err.error);
      }
    });


  }

  ngOnInit(): void {
    this.loadOrganizaciones();
    this.loadAreas();

    /*
    this.organizacionControl.valueChanges.subscribe(() => {
      this.loadAreas();
    });
    */
  }

  loadOrganizaciones() {

    this.organizacionService.GetAll().subscribe((data) => {
      console.log(data);
      this.organizaciones = data;
    });

  }

  onOrganizacionChange(idOrganizacion: string | null) {
    console.log('Organización seleccionada:', idOrganizacion);
    this.cargarTabla(idOrganizacion);
  }

  cargarTabla(idOrganizacion: string | null): void {
    // Aquí llamas a tu servicio para obtener las áreas filtradas
    this.areaService.GetArbolAreas(idOrganizacion).subscribe((data) => {
      console.log(data);
      this.dataSource.data = data;
    });
  }

  nueva(): void {

  }

  activar(item) {
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

  desactivar(item) {
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

  asignarResponsables(area: any): void {

  }

  loadAreas() {

    /*
    //this.isLoading = true;
    const orgId = this.organizacionControl.value;
    this.dataSource2 = [];

    this.areaService.GetAll().subscribe((data) => {
      this.dataSource = data;
      this.isLoading = false;
      console.log(data);
    });
    */
  }
}
