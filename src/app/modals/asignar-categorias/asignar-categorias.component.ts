import { CommonModule } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AreaService } from 'app/services/admin/area.service';
import { CatCategoriaService } from 'app/services/admin/catcategoria.service';
import { EquipoDeTrabajoService } from 'app/services/admin/equipo-de-trabajo.service';
import { AlertService } from 'app/services/alert.service';

@Component({
  selector: 'app-asignar-categorias',
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
    MatInputModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './asignar-categorias.component.html',
  styleUrl: './asignar-categorias.component.scss'
})
export class AsignarCategoriasComponent implements OnInit{
displayedColumns: string[] = ['nombre', 'select'];
  dataSource = new MatTableDataSource<any>();
  responsablesSeleccionados = new Set<string>();
  loading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private categoriaService: CatCategoriaService,
    private equipoTrabajoService: EquipoDeTrabajoService,
    private alertService: AlertService,
    private dialogRef: MatDialogRef<AsignarCategoriasComponent>,
  ) { }


  ngOnInit(): void {
    // Aquí deberías hacer la llamada a tu API para obtener posibles responsables
    this.loading = true;
    console.log(this.data);
    this.equipoTrabajoService.GetCategoriasAsignadas(this.data.equipoTrabajo).subscribe((data) => {
      this.loading = false;
      this.dataSource.data = data;
    });
    /*
    this.dataSource.data = [
      { id: '1', nombre: 'Juan Pérez', email: 'juan@dominio.com' },
      { id: '2', nombre: 'Ana López', email: 'ana@dominio.com' },
      { id: '3', nombre: 'Carlos Ruiz', email: 'carlos@dominio.com' }
    ];
    */
  }

  toggleSeleccion(row: any, checked: boolean) {
    row.activo = checked;
  }

  close() {
    this.dialogRef.close(false);
  }
  guardar(): void {
    this.loading = true;
    const responsablesActivos = this.dataSource.data.filter(r => r.activo).map(r => r.categoriaId);
    const areaId = this.data.equipoTrabajo;

    var request = {
      equipoTrabajoId: areaId,
      categorias: responsablesActivos
    }
    
    this.equipoTrabajoService.AsignarCategorias(request)
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.dialogRef.close(true);
        },
        error(err) {
          this.loading = false;
          this.alertService.showError('Error', err.error);
        },
      })
      
    console.log('Área:', this.dataSource.data);
    // Aquí puedes hacer el POST o PUT a tu API
  }
}