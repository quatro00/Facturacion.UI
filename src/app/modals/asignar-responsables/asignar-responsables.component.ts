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
import { AlertService } from 'app/services/alert.service';

@Component({
  selector: 'app-asignar-responsables',
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
  templateUrl: './asignar-responsables.component.html',
  styleUrl: './asignar-responsables.component.scss'
})
export class AsignarResponsablesComponent implements OnInit {

  displayedColumns: string[] = ['usuario', 'nombre', 'apellido', 'select'];
  dataSource = new MatTableDataSource<any>();
  responsablesSeleccionados = new Set<string>();
  loading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private areaService: AreaService,
    private alertService: AlertService,
    private dialogRef: MatDialogRef<AsignarResponsablesComponent>,
  ) { }


  ngOnInit(): void {
    // Aquí deberías hacer la llamada a tu API para obtener posibles responsables
    this.loading = true;
    this.areaService.GetResponsablesArea(this.data.area).subscribe((data) => {
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
    const responsablesActivos = this.dataSource.data.filter(r => r.activo).map(r => r.id);
    const areaId = this.data.area;

    var request = {
      areaId: areaId,
      responsables: responsablesActivos
    }

    this.areaService.AsignarResponsables(request)
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